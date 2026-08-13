import { fetchJson, sleep } from "../http";
import { stripHtml, snippet } from "../html";
import { slugify } from "../normalize";
import { formatSalaryRange, parseSalary } from "../salary";
import type { Job } from "../types";

type AdzunaJob = {
  id: string | number;
  title: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  contract_type?: string;
  category?: { label?: string };
  salary_min?: number;
  salary_max?: number;
};

type AdzunaPage = { results?: AdzunaJob[] };

const QUERIES = [
  "visa sponsorship",
  '"skilled worker visa"',
  '"certificate of sponsorship"',
  "sponsorship available",
  "skilled worker",
  "tier 2 visa",
  "health and care visa",
];

export async function fetchAdzunaJobs() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const out: Omit<
    Job,
    "confidence" | "mentionsSponsorship" | "skilledWorkerMention" | "sponsor" | "sponsorSlug" | "matchScore" | "category"
  >[] = [];

  for (const what of QUERIES) {
    for (let page = 1; page <= 3; page += 1) {
      const url =
        `https://api.adzuna.com/v1/api/jobs/gb/search/${page}` +
        `?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}` +
        `&results_per_page=50&what=${encodeURIComponent(what)}` +
        `&max_days_old=21&sort_by=date&content-type=application/json`;
      const data = await fetchJson<AdzunaPage>(url);
      for (const job of data.results ?? []) {
        const company = job.company?.display_name?.trim();
        const title = job.title?.trim();
        if (!company || !title) continue;
        const description = stripHtml(job.description || "").slice(0, 12_000);
        out.push({
          id: `adzuna-${job.id}`,
          source: "adzuna",
          sourceUrl: job.redirect_url || "",
          title,
          company,
          location: job.location?.display_name || "United Kingdom",
          remote: /remote/i.test(`${title} ${job.location?.display_name || ""}`),
          tags: job.category?.label ? [job.category.label] : [],
          jobTypes: job.contract_type ? [job.contract_type] : [],
          description,
          snippet: snippet(description),
          salary:
            formatSalaryRange(job.salary_min, job.salary_max, "GBP") || parseSalary(description),
          postedAt: job.created || null,
        });
      }
      await sleep(200);
    }
  }

  return out;
}
