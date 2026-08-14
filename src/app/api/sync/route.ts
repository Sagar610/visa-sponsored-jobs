import { NextRequest, NextResponse } from "next/server";
import { isDataWritable, isEphemeralRuntime, isStale, loadStore } from "@/lib/store";
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

async function cannotPersistResponse() {
  const { meta } = await loadStore();
  return NextResponse.json(
    {
      skipped: true,
      reason: "read-only",
      message:
        "This host cannot write data/. Run npm run sync locally or use the GitHub sync workflow, then redeploy.",
      meta,
      ephemeral: isEphemeralRuntime(),
    },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  try {
    if (!authorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isDataWritable())) {
      return cannotPersistResponse();
    }
    const force = request.nextUrl.searchParams.get("force") === "1";
    const { meta } = await loadStore();
    if (!force && !isStale(meta)) {
      return NextResponse.json({ meta, stale: false, skipped: true });
    }
    const next = await syncAll();
    return NextResponse.json(next);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        lastSyncOk: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!authorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await isDataWritable())) {
      return cannotPersistResponse();
    }
    const meta = await syncAll();
    return NextResponse.json(meta);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        lastSyncOk: false,
      },
      { status: 500 }
    );
  }
}
