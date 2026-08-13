import type { Confidence, Job, JobCategory, Sponsor } from "./types";

export type JobQuery = {
  q?: string;
  location?: string;
  category?: JobCategory | "all";
  remote?: boolean;
  salary?: boolean;
  confidence?: Confidence | "all" | "sponsoring";
  page?: number;
  pageSize?: number;
};

export type JobFacets = {
  categories: Record<JobCategory, number>;
  confidence: Record<"all" | Confidence | "sponsoring", number>;
  remote: number;
  salary: number;
  cities: Array<{ name: string; count: number }>;
};

function matchesText(job: Job, q: string, loc: string) {
  if (loc && !`${job.location} ${job.sponsor?.city || ""}`.toLowerCase().includes(loc)) return false;
  if (q) {
    const hay = `${job.title} ${job.company} ${job.location} ${job.tags.join(" ")} ${job.snippet}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function cityName(job: Job) {
  return (job.location.split(",")[0] || job.sponsor?.city || "UK").trim() || "UK";
}

export function searchJobs(jobs: Job[], query: JobQuery) {
  const q = query.q?.trim().toLowerCase() || "";
  const loc = query.location?.trim().toLowerCase() || "";
  const page = Math.max(1, query.page || 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize || 20));

  const textMatched = jobs.filter((job) => matchesText(job, q, loc));

  const categories = {
    software: 0,
    data: 0,
    healthcare: 0,
    engineering: 0,
    finance: 0,
    education: 0,
    hospitality: 0,
    construction: 0,
    legal: 0,
    science: 0,
    sales: 0,
    other: 0,
  } as Record<JobCategory, number>;
  const confidence = { all: textMatched.length, confirmed: 0, claimed: 0, licensed: 0, sponsoring: 0 };
  const cities = new Map<string, number>();
  let remote = 0;
  let salary = 0;

  for (const job of textMatched) {
    categories[job.category] += 1;
    confidence[job.confidence] += 1;
    if (job.confidence !== "licensed") confidence.sponsoring += 1;
    if (job.remote) remote += 1;
    if (job.salary) salary += 1;
    const city = cityName(job);
    cities.set(city, (cities.get(city) || 0) + 1);
  }

  const filtered = textMatched.filter((job) => {
    if (query.confidence === "sponsoring") {
      if (job.confidence === "licensed") return false;
    } else if (query.confidence && query.confidence !== "all" && job.confidence !== query.confidence) {
      return false;
    }
    if (query.category && query.category !== "all" && job.category !== query.category) {
      return false;
    }
    if (query.remote && !job.remote) return false;
    if (query.salary && !job.salary) return false;
    return true;
  });

  const start = (page - 1) * pageSize;
  return {
    total: filtered.length,
    page,
    pageSize,
    jobs: filtered.slice(start, start + pageSize),
    facets: {
      categories,
      confidence,
      remote,
      salary,
      cities: [...cities.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count })),
    } satisfies JobFacets,
  };
}

export function searchSponsors(
  sponsors: Sponsor[],
  opts: {
    q?: string;
    city?: string;
    rating?: string;
    hiring?: boolean;
    page?: number;
    pageSize?: number;
  }
) {
  const query = (opts.q || "").trim().toLowerCase();
  const loc = (opts.city || "").trim().toLowerCase();
  const rating = (opts.rating || "all").toUpperCase();
  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(60, Math.max(1, opts.pageSize || 24));

  const filtered = sponsors.filter((s) => {
    if (opts.hiring && s.jobCount < 1) return false;
    if (rating !== "ALL" && s.rating !== rating) return false;
    if (query && !`${s.name} ${s.city} ${s.county}`.toLowerCase().includes(query)) return false;
    if (loc && !`${s.city} ${s.county}`.toLowerCase().includes(loc)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (b.jobCount !== a.jobCount) return b.jobCount - a.jobCount;
    if ((b.lastJobAt || "") !== (a.lastJobAt || "")) return (b.lastJobAt || "").localeCompare(a.lastJobAt || "");
    return a.name.localeCompare(b.name);
  });

  const start = (page - 1) * pageSize;
  return {
    total: filtered.length,
    page,
    pageSize,
    hiringCount: sponsors.filter((s) => s.jobCount > 0).length,
    sponsors: filtered.slice(start, start + pageSize),
  };
}

export function getJob(jobs: Job[], id: string) {
  return jobs.find((job) => job.id === id) || null;
}

export function relatedJobs(jobs: Job[], current: Job, limit = 4): Job[] {
  const city = (current.location.split(",")[0] || "").trim().toLowerCase();
  return jobs
    .filter((job) => job.id !== current.id)
    .map((job) => {
      let score = 0;
      if (current.sponsorSlug && job.sponsorSlug === current.sponsorSlug) score += 6;
      if (job.company.toLowerCase() === current.company.toLowerCase()) score += 5;
      if (job.category === current.category) score += 2;
      if (city && job.location.toLowerCase().includes(city)) score += 1;
      if (job.confidence === "confirmed") score += 1;
      return { job, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || (b.job.postedAt || "").localeCompare(a.job.postedAt || ""))
    .slice(0, limit)
    .map((row) => row.job);
}
