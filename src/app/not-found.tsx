import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-blue">404</p>
      <h1 className="mt-2 text-3xl font-bold text-navy">That page is not here</h1>
      <p className="mt-3 text-muted">
        The job may have dropped off the latest sync, or the link is out of date. Browse live listings
        on {SITE_NAME} instead.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <a href="/jobs" className="inline-flex rounded-md bg-blue px-5 py-3 text-sm font-semibold text-white">
          View jobs
        </a>
        <a href="/news" className="inline-flex rounded-md border border-line px-5 py-3 text-sm font-semibold text-navy">
          Visa news
        </a>
      </div>
    </main>
  );
}
