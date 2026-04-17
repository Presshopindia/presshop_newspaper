import { Metadata } from "next";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { getAllNews } from "@/lib/api";

interface CategoryPageProps {
  params: { category: string };
}

function formatCategory(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uk-news.example.com";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const categoryName = formatCategory(params.category);

  return {
    title: `${categoryName} News | UK News`,
    description: `Latest ${categoryName.toLowerCase()} updates and stories.`,
    alternates: {
      canonical: `${siteUrl}/news/category/${params.category}`,
    },
    openGraph: {
      title: `${categoryName} News | UK News`,
      description: `Latest ${categoryName.toLowerCase()} updates and stories.`,
      type: "website",
      url: `${siteUrl}/news/category/${params.category}`,
      images: ["/images/news-placeholder.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} News | UK News`,
      description: `Latest ${categoryName.toLowerCase()} updates and stories.`,
      images: ["/images/news-placeholder.svg"],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const response = await getAllNews({
    page: 1,
    limit: 12,
    category: params.category,
    sort: "latest",
  });
  const items = response.data;

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-900">
        {formatCategory(params.category)} News
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Category archive rendered from reusable card components.
      </p>

      <p className="mt-2 text-xs text-slate-500">
        Showing page {response.page} of {response.totalPages} · {response.total} total
        results
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">No articles found</h2>
          <p className="mt-2 text-sm text-slate-600">
            We could not find stories in this category yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Back to homepage
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} size="small" />
          ))}
        </div>
      )}
    </section>
  );
}
