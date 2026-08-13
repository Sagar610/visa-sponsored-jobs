import { fetchJson } from "./http";
import { normalizeCompany } from "./normalize";
import type { CompanyBrief } from "./types";

const cache = new Map<string, { at: number; value: CompanyBrief | null }>();
const TTL = 24 * 60 * 60 * 1000;

type WikiSearch = {
  query?: { search?: Array<{ title: string; snippet: string }>; };
};

type WikiSummary = {
  title?: string;
  extract?: string;
  description?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
  type?: string;
};

function plausible(company: string, title: string) {
  if (/disambiguation/i.test(title)) return false;
  const q = normalizeCompany(company);
  const t = normalizeCompany(title);
  if (!q || !t) return false;
  if (t === q) return true;
  if (t.startsWith(q) || q.startsWith(t)) return true;
  const qWords = q.split(" ").filter((w) => w.length > 2);
  const overlap = qWords.filter((w) => t.includes(w)).length;
  return overlap >= Math.min(2, qWords.length);
}

export async function fetchCompanyBrief(company: string): Promise<CompanyBrief | null> {
  const key = company.toLowerCase();
  const hitCache = cache.get(key);
  if (hitCache && Date.now() - hitCache.at < TTL) return hitCache.value;

  try {
    const search = await fetchJson<WikiSearch>(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        `${company} company UK`
      )}&srlimit=5&format=json`,
      {},
      8_000
    );
    const hit = (search.query?.search || []).find((row) => plausible(company, row.title));
    if (!hit) {
      cache.set(key, { at: Date.now(), value: null });
      return null;
    }

    const summary = await fetchJson<WikiSummary>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
      { headers: { accept: "application/json" } },
      8_000
    );
    if (summary.type === "disambiguation" || !summary.extract) {
      cache.set(key, { at: Date.now(), value: null });
      return null;
    }

    const value: CompanyBrief = {
      summary: summary.extract,
      wikipediaUrl: summary.content_urls?.desktop?.page || null,
      thumbnail: summary.thumbnail?.source || null,
      description: summary.description || null,
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch {
    cache.set(key, { at: Date.now(), value: null });
    return null;
  }
}
