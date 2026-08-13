import { NextRequest, NextResponse } from "next/server";
import { loadStore } from "@/lib/store";
import { searchJobs } from "@/lib/search";
import type { Confidence, JobCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { jobs } = await loadStore();
  const result = searchJobs(jobs, {
    q: searchParams.get("q") || undefined,
    location: searchParams.get("location") || undefined,
    category: (searchParams.get("category") as JobCategory | "all") || "all",
    remote: searchParams.get("remote") === "1",
    salary: searchParams.get("salary") === "1",
    confidence: (searchParams.get("confidence") as Confidence | "all" | "sponsoring") || "all",
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 20),
  });
  return NextResponse.json(result);
}
