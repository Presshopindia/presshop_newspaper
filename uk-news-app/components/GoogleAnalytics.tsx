"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

function trackPageView(measurementId: string, url: string): void {
  if (!measurementId || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("config", measurementId, {
    page_path: url,
  });
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    const query =
      typeof window !== "undefined" ? window.location.search || "" : "";
    const url = `${pathname}${query}`;
    trackPageView(measurementId, url);
  }, [measurementId, pathname]);

  return null;
}
