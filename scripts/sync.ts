import { syncAll } from "../src/lib/sync";

async function main() {
  console.log("Fetching Home Office register and live visa jobs…");
  const meta = await syncAll();
  console.log(JSON.stringify(meta, null, 2));
  if (!meta.lastSyncOk) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
