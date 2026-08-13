import { snippet, stripHtml } from "../html";
import { slugify } from "../normalize";
import type { RawJob } from "./arbeitnow";

export function makeRaw(input: {
  source: string;
  id: string;
  url: string;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  description?: string;
  tags?: string[];
  jobTypes?: string[];
  salary?: string | null;
  postedAt?: string | null;
}): RawJob | null {
  const title = input.title.trim();
  const company = input.company.trim();
  const url = input.url.trim();
  if (!title || !company || !url) return null;
  const description = (input.description || "").slice(0, 12_000);
  const location = input.location?.trim() || "United Kingdom";
  return {
    id: `${input.source}-${slugify(input.id || `${company}-${title}`)}`,
    source: input.source,
    sourceUrl: url,
    title,
    company,
    location,
    remote: Boolean(input.remote) || /remote/i.test(`${title} ${location}`),
    tags: input.tags ?? [],
    jobTypes: input.jobTypes ?? [],
    description,
    snippet: snippet(description),
    salary: input.salary ?? null,
    postedAt: input.postedAt || null,
  };
}

export function decodeXml(value: string) {
  return stripHtml(
    value
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&")
  ).trim();
}

function xmlTag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function xmlAttr(block: string, name: string, attrName: string) {
  const match = block.match(new RegExp(`<${name}[^>]*${attrName}="([^"]+)"`, "i"));
  return match?.[1] || "";
}

export function parseRssJobs(xml: string, source: string): RawJob[] {
  const chunks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  const out: RawJob[] = [];
  for (const block of chunks) {
    const rawTitle = xmlTag(block, "title");
    const url = xmlTag(block, "link") || xmlAttr(block, "link", "href") || xmlTag(block, "guid");
    const description = xmlTag(block, "description") || xmlTag(block, "summary") || xmlTag(block, "content");
    const company =
      xmlTag(block, "dc:creator") ||
      xmlTag(block, "company") ||
      xmlTag(block, "author") ||
      (rawTitle.includes(":") ? rawTitle.split(":")[0] : "");
    const title = rawTitle.includes(":") ? rawTitle.slice(rawTitle.indexOf(":") + 1).trim() : rawTitle;
    const posted = xmlTag(block, "pubDate") || xmlTag(block, "updated") || xmlTag(block, "published");
    const location = xmlTag(block, "location") || "United Kingdom";
    const job = makeRaw({
      source,
      id: url || `${company}-${title}`,
      url,
      title: title || rawTitle,
      company: company || "Unknown employer",
      location,
      description,
      postedAt: posted ? new Date(posted).toISOString() : null,
    });
    if (job && job.company !== "Unknown employer") out.push(job);
  }
  return out;
}

export function isoDate(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(typeof value === "number" && value < 1e12 ? value * 1000 : value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
