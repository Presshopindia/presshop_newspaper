const cron = require("node-cron");
const { fetchNewsByCountry, resolveCountry } = require("../services/gnews.service");
const { saveNews } = require("../services/news.service");

function isCronEnabled() {
  const raw = String(process.env.NEWS_CRON_ENABLED ?? "true").toLowerCase();
  return ["true", "1", "yes", "on"].includes(raw);
}

function startNewsCron() {
  if (!isCronEnabled()) {
    console.log("[CRON] Auto ingestion is disabled (NEWS_CRON_ENABLED=false)");
    return;
  }

  const schedule = process.env.NEWS_CRON_SCHEDULE || "*/15 * * * *";
  const countries = String(process.env.NEWS_CRON_COUNTRIES || "gb,in,us")
    .split(",")
    .map((code) => resolveCountry(code))
    .filter((code, index, list) => list.indexOf(code) === index);

  cron.schedule(schedule, async () => {
    try {
      console.log(`[CRON] Fetching latest news for countries: ${countries.join(", ")}`);

      for (const country of countries) {
        const articles = await fetchNewsByCountry(country);
        console.log(`[CRON:${country}] Articles fetched: ${articles.length}`);
        const result = await saveNews(articles, country);
        console.log(
          `[CRON:${country}] Completed. Inserted: ${result.insertedCount}, Skipped: ${result.skippedCount}`,
        );
      }
    } catch (error) {
      console.error("[CRON] News fetch/save failed:", error.message);
    }
  });

  console.log(
    `[CRON] News ingestion scheduled: ${schedule} (countries: ${countries.join(", ")})`,
  );
}

module.exports = startNewsCron;
