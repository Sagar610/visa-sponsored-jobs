import { fetchJson, sleep } from "../http";
import { isUkLocation } from "../classify";
import { parseSalary } from "../salary";
import { makeRaw, isoDate } from "./helpers";
import type { RawJob } from "./arbeitnow";

type GreenhouseJob = {
  id?: number | string;
  title?: string;
  absolute_url?: string;
  updated_at?: string;
  first_published?: string;
  location?: { name?: string };
  offices?: Array<{ name?: string; location?: string }>;
  content?: string;
};

type LeverJob = {
  id?: string;
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  descriptionPlain?: string;
  description?: string;
  categories?: { location?: string; commitment?: string; team?: string };
};

const GREENHOUSE_BOARDS = [
  "wise",
  "monzo",
  "gocardless",
  "skyscanner",
  "tide",
  "deepmind",
  "stripe",
  "figma",
  "cloudflare",
  "intercom",
  "datadog",
  "twilio",
  "gds",
  "anthropic",
  "airbnb",
  "bcg",
  "tcs",
  "thoughtworks",
];

const UK_HEADQUARTERED = new Set(["wise", "monzo", "gocardless", "skyscanner", "tide", "gds"]);

const LEVER_BOARDS = ["palantir", "spotify"];

function greenhouseLocation(job: GreenhouseJob) {
  const office = (job.offices || []).map((item) => item.location || item.name || "").join(" ");
  return job.location?.name || office || "";
}

function keepUk(location: string, description: string) {
  if (isUkLocation(location, description)) return true;
  return /\b(uk|united kingdom|great britain|england|scotland|wales|london|manchester|birmingham|edinburgh|glasgow|bristol|leeds|cambridge|oxford|belfast|remote uk|uk remote)\b/i.test(
    `${location} ${description.slice(0, 500)}`
  );
}

export async function fetchGreenhouseJobs(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (const board of GREENHOUSE_BOARDS) {
    try {
      const data = await fetchJson<{ jobs?: GreenhouseJob[] }>(
        `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`,
        {},
        25_000
      );
      let count = 0;
      for (const job of data.jobs ?? []) {
        const location = greenhouseLocation(job);
        if (!UK_HEADQUARTERED.has(board) && !keepUk(location, job.title || "")) continue;
        const description = job.content ? job.content.replace(/<[^>]+>/g, " ") : `${job.title || ""} at ${board}. Location: ${location}.`;
        const row = makeRaw({
          source: "greenhouse",
          id: `${board}-${job.id || job.title}`,
          url: job.absolute_url || "",
          title: job.title || "",
          company: boardDisplayName(board),
          location: location || "United Kingdom",
          description,
          salary: parseSalary(description),
          postedAt: isoDate(job.first_published || job.updated_at),
          tags: [board],
        });
        if (row) {
          out.push(row);
          count += 1;
        }
        if (count >= 80) break;
      }
    } catch {
      // Skip a board that is down or renamed.
    }
    await sleep(80);
  }
  return out;
}

export async function fetchLeverJobs(): Promise<RawJob[]> {
  const out: RawJob[] = [];
  for (const board of LEVER_BOARDS) {
    try {
      const rows = await fetchJson<LeverJob[]>(`https://api.lever.co/v0/postings/${board}`, {}, 60_000);
      let count = 0;
      for (const job of rows ?? []) {
        const location = job.categories?.location || "";
        const description = job.descriptionPlain || job.description || "";
        if (!keepUk(location, description)) continue;
        const row = makeRaw({
          source: "lever",
          id: job.id || `${board}-${job.text}`,
          url: job.hostedUrl || job.applyUrl || "",
          title: job.text || "",
          company: boardDisplayName(board),
          location: location || "United Kingdom",
          description,
          jobTypes: job.categories?.commitment ? [job.categories.commitment] : [],
          tags: job.categories?.team ? [job.categories.team] : [],
          salary: parseSalary(description),
          postedAt: isoDate(job.createdAt),
        });
        if (row) {
          out.push(row);
          count += 1;
        }
        if (count >= 80) break;
      }
    } catch {
      // Skip a board that is down or renamed.
    }
  }
  return out;
}

function boardDisplayName(slug: string) {
  const names: Record<string, string> = {
    wise: "Wise",
    monzo: "Monzo",
    gocardless: "GoCardless",
    skyscanner: "Skyscanner",
    tide: "Tide",
    deepmind: "Google DeepMind",
    stripe: "Stripe",
    figma: "Figma",
    cloudflare: "Cloudflare",
    intercom: "Intercom",
    datadog: "Datadog",
    twilio: "Twilio",
    gds: "Government Digital Service",
    anthropic: "Anthropic",
    airbnb: "Airbnb",
    bcg: "Boston Consulting Group",
    tcs: "Tata Consultancy Services",
    thoughtworks: "Thoughtworks",
    palantir: "Palantir",
    spotify: "Spotify",
  };
  return names[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetchAtsJobs(): Promise<RawJob[]> {
  const [greenhouse, lever] = await Promise.allSettled([fetchGreenhouseJobs(), fetchLeverJobs()]);
  return [
    ...(greenhouse.status === "fulfilled" ? greenhouse.value : []),
    ...(lever.status === "fulfilled" ? lever.value : []),
  ];
}
