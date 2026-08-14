"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "syncing" | "done" | "error";

/**
 * Triggers an in-process sync when listings are stale.
 * Disabled on Vercel/serverless — data/ is read-only there; use GitHub Actions + redeploy.
 */
export function SyncWatcher({
  stale,
  autoSync = true,
}: {
  stale: boolean;
  autoSync?: boolean;
}) {
  const [status, setStatus] = useState<Status>(stale && autoSync ? "syncing" : "idle");

  useEffect(() => {
    if (!stale || !autoSync) return;
    let cancelled = false;
    setStatus("syncing");
    fetch("/api/sync", { method: "POST" })
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as {
          skipped?: boolean;
          reason?: string;
          lastSyncOk?: boolean;
          error?: string;
        };
        if (!res.ok) throw new Error(body.error || "sync failed");
        // Host cannot persist — treat as no-op, not a user-facing failure.
        if (body.skipped && body.reason === "read-only") {
          if (!cancelled) setStatus("idle");
          return;
        }
        if (cancelled) return;
        setStatus("done");
        window.location.reload();
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [stale, autoSync]);

  if (status === "idle") return null;

  return (
    <div className="border-b border-sky-200 bg-sky-50 px-4 py-2 text-center text-sm text-blue">
      {status === "syncing" && "Updating jobs, sponsors and UK visa news…"}
      {status === "done" && "Listings updated."}
      {status === "error" && "Automatic update failed. Run npm run sync, then refresh."}
    </div>
  );
}
