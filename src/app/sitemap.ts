import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { loadStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { jobs, sponsors, meta } = await loadStore();
  const lastMod = meta.lastSyncAt ? new Date(meta.lastSyncAt) : new Date();
  const newsMod = meta.lastNewsSyncAt ? new Date(meta.lastNewsSyncAt) : lastMod;

  return [
    { url: base, lastModified: lastMod, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/jobs`, lastModified: lastMod, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/sponsors`, lastModified: lastMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/news`, lastModified: newsMod, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/guide`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/disclaimer`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.3 },
    ...jobs.slice(0, 400).map((job) => ({
      url: `${base}/jobs/${encodeURIComponent(job.id)}`,
      lastModified: job.postedAt ? new Date(job.postedAt) : lastMod,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...sponsors
      .filter((sponsor) => sponsor.jobCount > 0)
      .slice(0, 300)
      .map((sponsor) => ({
        url: `${base}/sponsors/${encodeURIComponent(sponsor.slug)}`,
        lastModified: sponsor.lastJobAt ? new Date(sponsor.lastJobAt) : lastMod,
        changeFrequency: "daily" as const,
        priority: 0.5,
      })),
  ];
}
