import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { CONTACT_EMAIL, DEVELOPER, SITE_NAME } from "@/lib/site";
import { Github, Linkedin, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Contact ${SITE_NAME}. Developed by ${DEVELOPER.name}. Reach out about visa sponsored jobs, the sponsor register, or partnerships.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-blue">Get in touch</p>
      <h1 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">Contact us</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
        Questions about the site, a listing, or a partnership? Send a message below. {SITE_NAME} is
        developed by {DEVELOPER.name}.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <ContactForm />
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Developer</p>
            <p className="mt-2 text-lg font-bold text-navy">{DEVELOPER.name}</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Built {SITE_NAME} to make licensed-sponsor jobs and UK visa updates easier to find.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={DEVELOPER.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:underline"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={DEVELOPER.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:underline"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              {CONTACT_EMAIL && (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {CONTACT_EMAIL}
                </a>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-card-2 p-5 text-sm leading-6 text-muted">
            We cannot give immigration advice, assess your visa eligibility, or contact an employer on
            your behalf. For official rules use{" "}
            <a className="font-medium text-blue hover:underline" href="https://www.gov.uk/skilled-worker-visa" target="_blank" rel="noreferrer">
              GOV.UK
            </a>
            .
          </div>
        </aside>
      </div>
    </main>
  );
}
