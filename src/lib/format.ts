import type { Confidence, JobCategory } from "./types";

export const CATEGORY_LABELS: Record<JobCategory, string> = {
  software: "Software",
  data: "Data & AI",
  healthcare: "Healthcare",
  engineering: "Engineering",
  finance: "Finance",
  education: "Education",
  hospitality: "Hospitality",
  construction: "Construction",
  legal: "Legal",
  science: "Science",
  sales: "Sales",
  other: "Other",
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  confirmed: "Sponsorship confirmed",
  claimed: "Sponsorship mentioned",
  licensed: "Licensed sponsor",
};

export function formatRelative(iso: string | null) {
  if (!iso) return "Date unknown";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Date unknown";
  const delta = Date.now() - then;
  const mins = Math.round(delta / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDate(iso: string | null) {
  if (!iso) return "Not published";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not published";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-GB").format(n);
}
