import type { Metadata } from "next";
import { NewsList } from "@/components/news-card";
import { formatRelative } from "@/lib/format";
import { loadNews } from "@/lib/news-store";
import { loadStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UK visa news",
  description:
    "Daily UK visa and immigration updates in one place — official GOV.UK announcements plus top stories from BBC News and The Guardian.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const [news, { meta }] = await Promise.all([loadNews(), loadStore()]);
  const official = news.filter((item) => item.kind === "official");
  const media = news.filter((item) => item.kind === "news");

  return (
    <main className="page-wrap py-10">
      <p className="text-sm font-semibold text-blue">Updated daily</p>
      <h1 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">UK visa news</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-muted">
        One place for the latest Skilled Worker, sponsor licence and UK immigration updates.
        We pull official GOV.UK releases first, then top UK media coverage. We link to the original
        source — we do not rewrite government guidance.
      </p>
      <p className="mt-3 text-sm text-muted">
        {meta.lastNewsSyncAt ? `Last news sync ${formatRelative(meta.lastNewsSyncAt)}` : "News syncs with the site update"}
        {news.length ? ` · ${news.length} stories` : ""}
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-navy">Official updates</h2>
        <p className="mt-1 text-sm text-muted">Home Office, UKVI and GOV.UK publications.</p>
        <div className="mt-4">
          <NewsList items={official.slice(0, 12)} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-navy">Top UK coverage</h2>
        <p className="mt-1 text-sm text-muted">Visa and immigration stories from BBC News and The Guardian.</p>
        <div className="mt-4">
          <NewsList items={media.slice(0, 16)} />
        </div>
      </section>
    </main>
  );
}
