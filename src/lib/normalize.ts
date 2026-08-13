const LEGAL = /\b(limited|ltd|llp|llc|plc|inc|incorporated|company|co|holdings|group|uk|the|llp|cic|cio|llp)\b/gi;

export function normalizeCompany(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bt\/a\b.+$/i, "")
    .replace(/\btrading as\b.+$/i, "")
    .replace(LEGAL, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
