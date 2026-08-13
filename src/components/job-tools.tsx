"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Link2, Share2 } from "lucide-react";

const KEY = "vsj-saved-jobs";

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function JobTools({
  id,
  title,
  company,
}: {
  id: string;
  title: string;
  company: string;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(id));
  }, [id]);

  function toggleSave() {
    const next = saved ? readSaved().filter((item) => item !== id) : [...readSaved().filter((item) => item !== id), id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(!saved);
  }

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this job link", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} at ${company}`, url });
        return;
      } catch {
        // Fall through to copy if the user cancels or share is unavailable.
      }
    }
    await copyLink();
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
      <button type="button" onClick={toggleSave} className="inline-flex items-center gap-1.5 text-navy hover:text-blue">
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current text-blue" : ""}`} />
        {saved ? "Saved" : "Save job"}
      </button>
      <button type="button" onClick={share} className="inline-flex items-center gap-1.5 text-navy hover:text-blue">
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 text-navy hover:text-blue">
        {copied ? <Check className="h-4 w-4 text-mint" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
