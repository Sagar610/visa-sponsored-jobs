import { searchSponsors } from "@/lib/search";
import { loadStore } from "@/lib/store";
import { SponsorExplorer } from "@/components/sponsor-explorer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Licensed Skilled Worker sponsors",
  description:
    "Search the official Home Office register of UK Skilled Worker licensed sponsors. Type a company name to see licence details and live jobs.",
  alternates: { canonical: "/sponsors" },
};

export default async function SponsorsPage() {
  const { sponsors, meta } = await loadStore();
  const initial = searchSponsors(sponsors, { hiring: true, page: 1, pageSize: 24 });
  const registerLabel = meta.registerUpdatedAt
    ? `register ${new Date(meta.registerUpdatedAt).toLocaleDateString("en-GB")}`
    : "";

  return (
    <main className="page-wrap py-10">
      <p className="text-sm font-semibold text-blue">Home Office register</p>
      <h1 className="mt-1 text-3xl font-bold text-navy">Licensed Skilled Worker sponsors</h1>
      <p className="mt-2 max-w-3xl text-muted">
        Type a company name to search instantly. Click a company for licence details and live jobs.
        The Home Office does not publish the last Certificate of Sponsorship date — we show{" "}
        <strong className="font-semibold text-ink">last seen hiring</strong> from current vacancies.
      </p>
      <SponsorExplorer
        initial={initial}
        hiringCount={initial.hiringCount}
        sponsorCount={meta.sponsorCount}
        registerLabel={registerLabel}
      />
    </main>
  );
}
