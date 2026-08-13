import { isNewsStale, syncNews } from "./news-store";
import { isStale, loadStore } from "./store";
import { syncAll } from "./sync";

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  const tick = async () => {
    try {
      const { meta } = await loadStore();
      if (isStale(meta, 2 * 60 * 60 * 1000)) {
        console.log("[visasponsoredjobs] syncing jobs, sponsors and visa news…");
        const result = await syncAll();
        console.log(
          `[visasponsoredjobs] sync done: ${result.jobCount} jobs, ${result.sponsorCount} sponsors, ${result.newsCount} news in ${result.durationMs}ms`
        );
        return;
      }
      if (isNewsStale(meta.lastNewsSyncAt)) {
        console.log("[visasponsoredjobs] refreshing UK visa news…");
        const news = await syncNews();
        console.log(`[visasponsoredjobs] news updated: ${news.length} stories`);
      }
    } catch (error) {
      console.error("[visasponsoredjobs] sync failed", error);
    }
  };

  void tick();
  setInterval(tick, 15 * 60 * 1000);
}
