const slugify = require("slugify");
const News = require("../models/News");
const { rewriteArticle } = require("./aiRewrite.service");

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

    const generatedSlug = buildBaseSlug(item.title);
    const duplicate = await News.findOne({
      country: normalizedCountry,
      $or: [
        { title: item.title },
        item.sourceUrl ? { sourceUrl: item.sourceUrl } : { slug: generatedSlug },
      ],
    }).lean();

    if (duplicate) {
      skippedCount += 1;
      continue;
    }

    const rewritten = await rewriteArticle({
      title: item.title,
      description: item.description || "",
      content: item.content || "",
      category: normalizeCategory(item.category),
    });

    const finalTitle = rewritten.title || item.title;
    const finalDescription = rewritten.summary || item.description || "";
    const finalContent = rewritten.content || item.content || item.description || "";

    const uniqueSlug = await createUniqueSlug(finalTitle);

    const created = await News.create({
      title: finalTitle,
      slug: uniqueSlug,
      description: finalDescription,
      content: finalContent,
      image: item.image || "",
      category: normalizeCategory(item.category),
      country: normalizeCountry(item.country || normalizedCountry),
      language: item.language || "en",
      source: item.source || "GNews",
      sourceUrl: item.sourceUrl || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      isFeatured: Boolean(item.isFeatured),
      publishedAt: item.publishedAt || new Date(),
    });

    inserted.push(created);
  }

  return {
    insertedCount: inserted.length,
    skippedCount,
    items: inserted,
  };
}

async function getAllNews() {
  return News.find().sort({ publishedAt: -1 }).lean();
}

async function getNewsBySlug(slug) {
  return News.findOne({ slug }).lean();
}

async function getNewsByCategory(category, country = "gb") {
  return News.find({
    ...buildCountryFilter(country),
    category: buildCategoryQuery(category),
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
