import { NextResponse } from "next/server";
import { loadStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { meta, jobs } = await loadStore();
  const cities = new Map<string, number>();
  for (const job of jobs) {
    const city = job.location.split(",")[0]?.trim() || "UK";
    cities.set(city, (cities.get(city) || 0) + 1);
  }
  return NextResponse.json({
    ...meta,
    topLocations: [...cities.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count })),
  });
}
