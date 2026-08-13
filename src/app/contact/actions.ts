"use server";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir } from "@/lib/store";

export type ContactState = { ok: boolean; error?: string };

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (clean(formData.get("company"))) {
    return { ok: true };
  }

  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const topic = clean(formData.get("topic")) || "General";
  const message = clean(formData.get("message"));

  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email." };
  if (message.length < 20) return { ok: false, error: "Please write a little more detail (at least 20 characters)." };

  const file = path.join(dataDir(), "inquiries.json");
  await mkdir(dataDir(), { recursive: true });
  let existing: unknown[] = [];
  try {
    existing = JSON.parse(await readFile(file, "utf8")) as unknown[];
  } catch {
    existing = [];
  }
  existing.push({
    name,
    email,
    topic,
    message,
    receivedAt: new Date().toISOString(),
  });
  await writeFile(file, JSON.stringify(existing, null, 2), "utf8");
  return { ok: true };
}
