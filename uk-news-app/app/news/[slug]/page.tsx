import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import AdSlot from "@/components/AdSlot";
import { getNewsByCategory, getNewsBySlug, getTrendingNews } from "@/lib/api";
import { formatDate, timeAgo } from "@/lib/formatDate";

interface NewsDetailPageProps {
  params: { slug: string };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://uk-news.example.com";
const authorName = "UK News Editorial Desk";

function buildLongDescription(excerpt: string, content: string): string {
  return `${excerpt} ${content} This in-depth report covers the wider context, key stakeholders, and what developments may follow in the coming days.`;
}

function buildArticleParagraphs(excerpt: string, content: string, category: string): string[] {
  return [
    `${excerpt} ${content}`,
    `The story has drawn attention across the ${category} landscape, with experts pointing to its immediate implications for policy, markets, and public confidence.`,
    "Beyond the headline update, analysts are closely watching how institutions and local stakeholders respond over the next week as timelines, priorities, and accountability measures become clearer.",
    "For readers, this development is part of a broader shift that has been unfolding over recent months, and the next round of announcements will likely define its long-term impact.",
  ];
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const article = await getNewsBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found | UK News",
      description: "The requested news article could not be found.",
    };
  }

  return {
    title: `${article.title} | UK News`,
    description: buildLongDescription(article.excerpt, article.content),
    alternates: {
      canonical: `${siteUrl}/news/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: buildLongDescription(article.excerpt, article.content),
      type: "article",
      url: `${siteUrl}/news/${article.slug}`,
      images: [article.imageUrl || "/images/news-placeholder.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: buildLongDescription(article.excerpt, article.content),
      images: [article.imageUrl || "/images/news-placeholder.svg"],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const [article, trending] = await Promise.all([
    getNewsBySlug(params.slug),
    getTrendingNews(),
  ]);

  if (!article) {
    notFound();
  }

  const relatedNews = (await getNewsByCategory(String(article.category)))
    .filter((item) => item.slug !== article.slug)
    .slice(0, 4);

  const articleParagraphs = buildArticleParagraphs(
    article.excerpt,
    article.content,
    String(article.category),
  );
  const articleUrl = `${siteUrl}/news/${article.slug}`;
  const imageUrl = article.imageUrl || "/images/news-placeholder.svg";
  const shareText = encodeURIComponent(article.title);
  const encodedUrl = encodeURIComponent(articleUrl);
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: [imageUrl],
    datePublished: article.publishedAt || article.date,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "UK News",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/news-placeholder.svg`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="space-y-8 lg:col-span-2">
          <nav className="text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-brand-700">
                  Home
                </Link>
              </li>
              <li>›</li>
              <li>
                <Link
                  href={`/news/category/${encodeURIComponent(String(article.category))}`}
                  className="capitalize hover:text-brand-700"
                >
                  {String(article.category)}
                </Link>
              </li>
              <li>›</li>
              <li className="text-slate-700">{article.title}</li>
            </ol>
          </nav>

          <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {article.category}
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>
                Published: {formatDate(article.publishedAt || article.date)} •{" "}
                {timeAgo(article.publishedAt || article.date)}
              </span>
              <span>Author: {authorName}</span>
            </div>
          </header>

          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative h-72 w-full overflow-hidden rounded-lg md:h-[420px]">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>
            <figcaption className="mt-3 text-xs text-slate-500">
              Featured image for: {article.title}
            </figcaption>
          </figure>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Share:</span>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600"
              >
                Twitter
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                LinkedIn
              </a>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                WhatsApp
              </a>
            </div>

            <div className="space-y-6 text-base leading-8 text-slate-700">
              {articleParagraphs.map((paragraph, index) => (
                <div key={`${article.slug}-para-${index}`} className="space-y-6">
                  <p>{paragraph}</p>
                  {index === 1 && (
                    <AdSlot size="728x90" placement="article_inline_banner" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <AdSlot size="300x250" placement="article_end_square" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Related News</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {relatedNews.map((item) => (
                <NewsCard key={item.id} item={item} size="small" />
              ))}
            </div>
          </section>
        </article>

        <div className="lg:col-span-1">
          <Sidebar trendingItems={trending} newsletterSource="article" />
        </div>
      </div>
    </>
  );
}
