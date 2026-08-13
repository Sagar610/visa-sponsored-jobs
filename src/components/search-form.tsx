"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Search } from "lucide-react";

export function SearchForm({
  defaultQuery = "",
  defaultLocation = "",
}: {
  defaultQuery?: string;
  defaultLocation?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-full flex-col rounded-xl border-2 border-navy bg-white p-5 sm:p-6"
      role="search"
      aria-label="Search visa sponsored jobs"
    >
      <p className="text-lg font-bold text-navy">Search jobs</p>
      <p className="mt-1 text-sm text-muted">Licensed UK sponsors only.</p>

      <label className="mt-5 block">
        <span className="text-[15px] font-semibold text-navy">Job title or company</span>
        <span className="mt-2 flex items-center gap-3 rounded-lg border border-line bg-white px-4 focus-within:border-navy">
          <Search className="h-5 w-5 shrink-0 text-blue" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Software engineer, nurse, analyst…"
            className="h-14 w-full bg-transparent text-base text-ink placeholder:text-muted"
          />
        </span>
      </label>

      <label className="mt-4 block">
        <span className="text-[15px] font-semibold text-navy">City</span>
        <span className="mt-2 flex items-center gap-3 rounded-lg border border-line bg-white px-4 focus-within:border-navy">
          <MapPin className="h-5 w-5 shrink-0 text-blue" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="London or remote"
            className="h-14 w-full bg-transparent text-base text-ink placeholder:text-muted"
          />
        </span>
      </label>

      <button
        type="submit"
        className="mt-6 h-14 w-full rounded-lg bg-navy text-base font-semibold text-white hover:bg-blue"
      >
        Find jobs
      </button>
    </form>
  );
}
