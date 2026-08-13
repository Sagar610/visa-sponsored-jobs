"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SponsorCard, SponsorRow } from "@/components/sponsor-card";
import { formatNumber } from "@/lib/format";
import type { Sponsor } from "@/lib/types";

type Result = {
  total: number;
  page: number;
  pageSize: number;
  hiringCount: number;
  sponsors: Sponsor[];
};

export function SponsorExplorer({
  initial,
  hiringCount,
  sponsorCount,
  registerLabel,
}: {
  initial: Result;
  hiringCount: number;
  sponsorCount: number;
  registerLabel: string;
}) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState("all");
  const [view, setView] = useState<"hiring" | "register">("hiring");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(initial);
  const [loading, setLoading] = useState(false);
  const skipFirst = useRef(true);

  const searching = Boolean(q.trim() || city.trim());
  const effectiveView = searching ? "register" : view;

  const query = useMemo(
    () => ({ q: q.trim(), city: city.trim(), rating, view: effectiveView, page }),
    [q, city, rating, effectiveView, page]
  );

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const handle = window.setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.q) params.set("q", query.q);
      if (query.city) params.set("city", query.city);
      if (query.rating !== "all") params.set("rating", query.rating);
      params.set("hiring", query.view === "hiring" ? "1" : "0");
      params.set("page", String(query.page));
      params.set("pageSize", query.view === "hiring" ? "24" : "40");
      try {
        const res = await fetch(`/api/sponsors?${params.toString()}`);
        if (res.ok) setResult(await res.json());
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => window.clearTimeout(handle);
  }, [query]);

  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <>
      <div className="mt-6 grid gap-2 rounded-lg border border-line bg-white p-2 shadow-sm md:grid-cols-[1fr_180px_140px]">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Start typing a company name"
          className="h-12 rounded-md bg-transparent px-4 text-ink placeholder:text-muted"
          autoComplete="off"
        />
        <input
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          placeholder="Town or city"
          className="h-12 rounded-md bg-transparent px-4 text-ink placeholder:text-muted"
          autoComplete="off"
        />
        <select
          value={rating}
          onChange={(e) => {
            setRating(e.target.value);
            setPage(1);
          }}
          className="h-12 rounded-md border-0 bg-transparent px-3 text-ink"
        >
          <option value="all">Any rating</option>
          <option value="A">A rating</option>
          <option value="B">B rating</option>
        </select>
      </div>
      <p className="mt-2 text-xs text-muted">Results update as you type. No search button needed.</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-line bg-white p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setView("hiring");
              setPage(1);
            }}
            className={`rounded px-3 py-1.5 ${effectiveView === "hiring" ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
          >
            Hiring now ({formatNumber(hiringCount)})
          </button>
          <button
            type="button"
            onClick={() => {
              setView("register");
              setPage(1);
            }}
            className={`rounded px-3 py-1.5 ${effectiveView === "register" ? "bg-navy text-white" : "text-muted hover:text-navy"}`}
          >
            Full register ({formatNumber(sponsorCount)})
          </button>
        </div>
        <p className="text-sm text-muted">
          {loading ? "Updating…" : `${formatNumber(result.total)} shown`}
          {registerLabel ? ` · ${registerLabel}` : ""}
        </p>
      </div>

      {effectiveView === "hiring" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {result.sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.slug} sponsor={sponsor} />
          ))}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_140px_90px_110px] bg-card-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
            <span>Organisation</span>
            <span>City</span>
            <span>Rating</span>
            <span className="text-right">Jobs</span>
          </div>
          {result.sponsors.map((sponsor) => (
            <SponsorRow key={sponsor.slug} sponsor={sponsor} />
          ))}
        </div>
      )}

      {result.sponsors.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">
          No sponsors matched. Try a shorter company name.
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-3 text-sm">
          {result.page > 1 && (
            <button
              type="button"
              onClick={() => setPage(result.page - 1)}
              className="rounded-md border border-line bg-white px-4 py-2"
            >
              Previous
            </button>
          )}
          <span className="px-2 py-2 text-muted">
            Page {result.page} of {pages}
          </span>
          {result.page < pages && (
            <button
              type="button"
              onClick={() => setPage(result.page + 1)}
              className="rounded-md border border-line bg-white px-4 py-2"
            >
              Next
            </button>
          )}
        </div>
      )}
    </>
  );
}
