import { fetchJson } from "../http";
import { stripHtml, snippet } from "../html";
import { slugify } from "../normalize";
import { parseSalary } from "../salary";
import type { Job } from "../types";

type RemoteOkJob = {
  id?: string | number;
  slug?: string;
  position?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  date?: string;
  tags?: string[];
};

export async function fetchRemoteOkJobs() {
  const rows = await fetchJson<RemoteOkJob[]>("https://remoteok.com/api");
  const out: Omit<
    Job,
    "confidence" | "mentionsSponsorship" | "skilledWorkerMention" | "sponsor" | "sponsorSlug" | "matchScore" | "category"
  >[] = [];

  for (const job of rows) {
    if (!job.position || !job.company) continue;
    const hay = `${job.position} ${job.location || ""} ${job.description || ""} ${ (job.tags || []).join(" ") }`;
    const uk =
      /\b(uk|united kingdom|london|england|scotland|wales)\b/i.test(hay) ||
      /visa/i.test(hay);
    if (!uk) continue;
    if (!/sponsor|skilled worker|visa/i.test(hay)) continue;

    const description = stripHtml(job.description || "").slice(0, 12_000);
    out.push({
      id: `remoteok-${job.slug || job.id || slugify(job.position)}`,
      source: "remoteok",
      sourceUrl: job.url || `https://remoteok.com/remote-jobs/${job.slug || ""}`,
      title: job.position.trim(),
      company: job.company.trim(),
      location: job.location || "Remote",
      remote: true,
      tags: job.tags ?? [],
      jobTypes: [],
      description,
      snippet: snippet(description),
      salary: parseSalary(description),
      postedAt: job.date || null,
    });
  }

  return out;
}
