import type { Metadata } from "next";
import Link from "next/link";
import { DEVELOPER, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE_NAME} is a free UK Skilled Worker visa job board matched to the Home Office licensed-sponsor register, with daily visa news. Developed by ${DEVELOPER.name}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-blue">About</p>
      <h1 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">{SITE_NAME}</h1>
      <div className="mt-8 space-y-8 text-[16px] leading-7 text-muted">
        <section>
          <h2 className="text-lg font-bold text-navy">Why this site exists</h2>
          <p className="mt-2">
            Finding a UK job that can actually lead to a Skilled Worker visa usually means jumping
            between job boards and a huge Home Office CSV. {SITE_NAME} puts licensed-sponsor jobs,
            the official register, and UK visa news in one professional place.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">What we publish</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Live vacancies matched to Skilled Worker licensed sponsors</li>
            <li>A searchable copy of the Home Office worker sponsor register</li>
            <li>Daily UK visa news from GOV.UK, BBC News and The Guardian</li>
            <li>A plain-English guide to using the board — not immigration advice</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">How data is updated</h2>
          <p className="mt-2">
            Jobs and the sponsor register refresh automatically about every two hours while the app
            is running. Visa news syncs at least daily from public feeds. There is no manual upload
            of vacancies.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">Developed by {DEVELOPER.name}</h2>
          <p className="mt-2">
            {SITE_NAME} is designed, built and maintained by {DEVELOPER.name}. Connect on{" "}
            <a className="font-medium text-blue hover:underline" href={DEVELOPER.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>{" "}
            or{" "}
            <a className="font-medium text-blue hover:underline" href={DEVELOPER.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            .
          </p>
        </section>
        <div className="flex flex-wrap gap-3">
          <Link href="/jobs" className="rounded-md bg-blue px-5 py-3 text-sm font-semibold text-white hover:bg-blue-2">
            Browse jobs
          </Link>
          <Link href="/contact" className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-navy hover:bg-card-2">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
