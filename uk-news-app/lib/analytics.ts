"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventParams = Record<string, string | number | boolean | null>;

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}
