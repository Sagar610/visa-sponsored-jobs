import { loadStore } from "@/lib/store";
import { getJob, relatedJobs } from "@/lib/search";
import { CATEGORY_LABELS, CONFIDENCE_LABELS, formatDate, formatRelative } from "@/lib/format";
import { snippet } from "@/lib/html";
import { siteUrl } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { JobDescription } from "@/components/job-description";
import { JobCard } from "@/components/job-card";
import { JobTools } from "@/components/job-tools";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowUpRight, Banknote, Briefcase, Clock, MapPin, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { jobs } = await loadStore();
  const job = getJob(jobs, decodeURIComponent(id));
  if (!job) return { title: "Job" };
  const description = `${job.title} at ${job.company} in ${job.location}${job.salary ? ` · ${job.salary}` : ""}. ${snippet(job.snippet || job.description, 140)}`;
  return {
    title: `${job.title} at ${job.company}`,
    description,
    alternates: { canonical: `/jobs/${encodeURIComponent(job.id)}` },
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description,
      type: "article",
    },
  };
}

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const { jobs } = await loadStore();
  const job = getJob(jobs, decodeURIComponent(id));
  if (!job) notFound();
  const pageUrl = `${siteUrl()}/jobs/${encodeURIComponent(job.id)}`;
  const similar = relatedJobs(jobs, job, 4);
  const registerUrl = "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers";
  const visaUrl = "https://www.gov.uk/skilled-worker-visa";
  const goingRateUrl = "https://www.gov.uk/skilled-worker-visa/your-job";

  return (
    <main className="page-wrap pb-24 pt-8 sm:pt-10 lg:pb-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: snippet(job.description, 400),
          datePosted: job.postedAt || undefined,
          hiringOrganization: { "@type": "Organization", name: job.company },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
              addressCountry: "GB",
            },
          },
          employmentType: "FULL_TIME",
          url: pageUrl,
          identifier: job.id,
          industry: CATEGORY_LABELS[job.category],
        }}
      />

      <Link href="/jobs" className="text-sm font-medium text-blue hover:underline">
        ← All jobs
      </Link>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-12">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {CATEGORY_LABELS[job.category]}
            {job.remote ? " · Remote" : ""}
            {job.jobTypes[0] ? ` · ${job.jobTypes[0]}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-navy sm:text-4xl">{job.title}</h1>
          <p className="mt-3 text-lg text-ink">
            {job.sponsorSlug ? (
              <Link href={`/sponsors/${job.sponsorSlug}`} className="font-semibold hover:text-blue">
                {job.company}
              </Link>
            ) : (
              <span className="font-semibold">{job.company}</span>
            )}
            <span className="text-muted"> · {job.location}</span>
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-4">
            <Fact
              icon={<Banknote className="h-4 w-4" />}
              label="Salary"
              value={job.salary || "Not listed"}
              strong={Boolean(job.salary)}
            />
            <Fact icon={<MapPin className="h-4 w-4" />} label="Location" value={job.remote ? `${job.location} · Remote` : job.location} />
            <Fact icon={<ShieldCheck className="h-4 w-4" />} label="Sponsorship" value={CONFIDENCE_LABELS[job.confidence]} />
            <Fact icon={<Clock className="h-4 w-4" />} label="Posted" value={formatRelative(job.postedAt)} hint={formatDate(job.postedAt)} />
          </dl>

          <div className="mt-5">
            <JobTools id={job.id} title={job.title} company={job.company} />
          </div>

          <section className="mt-8 border-t border-line pt-8">
            <h2 className="text-lg font-bold text-navy">Visa sponsorship</h2>
            {job.sponsor ? (
              <p className="mt-3 text-[15px] leading-7 text-muted">
                <strong className="font-semibold text-ink">{job.sponsor.name}</strong> is on the Home Office
                Skilled Worker register
                {job.sponsor.rating ? ` with an ${job.sponsor.rating} rating` : ""}
                {job.sponsor.city ? ` · ${job.sponsor.city}` : ""}
                {job.sponsor.county ? `, ${job.sponsor.county}` : ""}. A licence does not guarantee a Certificate of
                Sponsorship for this vacancy — confirm on the original advert.
              </p>
            ) : (
              <p className="mt-3 text-[15px] leading-7 text-muted">
                The advert mentions visa sponsorship, but the company name did not confidently match the latest
                Skilled Worker register. Check the{" "}
                <a href={registerUrl} target="_blank" rel="noreferrer" className="font-medium text-blue hover:underline">
                  official register
                </a>{" "}
                before you apply.
              </p>
            )}
            {job.skilledWorkerMention && (
              <p className="mt-3 text-sm font-medium text-navy">This advert names the Skilled Worker visa.</p>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-navy">Role overview</h2>
            <div className="mt-4">
              <JobDescription html={job.description} />
            </div>
          </section>
        </div>

        <aside className="mt-10 hidden lg:sticky lg:top-[88px] lg:mt-0 lg:block">
          <ApplyPanel
            applyUrl={job.sourceUrl}
            source={job.source}
            salary={job.salary}
            location={job.location}
            remote={job.remote}
            company={job.company}
            sponsorSlug={job.sponsorSlug}
            registerUrl={registerUrl}
            visaUrl={visaUrl}
            goingRateUrl={goingRateUrl}
          />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14 border-t border-line pt-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-navy">Similar jobs</h2>
              <p className="mt-1 text-sm text-muted">Same employer, city or category — so you can keep moving.</p>
            </div>
            <Link href={`/jobs?category=${job.category}`} className="text-sm font-semibold text-blue hover:underline">
              More {CATEGORY_LABELS[job.category].toLowerCase()}
            </Link>
          </div>
          <div className="grid gap-3">
            {similar.map((item) => (
              <JobCard key={item.id} job={item} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 py-3 lg:hidden">
        <a
          href={job.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-center gap-2 bg-navy text-sm font-semibold text-white"
        >
          Apply on original listing
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </main>
  );
}

function Fact({
  icon,
  label,
  value,
  hint,
  strong,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
}) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {icon}
        {label}
      </dt>
      <dd className={`mt-1 text-sm ${strong ? "font-bold text-mint" : "font-semibold text-navy"}`}>{value}</dd>
      {hint && hint !== value ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function ApplyPanel({
  applyUrl,
  source,
  salary,
  location,
  remote,
  company,
  sponsorSlug,
  registerUrl,
  visaUrl,
  goingRateUrl,
}: {
  applyUrl: string;
  source: string;
  salary: string | null;
  location: string;
  remote: boolean;
  company: string;
  sponsorSlug: string | null;
  registerUrl: string;
  visaUrl: string;
  goingRateUrl: string;
}) {
  return (
    <div>
      <a
        href={applyUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 items-center justify-center gap-2 bg-navy text-sm font-semibold text-white hover:bg-blue-2"
      >
        Apply on original listing
        <ArrowUpRight className="h-4 w-4" />
      </a>
      <p className="mt-2 text-xs leading-5 text-muted">
        Source: {source}. We never host applications — you apply on the employer’s site.
      </p>

      <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Pay</dt>
          <dd className="text-right font-semibold text-navy">{salary || "Not listed"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Where</dt>
          <dd className="text-right font-semibold text-navy">
            {location}
            {remote ? " · Remote" : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Employer</dt>
          <dd className="text-right font-semibold text-navy">
            {sponsorSlug ? (
              <Link href={`/sponsors/${sponsorSlug}`} className="hover:text-blue">
                {company}
              </Link>
            ) : (
              company
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-line pt-5">
        <p className="inline-flex items-center gap-1.5 text-sm font-bold text-navy">
          <Briefcase className="h-4 w-4" />
          Before you apply
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm leading-6 text-muted">
          <li>Ask if they will assign a Certificate of Sponsorship for this role.</li>
          <li>
            Check skill level and salary against the{" "}
            <a href={goingRateUrl} target="_blank" rel="noreferrer" className="font-medium text-blue hover:underline">
              Skilled Worker job rules
            </a>
            .
          </li>
          <li>
            Confirm the licence on the{" "}
            <a href={registerUrl} target="_blank" rel="noreferrer" className="font-medium text-blue hover:underline">
              Home Office register
            </a>
            .
          </li>
          <li>
            Read the official{" "}
            <a href={visaUrl} target="_blank" rel="noreferrer" className="font-medium text-blue hover:underline">
              Skilled Worker visa guide
            </a>
            .
          </li>
        </ol>
      </div>
    </div>
  );
}
