import Image from "next/image";
import Link from "next/link";
import { NewsItem } from "@/types/news";
import { formatDate, timeAgo } from "@/lib/formatDate";

interface NewsCardProps {
  item: NewsItem;
  size?: "large" | "small";
}

export default function NewsCard({ item, size = "small" }: NewsCardProps) {
  const isLarge = size === "large";
  const imageSrc = item.imageUrl || "/images/news-placeholder.svg";
  const publishedAt = item.publishedAt || item.date;

  return (
    <Link href={`/news/${item.slug}`} className="block h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-xl">
        <div className={`relative w-full overflow-hidden ${isLarge ? "h-64 md:h-72" : "h-44"}`}>
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className={`${isLarge ? "space-y-3 p-5 md:p-6" : "space-y-2 p-4"} flex flex-1 flex-col`}>
          <p className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            {item.category}
          </p>
          <h3
            className={`line-clamp-2 leading-snug text-slate-900 ${
              isLarge ? "text-2xl font-bold" : "text-lg font-semibold"
            }`}
          >
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-4 text-sm text-slate-600">{item.excerpt}</p>
          <p className="mt-auto pt-2 text-xs font-medium text-slate-500">
            {formatDate(publishedAt)} • {timeAgo(publishedAt)}
          </p>
        </div>
      </article>
    </Link>
  );
}
