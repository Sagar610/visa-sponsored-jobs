import { loadStore, saveStore } from "../src/lib/store";
import { assignSlugs, attachJobs } from "../src/lib/sponsors";

async function main() {
  const store = await loadStore(true);
  const { sponsors, jobs } = attachJobs(assignSlugs(store.sponsors), store.jobs);
  await saveStore({ ...store, sponsors, jobs });
  const hiring = sponsors.filter((s) => s.jobCount > 0).length;
  console.log(`Sponsors: ${sponsors.length}. Hiring now: ${hiring}. Jobs linked: ${jobs.filter((j) => j.sponsorSlug).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
