import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DEVELOPER, FOOTER_NAV, SITE_NAME } from "@/lib/site";

export function Header() {
  return <SiteHeader />;
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="page-wrap grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold text-navy">{SITE_NAME}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Live UK Skilled Worker vacancies matched to the{" "}
            <a
              className="font-medium text-blue hover:underline"
              href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
              target="_blank"
              rel="noreferrer"
            >
              Home Office register of licensed sponsors
            </a>
            . A licence does not guarantee a Certificate of Sponsorship for a specific role.
          </p>
          <p className="mt-4 text-sm font-semibold text-navy">Developed by {DEVELOPER.name}</p>
          <div className="mt-3 flex gap-3">
            <a
              href={DEVELOPER.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-navy hover:bg-card-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={DEVELOPER.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-navy hover:bg-card-2"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
        {Object.entries(FOOTER_NAV).map(([heading, links]) => (
          <div key={heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{heading}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy hover:text-blue">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line bg-navy">
        <div className="page-wrap flex flex-col gap-2 py-4 text-xs text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_NAME}. Developed by {DEVELOPER.name}. Not affiliated with UKVI or the Home Office.
          </p>
          <p>Not immigration advice. Always confirm on GOV.UK.</p>
        </div>
      </div>
    </footer>
  );
}
