import rawNews from "@/data/news.json";
import { NewsItem } from "@/types/news";

interface RawFallbackNewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  publishedAt: string;
}

const FALLBACK_IMAGE = "/images/news-placeholder.svg";

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

function normalizeFallbackItem(item: RawFallbackNewsItem): NewsItem {
  return {
    id: Number(item.id),
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    category: normalizeCategory(item.category),
    date: item.publishedAt,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl || FALLBACK_IMAGE,
  };
}

function getNormalizedFallbackNews(): NewsItem[] {
  return (rawNews as RawFallbackNewsItem[])
    .map(normalizeFallbackItem)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getFallbackNews(): NewsItem[] {
  return getNormalizedFallbackNews();
}

export function getFallbackByCategory(category: string): NewsItem[] {
  const normalizedCategory = normalizeCategory(category);
  return getNormalizedFallbackNews().filter(
    (item) => normalizeCategory(String(item.category)) === normalizedCategory,
  );
}

export function getFallbackBySlug(slug: string): NewsItem | undefined {
  return getNormalizedFallbackNews().find((item) => item.slug === slug);
}

export function getFallbackTrending(): NewsItem[] {
  const base = getNormalizedFallbackNews().slice(0, 10);
  const shuffled = [...base];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, 5);
}
