"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { CATEGORY_LABELS, formatNumber } from "@/lib/format";
import type { JobFacets } from "@/lib/search";
import type { Confidence, Job, JobCategory } from "@/lib/types";

type Result = {
  total: number;
  page: number;
  pageSize: number;
  jobs: Job[];
  facets: JobFacets;
};

const SPONSORSHIP: Array<{ id: "all" | Confidence | "sponsoring"; label: string }> = [
  { id: "all", label: "All eligible jobs" },
  { id: "confirmed", label: "Sponsorship confirmed" },
  { id: "sponsoring", label: "Sponsorship mentioned" },
  { id: "licensed", label: "Licensed sponsor" },
  { id: "claimed", label: "Mentioned, licence not matched" },
];

export function JobExplorer({
  initial,
  defaults,
}: {
  initial: Result;
  defaults: {
    q?: string;
    location?: string;
    category?: string;
    confidence?: string;
    remote?: boolean;
    salary?: boolean;
  };
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q || "");
  const [city, setCity] = useState(defaults.location || "");
  const [category, setCategory] = useState<JobCategory | "all">((defaults.category as JobCategory) || "all");
  const [confidence, setConfidence] = useState<"all" | Confidence | "sponsoring">(
    (defaults.confidence as "all" | Confidence | "sponsoring") || "all"
  );
  const [remote, setRemote] = useState(Boolean(defaults.remote));
  const [salary, setSalary] = useState(Boolean(defaults.salary));
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const skipFirst = useRef(true);

  const query = useMemo(
    () => ({ q: q.trim(), city: city.trim(), category, confidence, remote, salary, page }),
    [q, city, category, confidence, remote, salary, page]
  );

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [filtersOpen]);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.q) params.set("q", query.q);
      if (query.city) params.set("location", query.city);
      if (query.category !== "all") params.set("category", query.category);
      if (query.confidence !== "all") params.set("confidence", query.confidence);
      if (query.remote) params.set("remote", "1");
      if (query.salary) params.set("salary", "1");
      params.set("page", String(query.page));
      params.set("pageSize", "25");
      const qs = params.toString();
      router.replace(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
      try {
        const res = await fetch(`/api/jobs?${qs}`);
        if (res.ok) setResult(await res.json());
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => window.clearTimeout(handle);
  }, [query, router]);

  function reset() {
    setQ("");
    setCity("");
    setCategory("all");
    setConfidence("all");
    setRemote(false);
    setSalary(false);
    setPage(1);
  }

  const active =
    Boolean(q.trim() || city.trim()) ||
    category !== "all" ||
    confidence !== "all" ||
    remote ||
    salary;
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const facets = result.facets;

  const filters = (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-navy">Filters</p>
        {active && (
          <button type="button" onClick={reset} className="text-xs font-semibold text-blue hover:underline">
            Clear all
          </button>
        )}
      </div>

      <Field label="Job title or company">
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search roles"
            className="h-8 w-full bg-transparent text-sm text-ink placeholder:text-muted"
          />
        </div>
      </Field>

      <Field label="City">
        <input
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          placeholder="London, Manchester…"
          className="h-8 w-full border-b border-line bg-transparent pb-2 text-sm text-ink placeholder:text-muted"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {facets.cities.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setCity(item.name);
                setPage(1);
              }}
              className={`text-xs ${
                city.toLowerCase() === item.name.toLowerCase() ? "font-semibold text-blue" : "text-muted hover:text-navy"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Sponsorship">
        <div className="flex flex-col gap-1">
          {SPONSORSHIP.map((item) => (
            <Choice
              key={item.id}
              active={confidence === item.id}
              label={item.label}
              count={facets.confidence[item.id]}
              onClick={() => {
                setConfidence(item.id);
                setPage(1);
              }}
            />
          ))}
        </div>
      </Field>

      <Field label="Category">
        <div className="flex flex-col gap-1">
          <Choice
            active={category === "all"}
            label="All categories"
            count={facets.confidence.all}
            onClick={() => {
              setCategory("all");
              setPage(1);
            }}
          />
          {(Object.keys(CATEGORY_LABELS) as JobCategory[]).map((id) => (
            <Choice
              key={id}
              active={category === id}
              label={CATEGORY_LABELS[id]}
              count={facets.categories[id]}
              onClick={() => {
                setCategory(id);
                setPage(1);
              }}
            />
          ))}
        </div>
      </Field>

      <Field label="More">
        <label className="flex cursor-pointer items-center justify-between py-1.5 text-sm text-navy">
          <span>Remote only</span>
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => {
              setRemote(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-blue"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between py-1.5 text-sm text-navy">
          <span>Salary listed</span>
          <input
            type="checkbox"
            checked={salary}
            onChange={(e) => {
              setSalary(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 accent-blue"
          />
        </label>
      </Field>
    </div>
  );

  return (
    <div className="md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-start md:gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <aside className="hidden md:block md:sticky md:top-[72px] md:max-h-[calc(100vh-72px)] md:overflow-y-auto md:border-r md:border-line md:py-2 md:pr-6">
        {filters}
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
          <p className="text-sm font-medium text-muted">
            {loading ? "Updating…" : `${formatNumber(result.total)} jobs`}
          </p>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {active ? <span className="text-blue">· on</span> : null}
          </button>
        </div>

        <div className="grid gap-3">
          {result.jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {result.jobs.length === 0 && (
            <div className="py-12 text-center text-muted">No jobs matched those filters.</div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-3 text-sm">
            {result.page > 1 && (
              <button type="button" onClick={() => setPage(result.page - 1)} className="font-semibold text-blue">
                Previous
              </button>
            )}
            <span className="text-muted">
              Page {result.page} of {pages}
            </span>
            {result.page < pages && (
              <button type="button" onClick={() => setPage(result.page + 1)} className="font-semibold text-blue">
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-navy/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-navy">
                <Filter className="h-4 w-4" />
                Filters
              </p>
              <button type="button" aria-label="Close" onClick={() => setFiltersOpen(false)}>
                <X className="h-5 w-5 text-navy" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">{filters}</div>
            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="h-11 w-full bg-navy text-sm font-semibold text-white"
              >
                Show {formatNumber(result.total)} jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      {children}
    </section>
  );
}

function Choice({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between py-1.5 text-left text-sm ${
        active ? "font-semibold text-blue" : "text-navy hover:text-blue"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs font-medium text-muted">{formatNumber(count)}</span>
    </button>
  );
}
