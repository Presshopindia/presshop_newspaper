import { NewsItem, NewsCategory, NewsListResponse } from "@/types/news";
import {
  getFallbackByCategory,
  getFallbackBySlug,
  getFallbackNews,
  getFallbackTrending,
} from "@/lib/fallback";
import { getFallbackAds } from "@/lib/adsFallback";
import { AdItem } from "@/types/news";

const API_BASE_URL = process.env.NEWS_API_BASE_URL;
const API_NEWS_PATH =
  API_BASE_URL && API_BASE_URL.endsWith("/api/news") ? "" : "/api/news";
const DEFAULT_COUNTRY = (process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "gb")
  .toLowerCase()
  .trim();
export const UI_CATEGORIES = [
  "politics",
  "crime",
  "entertainment",
  "sport",
  "business",
  "tech",
] as const;

const FALLBACK_IMAGE = "/images/news-placeholder.svg";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function normalizeNewsItem(item: Record<string, unknown>, index: number): NewsItem {
  const title = String(item.title ?? item.headline ?? "Untitled Article");
  const description = String(item.excerpt ?? item.description ?? "");
  const content = String(item.content ?? item.body ?? description);
  const category = normalizeCategory(String(item.category ?? "politics"));

  const publishedAt = String(
    item.date ?? item.publishedAt ?? new Date().toISOString().slice(0, 10),
  );

  return {
    id: Number(item.id ?? index + 1),
    slug: String(item.slug ?? slugify(title)),
    title,
    excerpt: description || "Read the latest updates from our news network.",
    category,
    date: publishedAt,
    publishedAt,
    imageUrl: String(item.imageUrl ?? item.image ?? item.thumbnail ?? FALLBACK_IMAGE),
    content,
    trending: Boolean(item.trending),
  };
}

function normalizeCategory(value: string): string {
  const category = value.toLowerCase().trim();

  if (["sports", "sport"].includes(category)) {
    return "sport";
  }

  if (["technology", "tech"].includes(category)) {
    return "tech";
  }

  if (["politics", "crime", "entertainment", "business"].includes(category)) {
    return category;
  }

  return "politics";
}

interface NewsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: "latest" | "oldest";
  country?: string;
}

function buildUrl(path: string, query?: NewsQueryParams): string {
  if (!API_BASE_URL) {
    throw new Error("NEWS_API_BASE_URL is not configured");
  }

  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const url = new URL(`${base}${path}`);

  if (query?.page) {
    url.searchParams.set("page", String(query.page));
  }

  if (query?.limit) {
    url.searchParams.set("limit", String(query.limit));
  }

  if (query?.category) {
    url.searchParams.set("category", normalizeCategory(query.category));
  }

  if (query?.search) {
    url.searchParams.set("search", query.search);
  }

  if (query?.sort) {
    url.searchParams.set("sort", query.sort);
  }

  const country = (query?.country || DEFAULT_COUNTRY || "gb").toLowerCase().trim();
  url.searchParams.set("country", country);

  return url.toString();
}

function buildAdsUrl(path: string, country?: string): string {
  if (!API_BASE_URL) {
    throw new Error("NEWS_API_BASE_URL is not configured");
  }

  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const rawPath = base.endsWith("/api/news")
    ? `${base.replace(/\/api\/news$/, "")}${path}`
    : `${base}${path}`;
  const url = new URL(rawPath);
  const resolvedCountry = (country || DEFAULT_COUNTRY || "gb").toLowerCase().trim();
  url.searchParams.set("country", resolvedCountry);
  return url.toString();
}

function getRequestCountry(country?: string): string {
  return (country || DEFAULT_COUNTRY || "gb").toLowerCase().trim();
}

