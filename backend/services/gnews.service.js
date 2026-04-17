const axios = require("axios");

const BLOCKED_SOURCES = [
  "bbc",
  "guardian",
  "cnn",
  "reuters",
  "nytimes",
  "sky",
  "telegraph",
];

const COUNTRY_CONFIG = {
  gb: { query: "uk OR london OR england" },
  in: { query: "india OR delhi OR mumbai" },
  us: { query: "usa OR america OR new york" },
  au: { query: "australia OR sydney" },
};

function resolveCountry(country = "") {
  const normalized = String(country).toLowerCase().trim();
  return COUNTRY_CONFIG[normalized] ? normalized : "gb";
}

function inferCategory(text = "") {
  const lower = text.toLowerCase();

  if (
    lower.includes("crime") ||
    lower.includes("police") ||
    lower.includes("murder") ||
    lower.includes("court") ||
    lower.includes("arrest") ||
    lower.includes("investigation")
  ) {
    return "crime";
  }

  if (
    lower.includes("election") ||
    lower.includes("parliament") ||
    lower.includes("minister") ||
    lower.includes("government") ||
    lower.includes("policy")
  ) {
    return "politics";
  }

  if (
    lower.includes("market") ||
    lower.includes("business") ||
    lower.includes("economy") ||
    lower.includes("startup") ||
    lower.includes("finance")
  ) {
    return "business";
  }

  if (
    lower.includes("match") ||
    lower.includes("league") ||
    lower.includes("football") ||
    lower.includes("sport") ||
    lower.includes("player")
  ) {
    return "sport";
  }

  if (
    lower.includes("tech") ||
    lower.includes("ai") ||
    lower.includes("software") ||
    lower.includes("cyber") ||
    lower.includes("digital")
  ) {
    return "tech";
  }

  if (
    lower.includes("film") ||
    lower.includes("music") ||
    lower.includes("festival") ||
    lower.includes("celebrity") ||
    lower.includes("entertainment")
  ) {
    return "entertainment";
  }

  return "politics";
}

function normalizeGnewsArticle(article, country) {
  const title = article?.title?.trim() || "Untitled";
  const description = article?.description?.trim() || "";
  const content = article?.content?.trim() || description;
  const source = article?.source?.name?.trim() || "Unknown";
  const publishedAt = article?.publishedAt
    ? new Date(article.publishedAt)
    : new Date();
  const image = article?.image || "";
  const category = inferCategory(`${title} ${description} ${content}`);
  const sourceUrl = article?.url || "";

  return {
    title,
    description,
    content,
    image,
    source,
    category,
    country,
    language: "en",
    sourceUrl,
    tags: [],
    isFeatured: false,
    publishedAt,
  };
}

function isBlockedSourceName(sourceName = "") {
  const normalized = sourceName.toLowerCase();
  return BLOCKED_SOURCES.some((keyword) => normalized.includes(keyword));
}

function uniqueByTitle(articles = []) {
  const seenTitles = new Set();
  return articles.filter((article) => {
    const title = article?.title?.trim();
    if (!title || seenTitles.has(title)) {
      return false;
    }
    seenTitles.add(title);
    return true;
  });
}

async function fetchHeadlinesPage(endpoint, apiKey, country, page, query) {
  const response = await axios.get(endpoint, {
    params: {
      country,
      lang: "en",
      max: 50,
      page,
      q: `${query} NOT (bbc OR guardian OR cnn OR reuters)`,
      token: apiKey,
    },
    timeout: 15000,
  });

  return Array.isArray(response?.data?.articles) ? response.data.articles : [];
}

async function fetchNewsByCountry(country = "gb") {
  const apiKey = process.env.GNEWS_API_KEY;
  const baseUrl = process.env.GNEWS_BASE_URL || "https://gnews.io/api/v4";

  if (!apiKey) {
    throw new Error("GNEWS_API_KEY is not configured");
  }

  const targetCountry = resolveCountry(country);
  const config = COUNTRY_CONFIG[targetCountry] || COUNTRY_CONFIG.gb;
  const endpoint = `${baseUrl}/top-headlines`;
  const allFetchedArticles = [];

  const pageOneArticles = await fetchHeadlinesPage(
    endpoint,
    apiKey,
    targetCountry,
    1,
    config.query,
  );
  allFetchedArticles.push(...pageOneArticles);

  let cleanArticles = uniqueByTitle(
    pageOneArticles.filter(
      (article) => !isBlockedSourceName(article?.source?.name || ""),
    ),
  );

  console.log(
    `[GNEWS:${targetCountry}] Page 1 fetched: ${pageOneArticles.length}, after source filter: ${cleanArticles.length}`,
  );

  if (cleanArticles.length < 15) {
    const pageTwoArticles = await fetchHeadlinesPage(
      endpoint,
      apiKey,
      targetCountry,
      2,
      config.query,
    );
    allFetchedArticles.push(...pageTwoArticles);

    const pageTwoClean = uniqueByTitle(
      pageTwoArticles.filter(
        (article) => !isBlockedSourceName(article?.source?.name || ""),
      ),
    );

    cleanArticles = uniqueByTitle([...cleanArticles, ...pageTwoClean]);

    console.log(
      `[GNEWS:${targetCountry}] Page 2 fetched: ${pageTwoArticles.length}, clean backfill added: ${pageTwoClean.length}, after backfill count: ${cleanArticles.length}`,
    );
  }

  if (cleanArticles.length < 15) {
    const seenTitles = new Set(cleanArticles.map((item) => item?.title));
    const blockedFallback = allFetchedArticles.filter((article) => {
      const title = article?.title;
      if (!title || seenTitles.has(title)) {
        return false;
      }

      if (!isBlockedSourceName(article?.source?.name || "")) {
        return false;
      }

      seenTitles.add(title);
      return true;
    });

    cleanArticles = uniqueByTitle([...cleanArticles, ...blockedFallback]);
    console.log(
      `[GNEWS:${targetCountry}] Fallback added blocked sources: ${blockedFallback.length}, final count: ${cleanArticles.length}`,
    );
  }

  console.log(
    `[GNEWS:${targetCountry}] Total fetched: ${allFetchedArticles.length}, after filter: ${
      allFetchedArticles.filter(
        (article) => !isBlockedSourceName(article?.source?.name || ""),
      ).length
    }, final used: ${cleanArticles.length}`,
  );

  return cleanArticles.map((article) => normalizeGnewsArticle(article, targetCountry));
}

async function fetchTopHeadlines() {
  return fetchNewsByCountry("gb");
}

module.exports = {
  COUNTRY_CONFIG,
  fetchNewsByCountry,
  fetchTopHeadlines,
  resolveCountry,
};
