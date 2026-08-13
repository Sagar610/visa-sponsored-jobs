import { fetchJson, fetchText } from "../http";
import { snippet, stripHtml } from "../html";
import { slugify } from "../normalize";
import type { NewsItem } from "../types";

type GovResult = {
  title?: string;
  description?: string;
  link?: string;
  public_timestamp?: string;
  display_type?: string;
};

type GovSearch = { results?: GovResult[] };

const VISA_RE =
  /\b(visa|visas|ukvi|skilled worker|sponsor licen[cs]e|licensed sponsor|certificate of sponsorship|immigration rules|work visa|graduate visa|health and care visa|shortage occupation|salary threshold|indefinite leave|ilr|points[- ]based|visa fee|immigration white paper|youth mobility|global talent|high potential individual|scale[- ]up visa|minister of state for migration)\b/i;

const SKIP_RE =
  /\b(country policy and information notes?|british sign language 5-year|detention centre|prison|criminal investigation)\b/i;

const EVERGREEN_RE =
  /^(archive:\s*)?immigration rules(\s+appendix\b|:\s*appendix\b|$)|^(migration transparency data)/i;

function absGov(link: string) {
  if (link.startsWith("http")) return link;
  return `https://www.gov.uk${link.startsWith("/") ? "" : "/"}${link}`;
}

function makeId(source: NewsItem["source"], title: string, publishedAt: string) {
  const day = publishedAt.slice(0, 10);
  return slugify(`${source}-${day}-${title}`) || `${source}-${day}`;
}

function relevant(title: string, summary: string) {
  if (EVERGREEN_RE.test(title.trim())) return false;
  const hay = `${title}\n${summary}`;
  if (SKIP_RE.test(hay) && !/skilled worker|sponsor licen|work visa/i.test(hay)) return false;
  return VISA_RE.test(hay);
}

function fromGov(row: GovResult, kind: NewsItem["kind"]): NewsItem | null {
  const title = (row.title || "").trim();
  const url = row.link ? absGov(row.link) : "";
  if (!title || !url) return null;
  const summary = snippet(row.description || "", 280);
  if (!relevant(title, summary)) return null;
  const publishedAt = row.public_timestamp || new Date().toISOString();
  return {
    id: makeId("govuk", title, publishedAt),
    title,
    summary: summary || row.display_type || "Official GOV.UK update",
    url,
    source: "govuk",
    sourceName: "GOV.UK",
    publishedAt,
    kind,
  };
}

async function govSearch(params: string): Promise<GovResult[]> {
  const url = `https://www.gov.uk/api/search.json?${params}&order=-public_timestamp&fields=title,description,link,public_timestamp,display_type`;
  const data = await fetchJson<GovSearch>(url, {}, 25_000);
  return data.results || [];
}

function decodeXml(value: string) {
  return stripHtml(
    value
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&")
  );
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function attr(block: string, name: string, attrName: string) {
  const match = block.match(new RegExp(`<${name}[^>]*${attrName}="([^"]+)"`, "i"));
  return match?.[1] || "";
}

function parseFeed(
  xml: string,
  source: NewsItem["source"],
  sourceName: string
): NewsItem[] {
  const items: NewsItem[] = [];
  const chunks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  for (const block of chunks) {
    const title = tag(block, "title");
    const url = tag(block, "link") || attr(block, "link", "href");
    const summary = snippet(tag(block, "description") || tag(block, "summary") || tag(block, "content"), 280);
    const publishedAt =
      new Date(tag(block, "pubDate") || tag(block, "updated") || tag(block, "published") || Date.now()).toISOString();
    if (!title || !url || !relevant(title, summary)) continue;
    items.push({
      id: makeId(source, title, publishedAt),
      title,
      summary: summary || "UK visa and immigration update",
      url,
      source,
      sourceName,
      publishedAt,
      kind: "news",
    });
  }
  return items;
}

async function rss(url: string, source: NewsItem["source"], sourceName: string): Promise<NewsItem[]> {
  const xml = await fetchText(url, { headers: { accept: "application/rss+xml, application/atom+xml, text/xml" } }, 20_000);
  return parseFeed(xml, source, sourceName);
}

export async function fetchVisaNews(): Promise<NewsItem[]> {
  const settled = await Promise.allSettled([
    govSearch("filter_organisations=uk-visas-and-immigration&filter_content_purpose_supergroup=news_and_communications&count=40"),
    govSearch("filter_organisations=home-office&filter_content_purpose_supergroup=news_and_communications&count=40"),
    govSearch("q=%22skilled+worker%22&filter_organisations=home-office&count=25"),
    govSearch("q=%22statement+of+changes+to+the+immigration+rules%22&count=12"),
    govSearch("q=%22sponsor+licence%22&count=15"),
    rss("https://feeds.bbci.co.uk/news/uk/rss.xml", "bbc", "BBC News"),
    rss("https://feeds.bbci.co.uk/news/politics/rss.xml", "bbc", "BBC News"),
    rss("https://www.theguardian.com/uk/immigration/rss", "guardian", "The Guardian"),
  ]);

  const collected: NewsItem[] = [];
  for (const [index, result] of settled.entries()) {
    if (result.status !== "fulfilled") continue;
    const value = result.value;
    if (Array.isArray(value) && value[0] && "title" in value[0] && !("id" in value[0])) {
      const kind: NewsItem["kind"] = index <= 4 ? "official" : "news";
      for (const row of value as GovResult[]) {
        const item = fromGov(row, kind);
        if (item) collected.push(item);
      }
    } else if (Array.isArray(value)) {
      collected.push(...(value as NewsItem[]));
    }
  }

  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  for (const item of collected.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key) || seen.has(item.id)) continue;
    seen.add(key);
    seen.add(item.id);
    unique.push(item);
    if (unique.length >= 60) break;
  }
  return unique;
}
