import { normalizeCompany } from "./normalize";
import type { Sponsor } from "./types";

const GENERIC = new Set([
  "technologies",
  "technology",
  "tech",
  "software",
  "digital",
  "international",
  "services",
  "solutions",
  "consulting",
  "consultancy",
  "partners",
  "capital",
  "media",
  "health",
  "healthcare",
  "energy",
  "robotics",
  "systems",
  "networks",
  "labs",
  "lab",
  "ai",
]);

export type SponsorIndex = {
  exact: Map<string, Sponsor>;
  byFirst: Map<string, Sponsor[]>;
  nospace: Map<string, Sponsor>;
};

export function buildSponsorIndex(sponsors: Sponsor[]): SponsorIndex {
  const exact = new Map<string, Sponsor>();
  const byFirst = new Map<string, Sponsor[]>();
  const nospace = new Map<string, Sponsor>();

  for (const sponsor of sponsors) {
    const key = normalizeCompany(sponsor.name);
    if (!key) continue;
    if (!exact.has(key)) exact.set(key, sponsor);
    const packed = key.replace(/ /g, "");
    if (packed.length >= 6 && !nospace.has(packed)) nospace.set(packed, sponsor);
    const first = key.split(" ")[0];
    if (!first || first.length < 3) continue;
    const list = byFirst.get(first) ?? [];
    list.push(sponsor);
    byFirst.set(first, list);
  }

  return { exact, byFirst, nospace };
}

function scorePair(jobKey: string, sponsorKey: string): number {
  if (jobKey === sponsorKey) return 1;
  if (sponsorKey.startsWith(jobKey + " ") || jobKey.startsWith(sponsorKey + " ")) {
    return Math.min(jobKey.length, sponsorKey.length) / Math.max(jobKey.length, sponsorKey.length) + 0.15;
  }
  if (sponsorKey.includes(" " + jobKey + " ") || sponsorKey.endsWith(" " + jobKey)) {
    return 0.8;
  }
  return 0;
}

export function matchSponsor(
  company: string,
  index: SponsorIndex
): { sponsor: Sponsor; score: number } | null {
  const key = normalizeCompany(company);
  if (!key) return null;

  const exact = index.exact.get(key);
  if (exact) return { sponsor: exact, score: 1 };

  const packed = key.replace(/ /g, "");
  if (packed.length >= 6) {
    const hit = index.nospace.get(packed);
    if (hit) return { sponsor: hit, score: 0.9 };
  }

  const first = key.split(" ")[0];
  const candidates = index.byFirst.get(first) ?? [];
  let best: { sponsor: Sponsor; score: number } | null = null;

  for (const sponsor of candidates) {
    const sKey = normalizeCompany(sponsor.name);
    const score = Math.min(1, scorePair(key, sKey));
    if (score >= 0.72 && (!best || score > best.score)) {
      best = { sponsor, score };
    }
  }

  if (best) return best;

  if (key.split(" ").length === 1 && first.length >= 5) {
    const named = candidates.filter((sponsor) =>
      normalizeCompany(sponsor.name).startsWith(key)
    );
    const generic = named.filter((sponsor) => {
      const rest = normalizeCompany(sponsor.name).slice(key.length).trim().split(" ").filter(Boolean);
      return rest.length === 0 || rest.every((word) => GENERIC.has(word));
    });
    const pool = generic.length ? generic : named.length === 1 ? named : [];
    if (pool.length > 0 && pool.length <= 4) {
      pool.sort((a, b) => normalizeCompany(a.name).length - normalizeCompany(b.name).length);
      return { sponsor: pool[0], score: 0.84 };
    }
  }

  return null;
}
