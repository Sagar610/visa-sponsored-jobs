import { loadStore } from "@/lib/store";
import { getSponsorBySlug, initials, jobsForSponsor, uniqueLocations } from "@/lib/sponsors";
import { fetchCompanyBrief } from "@/lib/wikipedia";
import { JobCard } from "@/components/job-card";
import { CATEGORY_LABELS, formatNumber, formatRelative } from "@/lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Briefcase, MapPin, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { sponsors } = await loadStore();
  const sponsor = getSponsorBySlug(sponsors, slug);
  if (!sponsor) return { title: "Sponsor" };
  return {
    title: `${sponsor.name} — licensed sponsor`,
    description: `${sponsor.name} is a Home Office licensed Skilled Worker sponsor${sponsor.city ? ` in ${sponsor.city}` : ""}. See licence details and live visa sponsored jobs.`,
    alternates: { canonical: `/sponsors/${encodeURIComponent(sponsor.slug)}` },
  };
}

export default async function SponsorProfilePage({ params }: Props) {
  const { slug } = await params;
  const { sponsors, jobs, meta } = await loadStore();
  const sponsor = getSponsorBySlug(sponsors, decodeURIComponent(slug));
  if (!sponsor) notFound();

  const openJobs = jobsForSponsor(jobs, sponsor);
  const brief = await fetchCompanyBrief(sponsor.name);
  const places = uniqueLocations(openJobs);
  const companiesHouse = `https://find-and-update.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(sponsor.name)}`;

  return (
    <main className="page-wrap py-10">
      <Link href="/sponsors" className="text-sm font-medium text-blue hover:underline">
        ← All sponsors
      </Link>

      <section className="mt-5 rounded-lg border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row">
          {brief?.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brief.thumbnail}
              alt=""
              className="h-20 w-20 rounded-md object-cover ring-1 ring-line"
            />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-md bg-navy text-xl font-bold text-white">
              {initials(sponsor.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-mint">
              Home Office licensed · Skilled Worker
            </p>
            <h1 className="mt-1 text-3xl font-bold text-navy">{sponsor.name}</h1>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {[sponsor.city, sponsor.county].filter(Boolean).join(", ") || "United Kingdom"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-mint" />
                {sponsor.rating ? `${sponsor.rating} rating` : "Licensed"} · {sponsor.type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-blue" />
                {formatNumber(openJobs.length)} live job{openJobs.length === 1 ? "" : "s"}
              </span>
            </p>
            {brief?.description && (
              <p className="mt-2 text-sm font-medium text-ink">{brief.description}</p>
            )}
          </div>
        </div>

        {brief?.summary && (
          <p className="mt-5 text-[15px] leading-7 text-muted">
            {brief.summary}{" "}
            {brief.wikipediaUrl && (
              <a
                href={brief.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue hover:underline"
              >
                Wikipedia
              </a>
            )}
          </p>
        )}

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <Info
            label="Last seen hiring"
            value={
              sponsor.lastJobAt
                ? formatRelative(sponsor.lastJobAt)
                : "No live vacancy in this feed"
            }
            hint="From current job adverts, not an official CoS date"
          />
          <Info label="Licence routes" value={sponsor.routes.join(", ") || "Skilled Worker"} />
          <Info
            label="Register file"
            value={meta.registerUpdatedAt ? new Date(meta.registerUpdatedAt).toLocaleDateString("en-GB") : "Current"}
            hint="Home Office licensed sponsors CSV"
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={companiesHouse}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-card-2"
          >
            Companies House <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-card-2"
          >
            Official register <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-navy">Live jobs at this sponsor</h2>
            <p className="mt-1 text-sm text-muted">
              {openJobs.length
                ? `Matched from public boards${places.length ? ` · ${places.join(", ")}` : ""}`
                : "No live vacancy is in the current feed. The company is still on the Skilled Worker register."}
            </p>
          </div>
          {sponsor.categories.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {sponsor.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          {openJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Info({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md bg-card-2 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-navy">{value}</dd>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
