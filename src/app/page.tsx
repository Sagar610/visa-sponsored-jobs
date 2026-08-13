import { SearchForm } from "@/components/search-form";
import { JobCard } from "@/components/job-card";
import { HomeNews } from "@/components/news-card";
import { loadNews } from "@/lib/news-store";
import { loadStore } from "@/lib/store";
import { SITE_TAGLINE } from "@/lib/site";
import { formatNumber, formatRelative } from "@/lib/format";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Newspaper, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ jobs, meta }, news] = await Promise.all([loadStore(), loadNews()]);
  const featured = jobs.slice(0, 6);

  return (
    <main>
      <section className="border-b border-line bg-white">
        <div className="page-wrap py-10 sm:py-14">
          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-blue">UK Skilled Worker visa jobs</p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.15] tracking-tight text-navy sm:text-5xl xl:text-[3.25rem]">
                Find visa sponsored jobs at licensed UK employers.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">{SITE_TAGLINE}.</p>
            </div>
            <SearchForm />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Live jobs"
              value={formatNumber(meta.jobCount || jobs.length)}
              hint={meta.lastSyncAt ? `Updated ${formatRelative(meta.lastSyncAt)}` : "Waiting for first sync"}
            />
            <Stat
              label="Licensed sponsors"
              value={formatNumber(meta.sponsorCount)}
              hint="Skilled Worker route, GOV.UK"
            />
            <Stat
              label="Visa news"
              value={formatNumber(meta.newsCount || news.length)}
              hint={meta.lastNewsSyncAt ? `News ${formatRelative(meta.lastNewsSyncAt)}` : "Daily official updates"}
            />
          </div>
        </div>
      </section>

      <section className="page-wrap grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <Step
          icon={<RefreshCw className="h-5 w-5 text-blue" />}
          title="Updated automatically"
          body="Jobs and the Home Office register refresh on a schedule. Visa news syncs daily from official sources."
        />
        <Step
          icon={<BadgeCheck className="h-5 w-5 text-mint" />}
          title="Skilled Worker only"
          body="We keep roles that mention visa sponsorship, or that sit at a company licensed for the Skilled Worker route."
        />
        <Step
          icon={<Building2 className="h-5 w-5 text-navy" />}
          title="Search the register"
          body="Check a company on the licensed-sponsor list even when they are not advertising right now."
        />
        <Step
          icon={<Newspaper className="h-5 w-5 text-blue" />}
          title="Visa news, one place"
          body="GOV.UK, BBC and Guardian immigration updates — without opening ten tabs."
        />
      </section>

      <section className="page-wrap pb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy">Latest jobs</h2>
            <p className="mt-1 text-sm text-muted">Apply on the employer’s own listing. We never host applications.</p>
          </div>
          <Link href="/jobs" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue hover:underline">
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">
            First sync is running. Jobs will appear here shortly.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <HomeNews items={news} />
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-card-2 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}

function Step({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
