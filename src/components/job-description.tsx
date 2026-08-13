import { toSafeJobHtml } from "@/lib/html";

export function JobDescription({ html }: { html: string }) {
  const safe = toSafeJobHtml(html);
  if (!safe) {
    return <p className="mt-10 text-muted">No description provided by the source.</p>;
  }

  return (
    <article
      className="job-prose"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
