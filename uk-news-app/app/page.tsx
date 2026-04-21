import Link from "next/link";
import { Metadata } from "next";
import BreakingTicker from "@/components/BreakingTicker";
import HeroSection from "@/components/HeroSection";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import {
  getAllNews,
  getNewsByCategory,
  getTrendingNews,
  UI_CATEGORIES,
} from "@/lib/api";
import { NewsItem } from "@/types/news";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uk-news.example.com";

const fallbackStory: NewsItem = {
  id: 0,
  slug: "news-unavailable",
  title: "News feed is currently unavailable",
  excerpt: "Please check back shortly while we refresh today’s headlines.",
  category: "politics",
  date: new Date().toISOString().slice(0, 10),
  imageUrl: "/images/news-placeholder.svg",
  content: "Live content is temporarily unavailable.",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "UK News | Home",
    description: "Latest breaking stories, top categories, and trending UK news.",
    alternates: {
      canonical: `${siteUrl}/`,
    },
    openGraph: {
      title: "UK News | Home",
      description: "Latest breaking stories, top categories, and trending UK news.",
      url: `${siteUrl}/`,
      type: "website",
      images: ["/images/news-placeholder.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: "UK News | Home",
      description: "Latest breaking stories, top categories, and trending UK news.",
      images: ["/images/news-placeholder.svg"],
    },
  };
}

export default async function HomePage() {
  const [newsResponse, trending] = await Promise.all([
    getAllNews({ page: 1, limit: 10, sort: "latest" }),
    getTrendingNews(),
  ]);
  const news = newsResponse.data;

  const featured = news[0] ?? fallbackStory;
  const heroHighlights = news.slice(1, 5);
  const latest = news.slice(5);
  const categorySections = await Promise.all(
    UI_CATEGORIES.map(async (category) => ({
      category,
      items: (await getNewsByCategory(category)).slice(0, 4),
    })),
  );

  const latestWithInlineAds = latest.flatMap((item, index) => {
    const output: Array<{ type: "news"; item: NewsItem } | { type: "ad"; key: string }> = [
      { type: "news", item },
    ];

    if ((index + 1) % 4 === 0) {
      output.push({ type: "ad", key: `latest-ad-${index}` });
    }

    return output;
  });

  return (
    <div className="space-y-10">
      {/* <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
        Page {newsResponse.page} of {newsResponse.totalPages} · {newsResponse.total}{" "}
        total articles
      </div> */}

      <BreakingTicker
        headlines={trending.map((item) => item.title).slice(0, 5)}
      />

      {news.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">No news available</h1>
          <p className="mt-3 text-sm text-slate-600">
            We could not load articles right now. Please try again shortly.
          </p>
        </section>
      ) : (
        <HeroSection featured={featured} highlights={heroHighlights} />
      )}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Latest News</h2>
          <Link
            href="/news/category/politics"
            className="text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Browse categories
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
            {latestWithInlineAds.length > 0 ? (
              latestWithInlineAds.map((entry) =>
                entry.type === "news" ? (
                  <NewsCard key={entry.item.id} item={entry.item} size="small" />
                ) : (
                  <AdSlot
                    key={entry.key}
                    size="300x250"
                    placement="latest_inline_square"
                  />
                ),
              )
            ) : (
              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
                No latest stories found for this page.
              </div>
            )}
          </div>
          <Sidebar trendingItems={trending} newsletterSource="homepage" />
        </div>
      </section>

      {categorySections.map(({ category, items }) => {
        return (
          <section key={category}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold capitalize text-slate-900">
                {category}
              </h2>
              <Link
                href={`/news/category/${category}`}
                className="text-sm font-medium text-brand-700 hover:text-brand-900"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((item) => (
                <NewsCard key={item.id} item={item} size="small" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
