const newsService = require("../services/news.service");
const {
  COUNTRY_CONFIG,
  fetchNewsByCountry,
  resolveCountry,
} = require("../services/gnews.service");

function resolveCountryFromRequest(req) {
  const fromHeader = req.headers["x-country"];
  const fromQuery = req.query.country;
  return resolveCountry(fromHeader || fromQuery || "gb");
}

function resolveCountriesForSync(req) {
  const fromQuery = req.query.countries;
  if (typeof fromQuery === "string" && fromQuery.trim()) {
    return fromQuery
      .split(",")
      .map((value) => resolveCountry(value))
      .filter((value, index, list) => list.indexOf(value) === index);
  }

  return ["gb", "in", "us"];
}

async function getNews(req, res, next) {
  try {
    const { page, limit, category, search, sort } = req.query;
    const country = resolveCountryFromRequest(req);
    const result = await newsService.getAllNewsWithFilters({
      page,
      limit,
      category,
      search,
      sort,
      country,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getNewsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const news = await newsService.getNewsBySlug(slug);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
}

async function getNewsByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const country = resolveCountryFromRequest(req);
    const news = await newsService.getNewsByCategory(category, country);

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    next(error);
  }
}

async function syncNews(req, res, next) {
  try {
    const countries = resolveCountriesForSync(req);
    console.log(`[SYNC] Manual sync triggered for countries: ${countries.join(", ")}`);
    let inserted = 0;
    let skipped = 0;

    for (const country of countries) {
      const articles = await fetchNewsByCountry(country);
      console.log(`[SYNC:${country}] Articles fetched: ${articles.length}`);
      const result = await newsService.saveNews(articles, country);
      inserted += result.insertedCount;
      skipped += result.skippedCount;
      console.log(
        `[SYNC:${country}] Completed. Inserted: ${result.insertedCount}, Skipped: ${result.skippedCount}`,
      );
    }

    console.log(
      `[SYNC] Completed. Inserted: ${inserted}, Skipped: ${skipped}`,
    );

    return res.status(200).json({
      success: true,
      countries,
      inserted,
      skipped,
    });
  } catch (error) {
    return next(error);
  }
}

function getSupportedCountries(_req, res) {
  const countries = Object.keys(COUNTRY_CONFIG).map((code) => ({
    code,
    query: COUNTRY_CONFIG[code].query,
  }));

  return res.status(200).json({
    success: true,
    data: countries,
  });
}

module.exports = {
  getNews,
  syncNews,
  getNewsBySlug,
  getNewsByCategory,
  getSupportedCountries,
};
