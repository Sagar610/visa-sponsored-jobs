import { stripHtml } from "./html";

function num(raw: string, thousand = false) {
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (thousand) return n >= 1000 ? n : n * 1000;
  if (n < 200 && n >= 15) return n * 1000;
  if (n < 15000) return null;
  return n;
}

function money(n: number, currency: string) {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  return `${symbol}${Math.round(n).toLocaleString("en-GB")}`;
}

export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = "GBP",
  period?: string | null
) {
  const lo = min && min > 0 ? min : null;
  const hi = max && max > 0 ? max : null;
  if (!lo && !hi) return null;
  let text = lo && hi && lo !== hi ? `${money(lo, currency)}–${money(hi, currency)}` : money((lo || hi) as number, currency);
  const p = (period || "").toLowerCase();
  if (p.includes("month")) text += " / month";
  else if (p.includes("hour") || p.includes("hr")) text += " / hour";
  else if (p.includes("day")) text += " / day";
  return text;
}

export function parseSalary(text: string): string | null {
  if (!text) return null;
  const t = stripHtml(text)
    .replace(/\u00a0/g, " ")
    .replace(/[—–−]/g, "-")
    .replace(/&pound;|&#163;/gi, "£");

  const range =
    t.match(
      /(?:£|gbp\s*)\s*([\d,]+(?:\.\d+)?)\s*(k)?\s*(?:-|to)\s*(?:£|gbp\s*)?\s*([\d,]+(?:\.\d+)?)\s*(k)?/i
    ) ||
    t.match(
      /\$\s*([\d,]+(?:\.\d+)?)\s*(k)?\s*(?:-|to)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(k)?/i
    ) ||
    t.match(
      /([\d,]+)\s*(k)?\s*(?:-|to)\s*([\d,]+)\s*(k)?\s*(?:gbp|usd|eur)/i
    );

  if (range) {
    const currency = /\$|usd/i.test(range[0]) ? "USD" : /eur|€/i.test(range[0]) ? "EUR" : "GBP";
    const min = num(range[1], Boolean(range[2]));
    const max = num(range[3], Boolean(range[4] || range[2]));
    const formatted = formatSalaryRange(min, max, currency);
    if (formatted) return formatted;
  }

  const single = t.match(
    /(?:salary|compensation|pay|package|ote)[^\n£$]{0,40}(?:£|gbp\s*|\$)\s*([\d,]+(?:\.\d+)?)\s*(k)?/i
  ) || t.match(/(?:£|gbp\s*)\s*([\d,]+(?:\.\d+)?)\s*(k)?(?:\s*(?:per\s*year|p\.?a\.?|\/\s*year|annum|annually))?/i);

  if (single) {
    const currency = /\$|usd/i.test(single[0]) ? "USD" : "GBP";
    const value = num(single[1], Boolean(single[2]));
    const formatted = formatSalaryRange(value, null, currency);
    if (formatted) return formatted;
  }

  if (/competitive|doe|negotiable|salary not specified/i.test(t) && /salary|compensation|package/i.test(t)) {
    return "Competitive";
  }

  return null;
}
