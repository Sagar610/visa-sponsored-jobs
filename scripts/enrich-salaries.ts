import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseSalary } from "../src/lib/salary";

async function main() {
  const file = path.join(process.cwd(), "data", "jobs.json");
  const jobs = JSON.parse(await readFile(file, "utf8")) as Array<{
    title: string;
    description: string;
    salary?: string | null;
  }>;
  let filled = 0;
  for (const job of jobs) {
    job.salary = parseSalary(`${job.title}\n${job.description}`);
    if (job.salary) filled += 1;
  }
  await writeFile(file, JSON.stringify(jobs), "utf8");
  console.log(`Salaries found on ${filled} of ${jobs.length} jobs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
