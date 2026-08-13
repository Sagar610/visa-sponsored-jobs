import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Skilled Worker visa guide",
  description:
    "How Visa Sponsored Jobs matches live UK vacancies to the Home Office licensed-sponsor register, and what to check before you apply.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-blue">How this board works</p>
      <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">
        Finding a Skilled Worker visa job without the spreadsheet.
      </h1>
      <div className="mt-8 space-y-8 text-[16px] leading-7 text-muted">
        <section>
          <h2 className="text-lg font-bold text-navy">The problem</h2>
          <p className="mt-2">
            Most job sites mix every vacancy together. The Home Office does publish a register of licensed
            sponsors, but it is a large CSV, not a live jobs feed. A company on that list is not automatically
            hiring you with a Certificate of Sponsorship.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">What {SITE_NAME} does</h2>
          <p className="mt-2">
            The site downloads the latest Worker sponsor register from GOV.UK, keeps organisations licensed
            for the <strong className="text-ink">Skilled Worker</strong> route, then pulls live vacancies from
            public job APIs. A role is listed if:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>the advert talks about visa / Skilled Worker sponsorship, or</li>
            <li>the employer matches a current Skilled Worker licence and does not say they cannot sponsor.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">Updates happen on their own</h2>
          <p className="mt-2">
            There is no backend for you to upload jobs. While the app is running it refreshes jobs about every two
            hours and visa news at least daily. You can also run{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-navy">npm run sync</code>.
            Optional free Adzuna and Reed API keys add more coverage.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">Before you apply</h2>
          <p className="mt-2">
            Check the role is eligible (skill level and salary), that the employer will assign a Certificate of
            Sponsorship, and that you meet English language and other UKVI rules. This site is a discovery
            tool, not immigration advice.
          </p>
          <p className="mt-3">
            Official sources:{" "}
            <a
              className="font-medium text-blue hover:underline"
              href="https://www.gov.uk/skilled-worker-visa"
              target="_blank"
              rel="noreferrer"
            >
              Skilled Worker visa
            </a>{" "}
            and the{" "}
            <a
              className="font-medium text-blue hover:underline"
              href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
              target="_blank"
              rel="noreferrer"
            >
              register of licensed sponsors
            </a>
            .
          </p>
        </section>
        <div className="flex flex-wrap gap-3">
          <Link href="/jobs" className="inline-flex rounded-md bg-blue px-5 py-3 text-sm font-semibold text-white hover:bg-blue-2">
            Browse live jobs
          </Link>
          <Link href="/news" className="inline-flex rounded-md border border-line px-5 py-3 text-sm font-semibold text-navy hover:bg-card-2">
            UK visa news
          </Link>
        </div>
      </div>
    </main>
  );
}