async function fetchFromApi(
  path: string,
  query?: NewsQueryParams,
): Promise<Record<string, unknown>> {
  const requestCountry = getRequestCountry(query?.country);
  const response = await fetch(buildUrl(path, query), {
    next: { revalidate: 60 },
    headers: {
      "x-country": requestCountry,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

function toPaginatedFallbackResult(
  source: NewsItem[],
  page = 1,
  limit = 10,
  filters?: Pick<NewsQueryParams, "category" | "search" | "sort">,
): NewsListResponse {
  let filtered = [...source];

  if (filters?.category) {
    const normalizedCategory = normalizeCategory(filters.category);
    filtered = filtered.filter(
      (item) =>
        normalizeCategory(String(item.category)) === normalizedCategory,
    );
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter((item) => item.title.toLowerCase().includes(query));
  }

  filtered.sort((a, b) =>
    filters?.sort === "oldest"
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date),
  );

  const safePage = Math.max(page, 1);
  const safeLimit = Math.max(limit, 1);
  const start = (safePage - 1) * safeLimit;
  const data = filtered.slice(start, start + safeLimit);
  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);

  return { data, total, page: safePage, totalPages };
}

export async function getAllNews(
  params: NewsQueryParams = {},
): Promise<NewsListResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  try {
    const response = await fetchFromApi(`${API_NEWS_PATH}`, params);
    const rawData = Array.isArray(response.data)
      ? (response.data as Record<string, unknown>[])
      : [];
    const normalized = rawData.map((item, index) =>
      normalizeNewsItem(item, index),
    );
    const total = Number(response.total ?? normalized.length);
    const apiPage = Number(response.page ?? page);
    const totalPages = Number(
      response.totalPages ?? Math.max(Math.ceil(total / limit), 1),
    );

    if (normalized.length === 0) {
      console.warn("Empty API response, using fallback");
      return toPaginatedFallbackResult(getFallbackNews(), page, limit, params);
    }

    return {
      data: normalized,
      total,
      page: apiPage,
      totalPages,
    };
  } catch (error) {
    console.warn("API failed, using fallback data", error);
    return toPaginatedFallbackResult(getFallbackNews(), page, limit, params);
  }
}

export async function getTrendingNews(): Promise<NewsItem[]> {
  try {
    const response = await getAllNews({ page: 1, limit: 5, sort: "latest" });
    if (response.data.length === 0) {
      console.warn("Empty API response, using fallback");
      return getFallbackTrending();
    }

    return response.data.slice(0, 5);
  } catch (error) {
    console.warn("API failed, using fallback data", error);
    return getFallbackTrending();
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | undefined> {
  try {
    const response = await fetchFromApi(`${API_NEWS_PATH}/${slug}`, {
      country: DEFAULT_COUNTRY,
    });
    const item =
      response && typeof response === "object" && response.data
        ? normalizeNewsItem(response.data as Record<string, unknown>, 0)
        : undefined;

    if (!item) {
      console.warn("Empty API response, using fallback");
      return getFallbackBySlug(slug);
    }

    return item;
  } catch (error) {
    console.warn("API failed, using fallback data", error);
    return getFallbackBySlug(slug);
  }
}

export async function getNewsByCategory(category: string): Promise<NewsItem[]> {
  try {
    const response = await getAllNews({
      page: 1,
      limit: 20,
      category: normalizeCategory(category),
      sort: "latest",
    });

    if (response.data.length === 0) {
      console.warn("Empty API response, using fallback");
      return getFallbackByCategory(category);
    }

    return response.data;
  } catch (error) {
    console.warn("API failed, using fallback data", error);
    return getFallbackByCategory(category);
  }
}

export async function getCategories(): Promise<NewsCategory[]> {
  const allNews = await getAllNews({ page: 1, limit: 50 });
  return Array.from(
    new Set(
      allNews.data.map((item) =>
        normalizeCategory(String(item.category)),
      ) as NewsCategory[],
    ),
  );
}

export async function getAds(): Promise<AdItem[]> {
  try {
    const requestCountry = getRequestCountry();
    const res = await fetch(buildAdsUrl("/api/ads", requestCountry), {
      next: { revalidate: 60 },
      headers: {
        "x-country": requestCountry,
      },
    });

    if (!res.ok) {
      throw new Error(`Ads request failed with status ${res.status}`);
    }

    const json = (await res.json()) as { data?: Array<Record<string, unknown>> };

    if (!json?.data?.length) {
      throw new Error("Empty ads");
    }

    return json.data.map((ad, index) => ({
      id: String(ad.id ?? ad._id ?? `ad-${index}`),
      title: String(ad.title ?? "Sponsored"),
      imageUrl: String(ad.imageUrl ?? ad.image ?? FALLBACK_IMAGE),
      link: String(ad.link ?? "#"),
      type:
        String(ad.type ?? "square").toLowerCase() === "banner"
          ? "banner"
          : "square",
      key: String(ad.key ?? ad.placementKey ?? `generic-${index}`),
    }));
  } catch (err) {
    console.warn("Ads fallback used", err);
    return getFallbackAds();
  }
}
