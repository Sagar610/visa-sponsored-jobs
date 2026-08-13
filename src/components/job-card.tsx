import type { Job } from "@/lib/types";
import { CATEGORY_LABELS, CONFIDENCE_LABELS, formatRelative } from "@/lib/format";
import { snippet } from "@/lib/html";
import Link from "next/link";
import { MapPin, Building2, Clock, Banknote } from "lucide-react";

const tone: Record<Job["confidence"], string> = {
  confirmed: "bg-emerald-50 text-mint ring-1 ring-emerald-200",
  claimed: "bg-sky-50 text-blue ring-1 ring-sky-200",
  licensed: "bg-slate-100 text-navy ring-1 ring-slate-200",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-lg border border-line bg-white p-5 shadow-sm transition hover:border-blue/40 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {CATEGORY_LABELS[job.category]}
            {job.remote ? " · Remote" : ""}
          </p>
          <h3 className="mt-1 text-lg font-bold text-navy group-hover:text-blue">{job.title}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Building2 className="h-4 w-4 text-blue" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatRelative(job.postedAt)}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[job.confidence]}`}>
            {CONFIDENCE_LABELS[job.confidence]}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-bold ${
              job.salary ? "bg-emerald-50 text-mint" : "bg-slate-100 text-muted"
            }`}
          >
            <Banknote className="h-4 w-4" />
            {job.salary || "Salary not listed"}
          </span>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{snippet(job.snippet || job.description)}</p>
      {job.sponsor ? (
        <p className="mt-3 text-xs font-medium text-mint">
          Home Office licensed · {job.sponsor.rating ? `${job.sponsor.rating} rating` : "Skilled Worker"}
          {job.sponsor.city ? ` · ${job.sponsor.city}` : ""}
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-blue">
          Advert mentions visa sponsorship — confirm the licence on GOV.UK
        </p>
      )}
    </Link>
  );
}
