function fromCode(code: number): string {
  if (!Number.isFinite(code) || (code < 32 && code !== 9 && code !== 10 && code !== 13)) return "";
  if (code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

const ALLOWED = new Set([
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "h4",
  "blockquote",
]);

function decodeOnce(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => fromCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => fromCode(Number(num)))
    .replace(/&amp;/gi, "&");
}

export function decodeEntities(text: string): string {
  let current = text;
  for (let i = 0; i < 3; i += 1) {
    const next = decodeOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
}

export function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*?>/i.test(value) || /&lt;[a-z]/i.test(value);
}

function hrefFrom(attrs: string): string | null {
  const match = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const href = (match?.[1] || match?.[2] || match?.[3] || "").trim();
  if (/^https?:\/\//i.test(href)) return href;
  return null;
}

export function toSafeJobHtml(raw: string): string {
  const decoded = decodeEntities(raw || "").trim();
  if (!decoded) return "";

  if (!looksLikeHtml(decoded)) {
    return decoded
      .split(/\n{2,}/)
      .map((block) => `<p>${escapeText(block).replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  const withoutDanger = decoded
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

  const rewritten = withoutDanger.replace(/<\/?([a-z0-9]+)(\s[^>]*)?\/?>/gi, (full, tagName: string, attrs = "") => {
    const tag = tagName.toLowerCase();
    const closing = full.startsWith("</");
    const selfClosing = /\/\s*>$/.test(full) || tag === "br";

    if (tag === "br") return "<br/>";
    if (tag === "div" || tag === "span" || tag === "section" || tag === "article") return closing ? "" : "";
    if (tag === "h1") return closing ? "</h2>" : "<h2>";
    if (tag === "a") {
      if (closing) return "</a>";
      const href = hrefFrom(attrs);
      return href ? `<a href="${escapeText(href)}" target="_blank" rel="noreferrer noopener">` : "";
    }
    if (!ALLOWED.has(tag)) return "";
    if (closing) return `</${tag}>`;
    if (selfClosing) return tag === "br" ? "<br/>" : "";
    return `<${tag}>`;
  });

  return rewritten.replace(/\n{3,}/g, "\n\n").trim();
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function stripHtml(html: string): string {
  const decoded = decodeEntities(html || "");
  const stripped = decoded
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr|blockquote)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]{2,}/g, " ")
    .trim();
  return decodeEntities(stripped);
}

export function snippet(text: string, length = 220): string {
  const clean = stripHtml(text).replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length).replace(/\s+\S*$/, "")}…`;
}
