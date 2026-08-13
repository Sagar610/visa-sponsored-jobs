import { slugify, unique } from "./normalize";
import type { Job, JobCategory, Sponsor } from "./types";

export function assignSlugs(sponsors: Sponsor[]): Sponsor[] {
  const used = new Set<string>();
  return sponsors.map((sponsor) => {
    let slug = slugify(sponsor.name) || "sponsor";
    if (used.has(slug)) {
      const city = slugify(sponsor.city);
      slug = city ? `${slug}-${city}` : slug;
    }
    const base = slug;
    let n = 2;
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
    return {
      ...sponsor,
      slug,
      jobCount: sponsor.jobCount || 0,
      lastJobAt: sponsor.lastJobAt || null,
      categories: sponsor.categories || [],
    };
  });
}

export function attachJobs(sponsors: Sponsor[], jobs: Job[]): { sponsors: Sponsor[]; jobs: Job[] } {
  const byName = new Map(sponsors.map((s) => [s.name.toLowerCase(), s]));
  const stats = new Map<
    string,
    { count: number; lastJobAt: string | null; categories: Set<JobCategory> }
  >();

  const jobsOut = jobs.map((job) => {
    const matched = job.sponsor ? byName.get(job.sponsor.name.toLowerCase()) : undefined;
    if (!matched) return { ...job, sponsorSlug: job.sponsorSlug ?? null };
    const current = stats.get(matched.slug) ?? {
      count: 0,
      lastJobAt: null as string | null,
      categories: new Set<JobCategory>(),
    };
    current.count += 1;
    current.categories.add(job.category);
    if (job.postedAt && (!current.lastJobAt || job.postedAt > current.lastJobAt)) {
      current.lastJobAt = job.postedAt;
    }
    stats.set(matched.slug, current);
    return { ...job, sponsor: matched, sponsorSlug: matched.slug };
  });

  const sponsorsOut = sponsors.map((sponsor) => {
    const current = stats.get(sponsor.slug);
    return {
      ...sponsor,
      jobCount: current?.count ?? 0,
      lastJobAt: current?.lastJobAt ?? null,
      categories: current ? [...current.categories] : [],
    };
  });

  return { sponsors: sponsorsOut, jobs: jobsOut };
}

export function getSponsorBySlug(sponsors: Sponsor[], slug: string) {
  return sponsors.find((s) => s.slug === slug) || null;
}

export function jobsForSponsor(jobs: Job[], sponsor: Sponsor) {
  return jobs.filter(
    (job) =>
      job.sponsorSlug === sponsor.slug ||
      job.sponsor?.name.toLowerCase() === sponsor.name.toLowerCase()
  );
}

export function initials(name: string) {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
  return letters.join("") || "SJ";
}

export function uniqueLocations(jobs: Job[]) {
  return unique(jobs.map((job) => job.location.split(",")[0]?.trim()).filter(Boolean) as string[]).slice(0, 8);
}
