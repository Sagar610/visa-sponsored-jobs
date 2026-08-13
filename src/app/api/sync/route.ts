import { NextRequest, NextResponse } from "next/server";
import { isStale, loadStore } from "@/lib/store";
import { syncAll } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 180;
export const runtime = "nodejs";

function authorized(request: NextRequest) {
  const secret = process.env.SYNC_SECRET;
  const cron = process.env.CRON_SECRET;
  const header = request.headers.get("x-sync-secret");
  const query = request.nextUrl.searchParams.get("secret");
  const bearer = request.headers.get("authorization");
  if (cron && bearer === `Bearer ${cron}`) return true;
  if (!secret) return true;
  return header === secret || query === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const force = request.nextUrl.searchParams.get("force") === "1";
  const { meta } = await loadStore();
  if (!force && !isStale(meta)) {
    return NextResponse.json({ meta, stale: false, skipped: true });
  }
  const next = await syncAll();
  return NextResponse.json(next);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const meta = await syncAll();
  return NextResponse.json(meta);
}
