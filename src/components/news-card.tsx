import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className={`group block rounded-lg border border-line bg-white shadow-sm transition hover:border-blue/40 hover:shadow-md ${
        featured ? "p-6" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span className={item.kind === "official" ? "text-mint" : "text-blue"}>
          {item.kind === "official" ? "Official" : "News"}
        </span>
        <span className="text-muted">· {item.sourceName}</span>
        <span className="text-muted">· {formatDate(item.publishedAt)}</span>
      </div>
      <h3 className={`mt-2 font-bold text-navy group-hover:text-blue ${featured ? "text-xl" : "text-lg"}`}>
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted">{item.summary}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue">
        Read source <ArrowUpRight className="h-4 w-4" />
      </p>
    </a>
  );
}

export function NewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center text-muted">
        Visa news will appear here after the next daily sync.
      </div>
    );
  }
  const [lead, ...rest] = items;
  return (
    <div className="grid gap-3">
      {lead && <NewsCard item={lead} featured />}
      <div className="grid gap-3 md:grid-cols-2">
        {rest.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function HomeNews({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="page-wrap pb-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue">Updated daily</p>
          <h2 className="mt-1 text-2xl font-bold text-navy">UK visa news</h2>
          <p className="mt-1 text-sm text-muted">
            Official GOV.UK updates and top UK visa stories, in one place.
          </p>
        </div>
        <Link href="/news" className="text-sm font-semibold text-blue hover:underline">
          All visa news
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.slice(0, 4).map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
