import { access, constants, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Job, Sponsor, StoreShape, SyncMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");
const SPONSORS_FILE = path.join(DATA_DIR, "sponsors.json");
const META_FILE = path.join(DATA_DIR, "meta.json");

const emptyMeta = (): SyncMeta => ({
  lastSyncAt: null,
  lastNewsSyncAt: null,
  lastSyncOk: false,
  lastError: null,
  durationMs: 0,
  sources: {},
  sponsorCount: 0,
  jobCount: 0,
  confirmedCount: 0,
  newsCount: 0,
  registerUpdatedAt: null,
  registerFilename: null,
});

let cache: StoreShape | null = null;
let cacheAt = 0;
let writableCache: boolean | null = null;

export function dataDir() {
  return DATA_DIR;
}

/** True when this process can persist sync output under data/ (false on Vercel). */
export function isEphemeralRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export async function isDataWritable(): Promise<boolean> {
  if (writableCache !== null) return writableCache;
  if (isEphemeralRuntime()) {
    writableCache = false;
    return false;
  }
  try {
    await ensureDataDir();
    const probe = path.join(DATA_DIR, `.write-probe-${process.pid}`);
    await writeFile(probe, "ok", "utf8");
    await access(probe, constants.W_OK);
    await unlink(probe);
    writableCache = true;
  } catch {
    writableCache = false;
  }
  return writableCache;
}

export async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadStore(force = false): Promise<StoreShape> {
  const now = Date.now();
  if (!force && cache && now - cacheAt < 15_000) return cache;
  const [jobs, sponsors, rawMeta] = await Promise.all([
    readJson<Job[]>(JOBS_FILE, []),
    readJson<Sponsor[]>(SPONSORS_FILE, []),
    readJson<SyncMeta>(META_FILE, emptyMeta()),
  ]);
  cache = { jobs, sponsors, meta: { ...emptyMeta(), ...rawMeta } };
  cacheAt = now;
  return cache;
}

export async function saveStore(store: StoreShape) {
  await ensureDataDir();
  await Promise.all([
    writeFile(JOBS_FILE, JSON.stringify(store.jobs), "utf8"),
    writeFile(SPONSORS_FILE, JSON.stringify(store.sponsors), "utf8"),
    writeFile(META_FILE, JSON.stringify(store.meta, null, 2), "utf8"),
  ]);
  cache = store;
  cacheAt = Date.now();
}

export async function patchMeta(partial: Partial<SyncMeta>) {
  const store = await loadStore(true);
  store.meta = { ...store.meta, ...partial };
  await ensureDataDir();
  await writeFile(META_FILE, JSON.stringify(store.meta, null, 2), "utf8");
  cache = store;
  cacheAt = Date.now();
}

export function isStale(meta: SyncMeta, maxAgeMs = 2 * 60 * 60 * 1000) {
  if (!meta.lastSyncAt) return true;
  return Date.now() - new Date(meta.lastSyncAt).getTime() > maxAgeMs;
}
