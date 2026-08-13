import { fetchJson, sleep } from "../http";
import { snippet } from "../html";
import { slugify } from "../normalize";
import type { Job } from "../types";

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location: string;
  created_at: number;
};

type ArbeitnowPage = {
  data: ArbeitnowJob[];
  links?: { next?: string | null };
};

export type RawJob = Omit<
  Job,
  "confidence" | "mentionsSponsorship" | "skilledWorkerMention" | "sponsor" | "sponsorSlug" | "matchScore" | "category"
>;

function toPartial(job: ArbeitnowJob, source: string): RawJob {
  const description = (job.description || "").slice(0, 12_000);
  return {
    id: `${source}-${slugify(job.slug || `${job.company_name}-${job.title}`)}`,
    source,
    sourceUrl: job.url,
    title: job.title.trim(),
    company: job.company_name.trim(),
    location: job.location || "United Kingdom",
    remote: Boolean(job.remote) || /remote/i.test(job.location || "") || /remote/i.test(job.title),
    tags: job.tags ?? [],
    jobTypes: job.job_types ?? [],
    description,
    snippet: snippet(description),
    salary: null,
    postedAt: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
  };
}

async function paginate(url: string, maxPages: number, source: string) {
  const out: RawJob[] = [];
  let next: string | null = url;
  let page = 0;
  while (next && page < maxPages) {
    const data: ArbeitnowPage = await fetchJson<ArbeitnowPage>(next);
    const rows = data.data ?? [];
    if (rows.length === 0) break;
    for (const job of rows) {
      if (job.title && job.company_name) out.push(toPartial(job, source));
    }
    next = data.links?.next || null;
    page += 1;
    if (next) await sleep(200);
  }
  return out;
}

export async function fetchArbeitnowJobs() {
  const [visaUk, allUk, visaEu, allEu] = await Promise.all([
    paginate(
      "https://www.arbeitnow.co.uk/api/job-board-api?visa_sponsorship=true",
      5,
      "arbeitnow-uk"
    ),
    paginate("https://www.arbeitnow.co.uk/api/job-board-api", 32, "arbeitnow-uk"),
    paginate(
      "https://www.arbeitnow.com/api/job-board-api?visa_sponsorship=true",
      5,
      "arbeitnow-eu"
    ),
    paginate("https://www.arbeitnow.com/api/job-board-api", 8, "arbeitnow-eu"),
  ]);

  const ukish = [...visaEu, ...allEu].filter((job) =>
    /\b(uk|united kingdom|england|scotland|wales|london|manchester|birmingham|edinburgh|glasgow|bristol|leeds|remote)\b/i.test(
      `${job.location} ${job.title} ${job.description.slice(0, 400)}`
    )
  );

  return [...visaUk, ...allUk, ...ukish];
}
