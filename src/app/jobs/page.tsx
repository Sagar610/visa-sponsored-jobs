import { JobExplorer } from "@/components/job-explorer";
import { searchJobs } from "@/lib/search";
import { loadStore } from "@/lib/store";
import type { Confidence, JobCategory } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Live Skilled Worker jobs",
  description:
    "Browse UK visa sponsored jobs at Home Office licensed sponsors. Filter by location, category, remote work and sponsorship confidence.",
  alternates: { canonical: "/jobs" },
};

type Props = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    category?: string;
    remote?: string;
    salary?: string;
    confidence?: string;
    page?: string;
  }>;
};

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { jobs } = await loadStore();
  const initial = searchJobs(jobs, {
    q: params.q,
    location: params.location,
    category: (params.category as JobCategory | "all") || "all",
    remote: params.remote === "1",
    salary: params.salary === "1",
    confidence: (params.confidence as Confidence | "all" | "sponsoring") || "all",
    page: Number(params.page || 1),
    pageSize: 25,
  });

  return (
    <main className="page-wrap py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">Skilled Worker visa jobs</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
        Filter by city, category and sponsorship. Results update as you type.
      </p>
      <div className="mt-6 sm:mt-8">
        <JobExplorer
          initial={initial}
          defaults={{
            q: params.q,
            location: params.location,
            category: params.category,
            confidence: params.confidence,
            remote: params.remote === "1",
            salary: params.salary === "1",
          }}
        />
      </div>
    </main>
  );
}
