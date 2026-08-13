import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `${SITE_NAME} is a discovery tool, not immigration advice, and is not affiliated with UKVI or the Home Office.`,
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-blue">Legal</p>
      <h1 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">Disclaimer</h1>
      <div className="mt-8 space-y-6 text-[16px] leading-7 text-muted">
        <p>
          {SITE_NAME} is an independent discovery website. It is not affiliated with, endorsed by, or
          connected to UK Visas and Immigration, the Home Office, or any employer listed here.
        </p>
        <p>
          A company appearing on the licensed-sponsor register is not a promise that a given vacancy
          will offer a Certificate of Sponsorship. Always confirm sponsorship, salary and skill level
          on the original advert and on{" "}
          <a className="font-medium text-blue hover:underline" href="https://www.gov.uk/skilled-worker-visa" target="_blank" rel="noreferrer">
            GOV.UK
          </a>
          .
        </p>
        <p>
          News headlines are aggregated from public sources and link back to those publishers. We do
          not provide immigration advice. If you need advice, instruct a qualified adviser regulated
          by the{" "}
          <a className="font-medium text-blue hover:underline" href="https://www.gov.uk/find-an-immigration-adviser" target="_blank" rel="noreferrer">
            Office of the Immigration Services Commissioner
          </a>
          .
        </p>
        <p>
          Listings and news can change between syncs. We make reasonable efforts to keep data current
          but cannot guarantee completeness or accuracy.
        </p>
      </div>
    </main>
  );
}
