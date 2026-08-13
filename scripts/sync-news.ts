import { syncNews } from "../src/lib/news-store";

async function main() {
  const items = await syncNews();
  console.log("News stories:", items.length);
  for (const item of items.slice(0, 12)) {
    console.log(`${item.kind} | ${item.sourceName} | ${item.title}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
