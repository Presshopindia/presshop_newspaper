import Link from "next/link";
import { NewsItem } from "@/types/news";
import AdSlot from "@/components/AdSlot";
import { formatDate, timeAgo } from "@/lib/formatDate";
import NewsletterForm from "@/components/NewsletterForm";

interface SidebarProps {
  trendingItems: NewsItem[];
  newsletterSource?: string;
}

export default function Sidebar({
  trendingItems,
  newsletterSource = "homepage",
}: SidebarProps) {
  const apiBase = process.env.NEWS_API_BASE_URL || "";
  const normalizedApiBase = apiBase.endsWith("/api/news")
    ? apiBase.replace(/\/api\/news$/, "")
    : apiBase;
  const subscribeEndpoint = `${normalizedApiBase}/api/subscribe`;

  return (
    <aside className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Trending Now</h2>
        <ul className="mt-4 space-y-4">
          {trendingItems.map((item, index) => (
            <li key={item.id} className="border-b border-slate-100 pb-3 last:border-0">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-brand-700">
                    {item.category}
                  </p>
                  <Link
                    href={`/news/${item.slug}`}
                    className="mt-1 line-clamp-2 block text-sm font-semibold leading-6 text-slate-800 hover:text-brand-700"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(item.publishedAt || item.date)} •{" "}
                    {timeAgo(item.publishedAt || item.date)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot size="300x250" placement="sidebar_square" />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Newsletter</h2>
        <p className="mt-2 text-sm text-slate-600">
          Get the top stories delivered to your inbox every morning.
        </p>
        <NewsletterForm endpoint={subscribeEndpoint} source={newsletterSource} />
      </section>
    </aside>
  );
}
