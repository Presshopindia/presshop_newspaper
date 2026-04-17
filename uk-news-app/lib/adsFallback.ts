import ads from "@/data/ads.json";
import { AdItem } from "@/types/news";

export function getFallbackAds(): AdItem[] {
  return ads as AdItem[];
}
