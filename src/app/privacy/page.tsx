import type { Metadata } from "next";
import { CONTACT_EMAIL, DEVELOPER, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Privacy notice for ${SITE_NAME}. We do not require accounts. Contact messages are used only to reply.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-blue">Legal</p>
      <h1 className="mt-1 text-3xl font-bold text-navy sm:text-4xl">Privacy</h1>
      <div className="mt-8 space-y-6 text-[16px] leading-7 text-muted">
        <p>
          {SITE_NAME} is operated by {DEVELOPER.name}. You can browse jobs, sponsors and news without
          creating an account.
        </p>
        <section>
          <h2 className="text-lg font-bold text-navy">What we collect</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>If you use the contact form: your name, email, topic and message, so we can reply.</li>
            <li>Standard server logs (IP address, browser, pages requested) for security and reliability.</li>
            <li>Job, sponsor and news data copied from public sources (GOV.UK, job boards and news feeds).</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">What we do not do</h2>
          <p className="mt-2">
            We do not sell personal data, run advertising profiles, or host job applications. Apply
            on the employer’s original listing.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">Cookies</h2>
          <p className="mt-2">
            The site does not use marketing cookies. Essential cookies may be set by the hosting
            platform to keep the service working.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-navy">Contact</h2>
          <p className="mt-2">
            Privacy questions: use the{" "}
            <a className="font-medium text-blue hover:underline" href="/contact">
              contact form
            </a>
            {CONTACT_EMAIL ? (
              <>
                {" "}
                or email{" "}
                <a className="font-medium text-blue hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </>
            ) : null}
            , or message {DEVELOPER.name} on{" "}
            <a className="font-medium text-blue hover:underline" href={DEVELOPER.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
