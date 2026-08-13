import { NextRequest, NextResponse } from "next/server";
import { loadStore } from "@/lib/store";
import { searchSponsors } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { sponsors } = await loadStore();
  const result = searchSponsors(sponsors, {
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    rating: searchParams.get("rating") || "all",
    hiring: searchParams.get("hiring") !== "0",
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 24),
  });
  return NextResponse.json(result);
}
