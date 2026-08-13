"use client";

import { useEffect, useState } from "react";

export function SyncWatcher({ stale }: { stale: boolean }) {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">(
    stale ? "syncing" : "idle"
  );

  useEffect(() => {
    if (!stale) return;
    let cancelled = false;
    setStatus("syncing");
    fetch("/api/sync", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("sync failed");
        return res.json();
      })
      .then(() => {
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
  }, [stale]);

  if (status === "idle") return null;

  return (
    <div className="border-b border-sky-200 bg-sky-50 px-4 py-2 text-center text-sm text-blue">
      {status === "syncing" && "Updating jobs, sponsors and UK visa news…"}
      {status === "done" && "Listings updated."}
      {status === "error" && "Automatic update failed. Run npm run sync, then refresh."}
    </div>
  );
}
