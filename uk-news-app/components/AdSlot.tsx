import Image from "next/image";
import { getAds } from "@/lib/api";
import TrackedAdLink from "@/components/TrackedAdLink";

interface AdSlotProps {
  size: "300x250" | "728x90";
  placement?: string;
}

export default async function AdSlot({ size, placement }: AdSlotProps) {
  const ads = await getAds();
  const isLeaderboard = size === "728x90";
  const adType = isLeaderboard ? "banner" : "square";
  const apiBase = process.env.NEWS_API_BASE_URL || "";
  const normalizedApiBase = apiBase.endsWith("/api/news")
    ? apiBase.replace(/\/api\/news$/, "")
    : apiBase;
  const clickEndpoint = `${normalizedApiBase}/api/ads/click`;

  const selectedAd =
    ads.find((ad) => ad.type === adType && ad.key === placement) ??
    ads.find((ad) => ad.type === adType) ??
    ads[0];

  if (!selectedAd) {
    return null;
  }

  return (
    <TrackedAdLink
      href={selectedAd.link}
      adId={selectedAd.id}
      clickEndpoint={clickEndpoint}
    >
      <section className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div
          className={`relative w-full ${
            isLeaderboard ? "h-[90px] md:h-[120px]" : "h-[250px]"
          }`}
        >
          <Image
            src={selectedAd.imageUrl}
            alt={selectedAd.title}
            fill
            className="object-cover"
            sizes={isLeaderboard ? "100vw" : "300px"}
          />
        </div>
        <div className="border-t border-slate-200 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Sponsored
          </p>
          <p className="line-clamp-2 text-sm font-medium text-slate-700">
            {selectedAd.title}
          </p>
        </div>
      </section>
      <span className="mt-1 block text-center text-[10px] uppercase tracking-wider text-slate-500">
        Advertisement
      </span>
    </TrackedAdLink>
  );
}
