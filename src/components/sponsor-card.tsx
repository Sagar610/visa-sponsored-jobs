import Link from "next/link";
import type { Sponsor } from "@/lib/types";
import { CATEGORY_LABELS, formatNumber, formatRelative } from "@/lib/format";
import { initials } from "@/lib/sponsors";
import { Briefcase, MapPin } from "lucide-react";

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <Link
      href={`/sponsors/${sponsor.slug}`}
      className="group flex gap-4 rounded-lg border border-line bg-white p-4 shadow-sm transition hover:border-blue/40 hover:shadow-md"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-navy text-sm font-bold text-white">
        {initials(sponsor.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-bold text-navy group-hover:text-blue">{sponsor.name}</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-navy">
            {sponsor.rating ? `${sponsor.rating} rating` : "Licensed"}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[sponsor.city, sponsor.county].filter(Boolean).join(", ") || "United Kingdom"}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-blue">
            <Briefcase className="h-3.5 w-3.5" />
            {sponsor.jobCount} live job{sponsor.jobCount === 1 ? "" : "s"}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted">
          {sponsor.lastJobAt
            ? `Last seen hiring ${formatRelative(sponsor.lastJobAt)}`
            : "No live vacancy in the current feed"}
          {sponsor.categories.length
            ? ` · ${sponsor.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}`
            : ""}
        </p>
      </div>
    </Link>
  );
}

export function SponsorRow({ sponsor }: { sponsor: Sponsor }) {
  return (
    <Link
      href={`/sponsors/${sponsor.slug}`}
      className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-line px-4 py-3 hover:bg-card-2 sm:grid-cols-[minmax(0,1.6fr)_140px_90px_110px]"
    >
      <span className="min-w-0">
        <span className="block truncate font-semibold text-navy">{sponsor.name}</span>
        <span className="block text-xs text-muted sm:hidden">
          {sponsor.city || "UK"} · {sponsor.rating || "—"} rating
        </span>
      </span>
      <span className="hidden truncate text-sm text-muted sm:block">{sponsor.city || "—"}</span>
      <span className="hidden text-sm font-semibold text-navy sm:block">{sponsor.rating || "—"}</span>
      <span className="text-right text-sm font-semibold text-blue">
        {sponsor.jobCount ? `${formatNumber(sponsor.jobCount)} jobs` : "View"}
      </span>
    </Link>
  );
}
