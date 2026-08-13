import { fetchJson, fetchText, sleep } from "../http";
import { isUkLocation } from "../classify";
import { formatSalaryRange, parseSalary } from "../salary";
import { makeRaw, parseRssJobs, isoDate } from "./helpers";
import type { RawJob } from "./arbeitnow";

type SchemaJob = {
  title?: string;
  description?: string;
  datePosted?: string;
  url?: string;
  hiringOrganization?: { name?: string } | string;
  jobLocation?: {
    address?: { addressLocality?: string; addressRegion?: string; addressCountry?: string };
    name?: string;
  };
  baseSalary?: { value?: { value?: number; minValue?: number; maxValue?: number; unitText?: string }; currency?: string };
};

type MuseJob = {
  id?: number | string;
  name?: string;
  contents?: string;
  publication_date?: string;
  locations?: Array<{ name?: string }>;
  categories?: Array<{ name?: string }>;
  refs?: { landing_page?: string };
  company?: { name?: string };
};

type NomadJob = {
  url?: string;
  title?: string;
  description?: string;
  company?: string;
  company_name?: string;
  location?: string;
  region?: string;
  tags?: string[];
  all_tags?: string[];
  pub_date?: string;
  published?: string;
};

type LandingJob = {
  id?: number | string;
  title?: string;
  url?: string;
  remote?: boolean;
  published_at?: string;
  created_at?: string;
  role_description?: string;
  main_requirements?: string;
  nice_to_have?: string;
  currency_code?: string;
  gross_salary_low?: number;
  gross_salary_high?: number;
  tags?: string[];
  locations?: Array<{ city?: string; country?: string; country_code?: string }>;
};

function orgName(value: SchemaJob["hiringOrganization"]) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || "";
}

function schemaLocation(job: SchemaJob) {
  const address = job.jobLocation?.address;
  return [address?.addressLocality, address?.addressRegion, address?.addressCountry, job.jobLocation?.name]
    .filter(Boolean)
    .join(", ");
}

export async function fetchTeachingVacancies(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  const seen = new Set<string>();
  const maxPages = 10;
  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const data = await fetchJson<{ data?: SchemaJob[]; meta?: { totalPages?: number } }>(
        `https://teaching-vacancies.service.gov.uk/api/v1/jobs.json?page=${page}`,
        {},
        60_000
      );
      const rows = data.data ?? [];
      if (rows.length === 0) break;
      for (const job of rows) {
        const company = orgName(job.hiringOrganization);
        const location = schemaLocation(job) || "England";
        const description = job.description || "";
        const salary = formatSalaryRange(
          job.baseSalary?.value?.minValue ?? job.baseSalary?.value?.value,
          job.baseSalary?.value?.maxValue,
          job.baseSalary?.currency || "GBP"
        );
        const row = makeRaw({
          source: "teaching-vacancies",
          id: job.url || `${company}-${job.title}`,
          url: job.url || "https://teaching-vacancies.service.gov.uk/",
          title: job.title || "",
          company,
          location,
          description,
          salary: salary || parseSalary(description),
          postedAt: isoDate(job.datePosted),
          tags: ["education"],
        });
        if (row && !seen.has(row.id)) {
          seen.add(row.id);
          out.push(row);
        }
      }
      if (page >= (data.meta?.totalPages || page)) break;
    } catch {
      break;
    }
    await sleep(250);
  }
  return out;
}

const MUSE_LOCATIONS = [
  "London, United Kingdom",
  "Manchester, United Kingdom",
  "Birmingham, United Kingdom",
  "Edinburgh, United Kingdom",
  "Bristol, United Kingdom",
  "Leeds, United Kingdom",
  "Glasgow, United Kingdom",
  "Cambridge, United Kingdom",
  "Oxford, United Kingdom",
  "Belfast, United Kingdom",
];

