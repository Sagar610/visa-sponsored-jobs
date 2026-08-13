import Papa from "papaparse";
import { fetchJson, fetchText } from "../http";
import { unique } from "../normalize";
import type { Sponsor } from "../types";

const CONTENT_API =
  "https://www.gov.uk/api/content/government/publications/register-of-licensed-sponsors-workers";

type GovukAttachment = {
  filename: string;
  url: string;
  title?: string;
};

type GovukContent = {
  public_updated_at?: string;
  updated_at?: string;
  details?: { attachments?: GovukAttachment[] };
};

const SKILLED = /skilled worker/i;

export type RegisterResult = {
  sponsors: Sponsor[];
  updatedAt: string | null;
  filename: string | null;
};

export async function fetchLicensedSponsors(): Promise<RegisterResult> {
  const content = await fetchJson<GovukContent>(CONTENT_API, {}, 30_000);
  const attachment = content.details?.attachments?.find((a) =>
    a.filename.toLowerCase().endsWith(".csv")
  );
  if (!attachment?.url) {
    throw new Error("Could not find the Home Office sponsor CSV on GOV.UK");
  }

  const csv = await fetchText(attachment.url, {}, 120_000);
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const grouped = new Map<string, Sponsor>();

  for (const row of parsed.data) {
    const name = (row["Organisation Name"] || "").trim();
    const route = (row["Route"] || "").trim();
    if (!name || !SKILLED.test(route)) continue;

    const typeRating = (row["Type & Rating"] || "").trim();
    const ratingMatch = typeRating.match(/\(([A-D]) rating\)/i);
    const typeMatch = typeRating.replace(/\s*\([^)]*\)\s*/g, "").trim();
    const existing = grouped.get(name.toLowerCase());
    if (existing) {
      existing.routes = unique([...existing.routes, route]);
      continue;
    }
    grouped.set(name.toLowerCase(), {
      name,
      slug: "",
      city: (row["Town/City"] || "").trim(),
      county: (row["County"] || "").trim(),
      rating: ratingMatch?.[1]?.toUpperCase() || "",
      type: typeMatch || "Worker",
      routes: [route],
      jobCount: 0,
      lastJobAt: null,
      categories: [],
    });
  }

  return {
    sponsors: [...grouped.values()],
    updatedAt: content.public_updated_at || content.updated_at || null,
    filename: attachment.filename,
  };
}
