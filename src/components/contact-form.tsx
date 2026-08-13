"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/contact/actions";

const initial: ContactState = { ok: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
        <p className="font-bold text-mint">Message received</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Thank you. Sagar will get back to you as soon as possible. You can also reach him on LinkedIn
          or GitHub from this page.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-lg border border-line bg-white p-6 shadow-sm">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy">
          Name
          <input
            name="name"
            required
            className="mt-1 h-11 w-full rounded-md border border-line px-3 text-ink"
            placeholder="Your name"
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 h-11 w-full rounded-md border border-line px-3 text-ink"
            placeholder="you@email.com"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-navy">
        Topic
        <select name="topic" className="mt-1 h-11 w-full rounded-md border border-line px-3 text-ink">
          <option>General question</option>
          <option>Job listing feedback</option>
          <option>Partnership</option>
          <option>Press or media</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-medium text-navy">
        Message
        <textarea
          name="message"
          required
          minLength={20}
          rows={6}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-ink"
          placeholder="How can we help?"
        />
      </label>
      {state.error && <p className="mt-3 text-sm font-medium text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 h-11 rounded-md bg-blue px-5 text-sm font-semibold text-white hover:bg-blue-2 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
