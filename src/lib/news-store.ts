import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchVisaNews } from "./ingest/news";
import { dataDir, patchMeta } from "./store";
import type { NewsItem } from "./types";

const NEWS_FILE = () => path.join(dataDir(), "news.json");

let cache: NewsItem[] | null = null;
let cacheAt = 0;

export async function loadNews(force = false): Promise<NewsItem[]> {
  const now = Date.now();
  if (!force && cache && now - cacheAt < 15_000) return cache;
  try {
    const raw = await readFile(NEWS_FILE(), "utf8");
    cache = JSON.parse(raw) as NewsItem[];
  } catch {
    cache = [];
  }
  cacheAt = now;
  return cache;
}

export async function saveNews(items: NewsItem[]) {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(NEWS_FILE(), JSON.stringify(items, null, 2), "utf8");
  cache = items;
  cacheAt = Date.now();
}

export async function syncNews(): Promise<NewsItem[]> {
  const items = await fetchVisaNews();
  await saveNews(items);
  await patchMeta({
    lastNewsSyncAt: new Date().toISOString(),
    newsCount: items.length,
  });
  return items;
}

export function isNewsStale(lastNewsSyncAt: string | null, maxAgeMs = 12 * 60 * 60 * 1000) {
  if (!lastNewsSyncAt) return true;
  return Date.now() - new Date(lastNewsSyncAt).getTime() > maxAgeMs;
}
