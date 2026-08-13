export const SITE_NAME = "Visa Sponsored Jobs";
export const SITE_SHORT = "VS";
export const SITE_TAGLINE = "Current vacancies at Home Office licensed sponsors";
export const SITE_DESCRIPTION =
  "Search UK Skilled Worker visa jobs at companies licensed by the Home Office. Current vacancies, the official sponsor register, and visa news from GOV.UK.";
export const SITE_LOGO = "/visa-sponsored-jobs-logo.png";
export const SITE_LOGO_ALT =
  "Visa Sponsored Jobs logo — UK visa sponsored jobs at licensed sponsors";

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const DEVELOPER = {
  name: "Sagar Gondaliya",
  github: "https://github.com/Sagar610",
  linkedin: "https://www.linkedin.com/in/sagar-gondaliya",
};

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";

export const NAV = [
  { href: "/jobs", label: "Jobs" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/news", label: "Visa news" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_NAV = {
  Explore: [
    { href: "/jobs", label: "Sponsored jobs" },
    { href: "/sponsors", label: "Licensed sponsors" },
    { href: "/news", label: "UK visa news" },
    { href: "/guide", label: "Skilled Worker guide" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact us" },
    { href: "/privacy", label: "Privacy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
} as const;
