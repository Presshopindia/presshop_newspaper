import Image from "next/image";
import Link from "next/link";
import { NewsItem } from "@/types/news";
import { formatDate, timeAgo } from "@/lib/formatDate";

interface HeroSectionProps {
  featured: NewsItem;
  highlights: NewsItem[];
}

export default function HeroSection({ featured, highlights }: HeroSectionProps) {
  const featuredImage = featured.imageUrl || "/images/news-placeholder.svg";

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Link
        href={`/news/${featured.slug}`}
        className="group relative block overflow-hidden rounded-2xl lg:col-span-2"
      >
        <div className="relative h-[340px] md:h-[420px]">
          <Image
            src={featuredImage}
            alt={featured.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {featured.category}
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-white md:text-4xl">
              {featured.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-100 md:text-base">
              {featured.excerpt}
            </p>
          </div>
        </div>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {highlights.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <article className="flex items-center gap-3">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={item.imageUrl || "/images/news-placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="96px"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  {item.category}
                </p>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-800 group-hover:text-brand-700">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(item.publishedAt || item.date)} •{" "}
                  {timeAgo(item.publishedAt || item.date)}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
