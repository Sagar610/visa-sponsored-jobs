const UA =
  "VisaSponsoredJobs/1.0 (+https://visasponsoredjobs.vercel.app; UK Skilled Worker aggregator using public APIs)";

export async function fetchText(
  url: string,
  init: RequestInit = {},
  timeoutMs = 45_000
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "user-agent": UA,
        accept: "*/*",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 45_000
): Promise<T> {
  const text = await fetchText(
    url,
    {
      ...init,
      headers: { accept: "application/json", ...(init.headers ?? {}) },
    },
    timeoutMs
  );
  return JSON.parse(text) as T;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
