import { classifyCategory, classifySponsorship, isUkLocation, UK_NATIVE_SOURCES } from "./classify";
import { fetchAdzunaJobs } from "./ingest/adzuna";
import { fetchArbeitnowJobs } from "./ingest/arbeitnow";
import { fetchHimalayasJobs, fetchJobicyJobs, fetchRemotiveJobs } from "./ingest/boards";
import { fetchAtsJobs } from "./ingest/ats";
import {
  fetchLandingJobs,
  fetchMuseJobs,
  fetchTeachingVacancies,
  fetchWeWorkRemotelyJobs,
  fetchWorkingNomadsJobs,
} from "./ingest/uk-feeds";
import { fetchLicensedSponsors } from "./ingest/govuk";
import { fetchReedJobs } from "./ingest/reed";
import { fetchRemoteOkJobs } from "./ingest/remoteok";
import { buildSponsorIndex, matchSponsor } from "./match";
import { saveStore } from "./store";
import { assignSlugs, attachJobs } from "./sponsors";
import { parseSalary } from "./salary";
import { saveNews } from "./news-store";
import { fetchVisaNews } from "./ingest/news";
import type { Confidence, Job, SyncMeta } from "./types";

type RawJob = Omit<
  Job,
  "confidence" | "mentionsSponsorship" | "skilledWorkerMention" | "sponsor" | "sponsorSlug" | "matchScore" | "category"
>;

let running: Promise<SyncMeta> | null = null;

function finalize(raw: RawJob, sponsorsIndex: ReturnType<typeof buildSponsorIndex>): Job | null {
  const hay = `${raw.title}\n${raw.company}\n${raw.location}\n${raw.description}`;
  if (!UK_NATIVE_SOURCES.has(raw.source) && !isUkLocation(raw.location, raw.description)) return null;

  const { negative, mentionsSponsorship, skilledWorkerMention } = classifySponsorship(hay);
  if (negative && !mentionsSponsorship && !skilledWorkerMention) return null;

  const matched = matchSponsor(raw.company, sponsorsIndex);
  const licensed = Boolean(matched);

  if (negative && licensed && !mentionsSponsorship) return null;

  let confidence: Confidence | null = null;
  if ((mentionsSponsorship || skilledWorkerMention) && licensed && !negative) {
    confidence = "confirmed";
  } else if ((mentionsSponsorship || skilledWorkerMention) && !negative) {
    confidence = "claimed";
  } else if (licensed && !negative) {
    confidence = "licensed";
  }

  if (!confidence) return null;

  return {
    ...raw,
    salary: raw.salary || parseSalary(`${raw.title}\n${raw.description}`),
    category: classifyCategory(raw.title, raw.tags, raw.description),
    mentionsSponsorship: mentionsSponsorship || skilledWorkerMention,
    skilledWorkerMention,
    sponsor: matched?.sponsor ?? null,
    sponsorSlug: matched?.sponsor.slug ?? null,
    matchScore: matched?.score ?? 0,
    confidence,
  };
}

async function runSource<T>(
  name: string,
  sources: SyncMeta["sources"],
  fn: () => Promise<T[]>,
  mapCount: (rows: T[]) => number = (rows) => rows.length
): Promise<T[]> {
  try {
    const rows = await fn();
    sources[name] = { ok: true, count: mapCount(rows) };
    return rows;
  } catch (error) {
    sources[name] = {
      ok: false,
      count: 0,
      error: error instanceof Error ? error.message : String(error),
    };
    return [];
  }
}

export async function syncAll(): Promise<SyncMeta> {
  if (running) return running;
  running = (async () => {
    const started = Date.now();
    const sources: SyncMeta["sources"] = {};

    const register = await runSource("govuk-register", sources, async () => {
      const result = await fetchLicensedSponsors();
      return [result];
    });
    const registerResult = register[0];
    if (!registerResult) {
      const news = await runSource("visa-news", sources, fetchVisaNews);
      await saveNews(news);
      const meta: SyncMeta = {
        lastSyncAt: new Date().toISOString(),
        lastNewsSyncAt: new Date().toISOString(),
        lastSyncOk: false,
        lastError: sources["govuk-register"]?.error || "Failed to download Home Office register",
        durationMs: Date.now() - started,
        sources,
        sponsorCount: 0,
        jobCount: 0,
        confirmedCount: 0,
        newsCount: news.length,
        registerUpdatedAt: null,
        registerFilename: null,
      };
      return meta;
    }

    const sponsors = assignSlugs(registerResult.sponsors);
    const index = buildSponsorIndex(sponsors);

    const [
      arbeitnow,
      adzuna,
      reed,
      remoteok,
      himalayas,
      remotive,
      jobicy,
      teaching,
      muse,
      wwr,
      nomads,
      landing,
      ats,
      news,
    ] = await Promise.all([
      runSource("arbeitnow", sources, fetchArbeitnowJobs),
      runSource("adzuna", sources, fetchAdzunaJobs),
      runSource("reed", sources, fetchReedJobs),
      runSource("remoteok", sources, fetchRemoteOkJobs),
      runSource("himalayas", sources, fetchHimalayasJobs),
      runSource("remotive", sources, fetchRemotiveJobs),
      runSource("jobicy", sources, fetchJobicyJobs),
      runSource("teaching-vacancies", sources, fetchTeachingVacancies),
      runSource("themuse", sources, fetchMuseJobs),
      runSource("weworkremotely", sources, fetchWeWorkRemotelyJobs),
      runSource("workingnomads", sources, fetchWorkingNomadsJobs),
      runSource("landingjobs", sources, fetchLandingJobs),
      runSource("ats-boards", sources, fetchAtsJobs),
      runSource("visa-news", sources, fetchVisaNews),
    ]);

    const seen = new Set<string>();
    const jobs: Job[] = [];
    for (const raw of [
      ...arbeitnow,
      ...adzuna,
      ...reed,
      ...remoteok,
      ...himalayas,
      ...remotive,
      ...jobicy,
      ...teaching,
      ...muse,
      ...wwr,
      ...nomads,
      ...landing,
      ...ats,
    ]) {
      const key = `${raw.company.toLowerCase()}|${raw.title.toLowerCase()}`;
      if (seen.has(key) || seen.has(raw.id)) continue;
      const job = finalize(raw, index);
      if (!job) continue;
      seen.add(key);
      seen.add(job.id);
      jobs.push(job);
    }

    const linked = attachJobs(sponsors, jobs);
    linked.jobs.sort((a, b) => {
      const rank = { confirmed: 0, claimed: 1, licensed: 2 };
      const r = rank[a.confidence] - rank[b.confidence];
      if (r !== 0) return r;
      return (b.postedAt || "").localeCompare(a.postedAt || "");
    });

    await saveNews(news);

    const meta: SyncMeta = {
      lastSyncAt: new Date().toISOString(),
      lastNewsSyncAt: new Date().toISOString(),
      lastSyncOk: true,
      lastError: null,
      durationMs: Date.now() - started,
      sources,
      sponsorCount: linked.sponsors.length,
      jobCount: linked.jobs.length,
      confirmedCount: linked.jobs.filter((j) => j.confidence === "confirmed").length,
      newsCount: news.length,
      registerUpdatedAt: registerResult.updatedAt,
      registerFilename: registerResult.filename,
    };

    await saveStore({ meta, jobs: linked.jobs, sponsors: linked.sponsors });
    return meta;
  })();

  try {
    return await running;
  } finally {
    running = null;
  }
}
