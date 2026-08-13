import { fetchHimalayasJobs, fetchJobicyJobs, fetchRemotiveJobs } from "../src/lib/ingest/boards";
import { fetchAtsJobs } from "../src/lib/ingest/ats";
import {
  fetchLandingJobs,
  fetchMuseJobs,
  fetchTeachingVacancies,
  fetchWeWorkRemotelyJobs,
  fetchWorkingNomadsJobs,
} from "../src/lib/ingest/uk-feeds";
import { fetchRemoteOkJobs } from "../src/lib/ingest/remoteok";

async function count(name: string, fn: () => Promise<unknown[]>) {
  const started = Date.now();
  try {
    const rows = await fn();
    console.log(`${name.padEnd(22)} ${String(rows.length).padStart(5)} jobs  ${Date.now() - started}ms`);
    return rows.length;
  } catch (error) {
    console.log(`${name.padEnd(22)} FAIL  ${error instanceof Error ? error.message : error}`);
    return 0;
  }
}

async function main() {
  const total =
    (await count("teaching-vacancies", fetchTeachingVacancies)) +
    (await count("themuse", fetchMuseJobs)) +
    (await count("weworkremotely", fetchWeWorkRemotelyJobs)) +
    (await count("workingnomads", fetchWorkingNomadsJobs)) +
    (await count("landingjobs", fetchLandingJobs)) +
    (await count("himalayas", fetchHimalayasJobs)) +
    (await count("remotive", fetchRemotiveJobs)) +
    (await count("jobicy", fetchJobicyJobs)) +
    (await count("remoteok", fetchRemoteOkJobs)) +
    (await count("ats-boards", fetchAtsJobs));
  console.log("raw new-source total", total);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