export async function fetchMuseJobs(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  const seen = new Set<string>();
  for (const location of MUSE_LOCATIONS) {
    const pages = location.startsWith("London") ? 8 : 3;
    for (let page = 0; page < pages; page += 1) {
      const url =
        `https://www.themuse.com/api/public/jobs?page=${page}` +
        `&location=${encodeURIComponent(location)}&descending=true`;
      const data = await fetchJson<{ results?: MuseJob[] }>(url, {}, 30_000);
      const rows = data.results ?? [];
      if (rows.length === 0) break;
      for (const job of rows) {
        const id = String(job.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const loc = (job.locations || []).map((item) => item.name || "").filter(Boolean).join(", ");
        const description = job.contents || "";
        const row = makeRaw({
          source: "themuse",
          id,
          url: job.refs?.landing_page || `https://www.themuse.com/jobs/${id}`,
          title: job.name || "",
          company: job.company?.name || "",
          location: loc || location,
          description,
          tags: (job.categories || []).map((item) => item.name || "").filter(Boolean),
          salary: parseSalary(description),
          postedAt: isoDate(job.publication_date),
        });
        if (row) out.push(row);
      }
      await sleep(120);
    }
  }
  return out;
}

export async function fetchWeWorkRemotelyJobs(): Promise<RawJob[]> {
  const feeds = [
    "https://weworkremotely.com/remote-jobs.rss",
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
  ];
  const out: RawJob[] = [];
  const seen = new Set<string>();
  for (const feed of feeds) {
    try {
      const xml = await fetchText(feed, { headers: { accept: "application/rss+xml, text/xml" } }, 30_000);
      for (const job of parseRssJobs(xml, "weworkremotely")) {
        if (seen.has(job.id)) continue;
        const hay = `${job.title} ${job.company} ${job.location} ${job.description}`;
        if (!isUkLocation(job.location, job.description) && !/sponsor|skilled worker|visa/i.test(hay)) continue;
        seen.add(job.id);
        out.push(job);
      }
    } catch {
      // Keep other feeds if one RSS URL fails.
    }
  }
  return out;
}

export async function fetchWorkingNomadsJobs(): Promise<RawJob[]> {
  const rows = await fetchJson<NomadJob[]>("https://www.workingnomads.com/api/exposed_jobs/", {}, 40_000);
  const out: RawJob[] = [];
  for (const job of rows ?? []) {
    const location = job.location || job.region || "Remote";
    const description = job.description || "";
    if (!isUkLocation(location, description) && !/\b(uk|united kingdom|london)\b/i.test(`${job.title} ${description}`)) {
      continue;
    }
    const row = makeRaw({
      source: "workingnomads",
      id: job.url || `${job.company}-${job.title}`,
      url: job.url || "",
      title: job.title || "",
      company: job.company || job.company_name || "",
      location,
      remote: true,
      description,
      tags: job.tags || job.all_tags || [],
      salary: parseSalary(description),
      postedAt: isoDate(job.pub_date || job.published),
    });
    if (row) out.push(row);
  }
  return out;
}

export async function fetchLandingJobs(): Promise<RawJob[]> {
  const rows = await fetchJson<LandingJob[]>("https://landing.jobs/api/v1/jobs?limit=150", {}, 40_000);
  const out: RawJob[] = [];
  for (const job of rows ?? []) {
    const places = job.locations || [];
    const location = places.map((item) => [item.city, item.country || item.country_code].filter(Boolean).join(", ")).join(" · ");
    const description = [job.role_description, job.main_requirements, job.nice_to_have].filter(Boolean).join("\n");
    const uk = places.some((item) => /GB|UK/i.test(item.country_code || item.country || ""));
    if (!uk && !isUkLocation(location, description)) continue;
    const slug = (job.url || "").match(/landing\.jobs\/at\/([^/]+)/i)?.[1] || "";
    const company = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const row = makeRaw({
      source: "landingjobs",
      id: String(job.id || job.url || job.title),
      url: job.url || `https://landing.jobs/at/${job.id}`,
      title: job.title || "",
      company,
      location: location || "United Kingdom",
      remote: Boolean(job.remote),
      description,
      tags: job.tags || [],
      salary:
        formatSalaryRange(job.gross_salary_low, job.gross_salary_high, job.currency_code || "EUR") ||
        parseSalary(description),
      postedAt: isoDate(job.published_at || job.created_at),
    });
    if (row) out.push(row);
  }
  return out;
}
