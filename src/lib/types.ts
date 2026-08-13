export type Confidence = "confirmed" | "licensed" | "claimed";

export type JobCategory =
  | "software"
  | "data"
  | "healthcare"
  | "engineering"
  | "finance"
  | "education"
  | "hospitality"
  | "construction"
  | "legal"
  | "science"
  | "sales"
  | "other";

export type Sponsor = {
  name: string;
  slug: string;
  city: string;
  county: string;
  rating: string;
  type: string;
  routes: string[];
  jobCount: number;
  lastJobAt: string | null;
  categories: JobCategory[];
};

export type Job = {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  category: JobCategory;
  tags: string[];
  jobTypes: string[];
  description: string;
  snippet: string;
  salary: string | null;
  postedAt: string | null;
  confidence: Confidence;
  mentionsSponsorship: boolean;
  skilledWorkerMention: boolean;
  sponsor: Sponsor | null;
  sponsorSlug: string | null;
  matchScore: number;
};

export type CompanyBrief = {
  summary: string | null;
  wikipediaUrl: string | null;
  thumbnail: string | null;
  description: string | null;
};

export type NewsKind = "official" | "news";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: "govuk" | "bbc" | "guardian";
  sourceName: string;
  publishedAt: string;
  kind: NewsKind;
};

export type SyncMeta = {
  lastSyncAt: string | null;
  lastNewsSyncAt: string | null;
  lastSyncOk: boolean;
  lastError: string | null;
  durationMs: number;
  sources: Record<string, { ok: boolean; count: number; error?: string }>;
  sponsorCount: number;
  jobCount: number;
  confirmedCount: number;
  newsCount: number;
  registerUpdatedAt: string | null;
  registerFilename: string | null;
};

export type StoreShape = {
  meta: SyncMeta;
  jobs: Job[];
  sponsors: Sponsor[];
};
