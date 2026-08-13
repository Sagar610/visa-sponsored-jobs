import { fetchJson, sleep } from "../http";
import { stripHtml, snippet } from "../html";
import { formatSalaryRange, parseSalary } from "../salary";
import type { Job } from "../types";

type ReedJob = {
  jobId: number;
  employerName?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobUrl?: string;
  locationName?: string;
  date?: string;
  contractType?: string;
  minimumSalary?: number;
  maximumSalary?: string | number;
};

type ReedPage = { results?: ReedJob[] };

const KEYWORDS = [
  "visa sponsorship",
  "skilled worker visa",
  "certificate of sponsorship",
  "skilled worker",
  "tier 2 visa",
  "health and care visa",
];

export async function fetchReedJobs() {
  const key = process.env.REED_API_KEY;
  if (!key) return [];

  const auth = Buffer.from(`${key}:`).toString("base64");
  const out: Omit<
    Job,
    "confidence" | "mentionsSponsorship" | "skilledWorkerMention" | "sponsor" | "sponsorSlug" | "matchScore" | "category"
  >[] = [];

  for (const keywords of KEYWORDS) {
    const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}&resultsToTake=100`;
    const data = await fetchJson<ReedPage>(url, {
      headers: { authorization: `Basic ${auth}` },
    });
    for (const job of data.results ?? []) {
      const company = job.employerName?.trim();
      const title = job.jobTitle?.trim();
      if (!company || !title) continue;
      const description = stripHtml(job.jobDescription || "").slice(0, 12_000);
      out.push({
        id: `reed-${job.jobId}`,
        source: "reed",
        sourceUrl: job.jobUrl || `https://www.reed.co.uk/jobs/${job.jobId}`,
        title,
        company,
        location: job.locationName || "United Kingdom",
        remote: /remote/i.test(`${title} ${job.locationName || ""}`),
        tags: [],
        jobTypes: job.contractType ? [job.contractType] : [],
        description,
        snippet: snippet(description),
        salary:
          formatSalaryRange(
            job.minimumSalary ?? null,
            typeof job.maximumSalary === "number" ? job.maximumSalary : Number(job.maximumSalary) || null,
            "GBP"
          ) || parseSalary(description),
        postedAt: job.date || null,
      });
    }
    await sleep(200);
  }

  return out;
}
