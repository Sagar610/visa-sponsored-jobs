import type { JobCategory } from "./types";

const POSITIVE = [
  /visa sponsorship/i,
  /sponsorship available/i,
  /sponsorship (is )?offered/i,
  /we (can|will|do) sponsor/i,
  /can sponsor (a |your |the )?(visa|skilled worker)/i,
  /skilled worker visa/i,
  /skilled worker route/i,
  /certificate of sponsorship/i,
  /\bcos\b.{0,40}sponsor/i,
  /sponsor.{0,40}\bcos\b/i,
  /tier\s*2\b/i,
  /visa support (is )?available/i,
  /open to (visa )?sponsorship/i,
  /happy to sponsor/i,
  /able to sponsor/i,
  /sponsorship (will be|can be) provided/i,
];

const SKILLED_WORKER = [
  /skilled worker visa/i,
  /skilled worker route/i,
  /skilled worker sponsorship/i,
  /health and care (worker )?visa/i,
];

const STRONG_NEGATIVE = [
  /cannot sponsor/i,
  /can'?t sponsor/i,
  /unable to sponsor/i,
  /not (be )?able to (offer )?sponsor/i,
  /no visa sponsorship/i,
  /visa sponsorship is not (available|offered|provided)/i,
  /sponsorship is not (available|offered|provided)/i,
  /we do not sponsor/i,
  /does not (offer|provide) (visa )?sponsorship/i,
  /not offer(ing)? (visa )?sponsorship/i,
  /no sponsorship (available|offered|provided)/i,
];

const CATEGORY_RULES: Array<[JobCategory, RegExp]> = [
  ["software", /\b(software|developer|frontend|backend|full[\s-]?stack|devops|sre|react|python|java|golang|node\.?js|engineer,?\s*(i{1,3}|platform|platform|infrastructure)|site reliability|cyber|security engineer|mobile engineer|ios|android)\b/i],
  ["data", /\b(data scientist|data engineer|machine learning|ml ops|analytics|bi developer|statistician|ai engineer)\b/i],
  ["healthcare", /\b(nurse|nursing|nhs|doctor|gp\b|radiographer|pharmacist|healthcare|care assistant|midwife|paramedic|occupational therap|physiotherap|dentist|social worker)\b/i],
  ["engineering", /\b(civil engineer|mechanical|electrical engineer|structural|quantity survey|cad technician|hvac|manufacturing engineer)\b/i],
  ["finance", /\b(accountant|auditor|actuary|financial analyst|bookkeep|payroll|tax (manager|advisor)|investment|underwriter)\b/i],
  ["education", /\b(teacher|lecturer|teaching assistant|professor|tutor|head of year|sen(d)?co)\b/i],
  ["hospitality", /\b(chef|sous chef|restaurant|hotel|hospitality|barista|waiter|kitchen)\b/i],
  ["construction", /\b(bricklayer|carpenter|plumber|electrician|site manager|groundwork|scaffolder|construction)\b/i],
  ["legal", /\b(solicitor|barrister|paralegal|lawyer|legal counsel|compliance)\b/i],
  ["science", /\b(research scientist|laboratory|chemist|biologist|clinical research|pharmacolog)\b/i],
  ["sales", /\b(account executive|sales|business development|account manager|customer success)\b/i],
];

export function classifySponsorship(text: string) {
  const negative = STRONG_NEGATIVE.some((re) => re.test(text));
  const mentionsSponsorship = POSITIVE.some((re) => re.test(text));
  const skilledWorkerMention = SKILLED_WORKER.some((re) => re.test(text));
  return { negative, mentionsSponsorship, skilledWorkerMention };
}

export function classifyCategory(title: string, tags: string[], description: string): JobCategory {
  const hay = `${title} ${tags.join(" ")} ${description.slice(0, 800)}`;
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(hay)) return cat;
  }
  return "other";
}

export function isUkLocation(location: string, description: string): boolean {
  const hay = `${location} ${description.slice(0, 1200)}`.toLowerCase();
  const uk =
    /\b(uk|u\.k\.|united kingdom|great britain|britain|england|scotland|wales|northern ireland|london|manchester|birmingham|leeds|glasgow|edinburgh|bristol|liverpool|sheffield|newcastle|nottingham|leicester|southampton|cardiff|belfast|oxford|cambridge|reading|brighton|coventry|plymouth|derby|portsmouth|york|swansea|aberdeen|dundee|milton keynes|slough|croydon|watford|luton|northampton|norwich|exeter|bath|canterbury|guildford|ipswich|peterborough|wolverhampton|sunderland|hull|stoke|middlesbrough|warrington|swindon|bournemouth|poole|basildon|gloucester|cheltenham|maidstone|crawley|colchester|blackburn|bolton|oldham|rochdale|stockport|wigan|walsall|dudley|solihull)\b/i.test(
      hay
    );
  if (uk) return true;
  if (!location.trim()) return false;
  return false;
}

export const UK_NATIVE_SOURCES = new Set([
  "arbeitnow-uk",
  "adzuna",
  "reed",
  "teaching-vacancies",
  "greenhouse",
  "lever",
]);
