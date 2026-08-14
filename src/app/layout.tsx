import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Source_Sans_3 } from "next/font/google";
import { Footer, Header } from "@/components/chrome";
import { JsonLd } from "@/components/json-ld";
import { SyncWatcher } from "@/components/sync-watcher";
import { DEVELOPER, SITE_DESCRIPTION, SITE_LOGO, SITE_NAME, siteUrl } from "@/lib/site";
import { isStale, loadStore } from "@/lib/store";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${SITE_NAME} — UK Skilled Worker visa jobs`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "UK visa jobs",
    "Skilled Worker visa",
    "visa sponsored jobs UK",
    "licensed sponsors",
    "Home Office sponsor register",
    "UKVI",
    "Certificate of Sponsorship",
    "UK visa news",
  ],
  authors: [{ name: DEVELOPER.name, url: DEVELOPER.linkedin }],
  creator: DEVELOPER.name,
  publisher: SITE_NAME,
  category: "jobs",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — UK Skilled Worker visa jobs`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — UK Skilled Worker visa jobs`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#12305b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { meta } = await loadStore();
  return (
    <html lang="en-GB" className={`${sourceSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg font-sans text-ink">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url,
              description: SITE_DESCRIPTION,
              publisher: {
                "@type": "Person",
                name: DEVELOPER.name,
                url: DEVELOPER.linkedin,
                sameAs: [DEVELOPER.github, DEVELOPER.linkedin],
              },
              potentialAction: {
                "@type": "SearchAction",
                target: `${url}/jobs?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url,
              logo: `${url}${SITE_LOGO}`,
              description: SITE_DESCRIPTION,
              founder: {
                "@type": "Person",
                name: DEVELOPER.name,
                url: DEVELOPER.linkedin,
                sameAs: [DEVELOPER.github, DEVELOPER.linkedin],
              },
            },
          ]}
        />
        <a
          href="#main"
          className="sr-only focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-navy"
        >
          Skip to content
        </a>
        <SyncWatcher stale={isStale(meta)} autoSync={!process.env.VERCEL} />
        <Header />
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
