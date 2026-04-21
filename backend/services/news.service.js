const slugify = require("slugify");
const News = require("../models/News");
const { rewriteArticle } = require("./aiRewrite.service");

const NEWS_RETENTION_HOURS = Math.max(Number(process.env.NEWS_RETENTION_HOURS) || 48, 1);

function normalizeCategory(category = "") {
  const value = String(category).toLowerCase().trim();

  if (["sports", "sport"].includes(value)) {
    return "sport";
  }

  if (["technology", "tech"].includes(value)) {
    return "tech";
  }

  if (["politics", "crime", "entertainment", "business"].includes(value)) {
    return value;
  }

  return "politics";
}

function normalizeCountry(country = "") {
  const value = String(country).toLowerCase().trim();
  return value || "gb";
}

function buildCountryFilter(country = "gb") {
  const normalized = normalizeCountry(country);
  if (normalized === "gb") {
    return {
      $or: [
        { country: "gb" },
        { country: "" },
        { country: null },
        { country: { $exists: false } },
      ],
    };
  }

  return { country: normalized };
}

function buildCategoryQuery(category = "") {
  const normalized = normalizeCategory(category);

  if (normalized === "sport") {
    return { $in: ["sport", "sports"] };
  }

  if (normalized === "tech") {
    return { $in: ["tech", "technology"] };
  }

  return normalized;
}

function buildBaseSlug(title) {
  return slugify(title || "untitled-news", {
    lower: true,
    strict: true,
    trim: true,
  });
}

function normalizeTitleForCompare(title = "") {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

function normalizeSourceUrl(url = "") {
  const value = String(url).trim();
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.toString();
  } catch {
    return value;
  }
}

function escapeRegex(input = "") {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRetentionCutoffDate() {
  return new Date(Date.now() - NEWS_RETENTION_HOURS * 60 * 60 * 1000);
}

async function isDuplicateNewsItem(item, country) {
  const rawTitle = String(item?.title || "").trim();
  const source = String(item?.source || "GNews").trim();
  const normalizedSourceUrl = normalizeSourceUrl(item?.sourceUrl || "");

  if (normalizedSourceUrl) {
    const urlDuplicate = await News.findOne({
      country,
      sourceUrl: normalizedSourceUrl,
    }).lean();

    if (urlDuplicate) {
      return true;
    }
  }

  if (!rawTitle) {
    return false;
  }

  const titleRegex = new RegExp(`^${escapeRegex(rawTitle)}$`, "i");
  const titleDuplicate = await News.findOne({
    country,
    source,
    title: titleRegex,
  }).lean();

  return Boolean(titleDuplicate);
}

async function createUniqueSlug(title) {
  const baseSlug = buildBaseSlug(title);
  let candidate = baseSlug;
  let counter = 1;

  while (await News.exists({ slug: candidate })) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

async function saveNews(newsItems = [], country = "gb") {
  if (!Array.isArray(newsItems) || newsItems.length === 0) {
    return {
      insertedCount: 0,
      skippedCount: 0,
      items: [],
    };
  }

  const normalizedCountry = normalizeCountry(country);
  const inserted = [];
  let skippedCount = 0;

  for (const item of newsItems) {
    if (!item?.title) {
      skippedCount += 1;
      continue;
    }

    const normalizedInput = {
      ...item,
      title: normalizeTitleForCompare(item.title) ? String(item.title).trim() : "",
      source: String(item.source || "GNews").trim(),
      sourceUrl: normalizeSourceUrl(item.sourceUrl || ""),
    };

    if (!normalizedInput.title) {
      skippedCount += 1;
      continue;
    }

    if (await isDuplicateNewsItem(normalizedInput, normalizedCountry)) {
      skippedCount += 1;
      continue;
    }

    const rewritten = await rewriteArticle({
      title: normalizedInput.title,
      description: normalizedInput.description || "",
      content: normalizedInput.content || "",
      category: normalizeCategory(normalizedInput.category),
    });

    const finalTitle = rewritten.title || normalizedInput.title;
    const finalDescription = rewritten.summary || normalizedInput.description || "";
    const finalContent =
      rewritten.content ||
      normalizedInput.content ||
      normalizedInput.description ||
      "";

    if (
      finalTitle &&
      normalizeTitleForCompare(finalTitle) !==
        normalizeTitleForCompare(normalizedInput.title) &&
      (await isDuplicateNewsItem({ ...normalizedInput, title: finalTitle }, normalizedCountry))
    ) {
      skippedCount += 1;
      continue;
    }

    const uniqueSlug = await createUniqueSlug(finalTitle);

    let created;
    try {
      created = await News.create({
        title: finalTitle,
        slug: uniqueSlug,
        description: finalDescription,
        content: finalContent,
        image: normalizedInput.image || "",
        category: normalizeCategory(normalizedInput.category),
        country: normalizeCountry(normalizedInput.country || normalizedCountry),
        language: normalizedInput.language || "en",
        source: normalizedInput.source,
        sourceUrl: normalizedInput.sourceUrl,
        tags: Array.isArray(normalizedInput.tags) ? normalizedInput.tags : [],
        isFeatured: Boolean(normalizedInput.isFeatured),
        publishedAt: normalizedInput.publishedAt || new Date(),
      });
    } catch (error) {
      if (error?.code === 11000) {
        skippedCount += 1;
        continue;
      }
      throw error;
    }

    inserted.push(created);
  }

  return {
    insertedCount: inserted.length,
    skippedCount,
    items: inserted,
  };
}

async function getAllNews() {
  return News.find({ publishedAt: { $gte: getRetentionCutoffDate() } })
    .sort({ publishedAt: -1 })
    .lean();
}

async function getNewsBySlug(slug) {
  return News.findOne({
    slug,
    publishedAt: { $gte: getRetentionCutoffDate() },
  }).lean();
}

async function getNewsByCategory(category, country = "gb") {
  return News.find({
    ...buildCountryFilter(country),
    category: buildCategoryQuery(category),
    publishedAt: { $gte: getRetentionCutoffDate() },
  })
    .sort({ publishedAt: -1 })
    .lean();
}

async function getAllNewsWithFilters(options = {}) {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.max(Math.min(Number(options.limit) || 10, 100), 1);
  const skip = (page - 1) * limit;
  const category = options.category ? String(options.category).toLowerCase() : null;
  const search = options.search ? String(options.search).trim() : "";
  const sort = options.sort === "oldest" ? "oldest" : "latest";
  const country = normalizeCountry(options.country || "gb");

  const query = buildCountryFilter(country);
  query.publishedAt = { $gte: getRetentionCutoffDate() };

  if (category) {
    query.category = buildCategoryQuery(category);
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const sortQuery = sort === "oldest" ? { publishedAt: 1 } : { publishedAt: -1 };

  const [data, total] = await Promise.all([
    News.find(query).sort(sortQuery).skip(skip).limit(limit).lean(),
    News.countDocuments(query),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    data,
    total,
    page,
    totalPages,
  };
}

module.exports = {
  saveNews,
  getAllNews,
  getAllNewsWithFilters,
  getNewsBySlug,
  getNewsByCategory,
};
