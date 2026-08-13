import { fetchJson } from "../http";
import { snippet } from "../html";
import { slugify } from "../normalize";
import { formatSalaryRange, parseSalary } from "../salary";
import type { RawJob } from "./arbeitnow";

type HimalayaJob = {
  title?: string;
  companyName?: string;
  description?: string;
  excerpt?: string;
  applicationLink?: string;
  guid?: string;
  pubDate?: number | string;
  locationRestrictions?: string[];
  categories?: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryPeriod?: string;
  employmentType?: string;
};

type HimalayaPage = { jobs?: HimalayaJob[]; totalCount?: number };

type RemotiveJob = {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  description?: string;
  candidate_required_location?: string;
  publication_date?: string;
  job_type?: string;
  tags?: string[];
};

type JobicyJob = {
  id?: number | string;
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  jobGeo?: string;
  pubDate?: string;
  jobType?: string;
  jobIndustry?: string[];
};

function ukText(...parts: Array<string | string[] | undefined>) {
  return parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isUk(...parts: Array<string | string[] | undefined>) {
  return /\b(uk|united kingdom|great britain|england|scotland|wales|london|manchester|birmingham|gb)\b/i.test(
    ukText(...parts)
  );
}

export async function fetchHimalayasJobs(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (const offset of [0, 100, 200]) {
    const data = await fetchJson<HimalayaPage>(
      `https://himalayas.app/jobs/api?limit=100&offset=${offset}`
    );
    for (const job of data.jobs ?? []) {
      if (!job.title || !job.companyName) continue;
      if (!isUk(job.locationRestrictions, job.description, job.excerpt, job.title)) continue;
      const description = (job.description || job.excerpt || "").slice(0, 12_000);
      out.push({
        id: `himalayas-${slugify(job.guid || `${job.companyName}-${job.title}`)}`,
        source: "himalayas",
        sourceUrl: job.applicationLink || "",
        title: job.title.trim(),
        company: job.companyName.trim(),
        location: (job.locationRestrictions || []).join(", ") || "United Kingdom",
        remote: true,
        tags: job.categories ?? [],
        jobTypes: job.employmentType ? [job.employmentType] : [],
        description,
        snippet: snippet(description),
        salary:
          formatSalaryRange(job.minSalary, job.maxSalary, job.currency || "USD", job.salaryPeriod) ||
          parseSalary(description),
        postedAt: job.pubDate ? new Date(job.pubDate).toISOString() : null,
      });
    }
  }
  return out;
}

export async function fetchRemotiveJobs(): Promise<RawJob[]> {
  const data = await fetchJson<{ jobs?: RemotiveJob[] }>("https://remotive.com/api/remote-jobs");
  const out: RawJob[] = [];
  for (const job of data.jobs ?? []) {
    if (!job.title || !job.company_name) continue;
    const loc = job.candidate_required_location || "";
    if (!isUk(loc, job.description, job.title) && !/worldwide|anywhere/i.test(loc)) continue;
    if (!/sponsor|skilled worker|visa/i.test(`${job.title} ${job.description || ""}`) && !isUk(loc)) {
      continue;
    }
    const description = (job.description || "").slice(0, 12_000);
    out.push({
      id: `remotive-${job.id || slugify(job.title)}`,
      source: "remotive",
      sourceUrl: job.url || "",
      title: job.title.trim(),
      company: job.company_name.trim(),
      location: loc || "Remote",
      remote: true,
      tags: job.tags ?? [],
      jobTypes: job.job_type ? [job.job_type] : [],
      description,
      snippet: snippet(description),
      salary: parseSalary(description),
      postedAt: job.publication_date || null,
    });
  }
  return out;
}

export async function fetchJobicyJobs(): Promise<RawJob[]> {
  const data = await fetchJson<{ jobs?: JobicyJob[] }>(
    "https://jobicy.com/api/v2/remote-jobs?count=100&geo=uk"
  );
  const out: RawJob[] = [];
  for (const job of data.jobs ?? []) {
    if (!job.jobTitle || !job.companyName) continue;
    const description = (job.jobDescription || job.jobExcerpt || "").slice(0, 12_000);
    out.push({
      id: `jobicy-${job.id || slugify(job.jobTitle)}`,
      source: "jobicy",
      sourceUrl: job.url || "",
      title: job.jobTitle.trim(),
      company: job.companyName.trim(),
      location: job.jobGeo || "United Kingdom",
      remote: true,
      tags: job.jobIndustry ?? [],
      jobTypes: job.jobType ? [job.jobType] : [],
      description,
      snippet: snippet(description),
      salary: parseSalary(description),
      postedAt: job.pubDate || null,
    });
  }
  return out;
}

export async function fetchExtraBoardJobs() {
  const [himalayas, remotive, jobicy] = await Promise.allSettled([
    fetchHimalayasJobs(),
    fetchRemotiveJobs(),
    fetchJobicyJobs(),
  ]);
  return [
    ...(himalayas.status === "fulfilled" ? himalayas.value : []),
    ...(remotive.status === "fulfilled" ? remotive.value : []),
    ...(jobicy.status === "fulfilled" ? jobicy.value : []),
  ];
}
