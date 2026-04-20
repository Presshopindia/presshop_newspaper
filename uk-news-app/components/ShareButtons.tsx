"use client";

import { trackEvent } from "@/lib/analytics";

interface ShareButtonsProps {
  articleTitle: string;
  articleSlug: string;
  shareLinks: {
    twitter: string;
    linkedin: string;
    whatsapp: string;
  };
}

function buildShareClass(base: string): string {
  return `rounded-md px-3 py-1.5 text-xs font-semibold text-white ${base}`;
}

export default function ShareButtons({
  articleTitle,
  articleSlug,
  shareLinks,
}: ShareButtonsProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-slate-700">Share:</span>
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={buildShareClass("bg-sky-500 hover:bg-sky-600")}
        onClick={() =>
          trackEvent("article_share_click", {
            platform: "twitter",
            article_title: articleTitle,
            article_slug: articleSlug,
          })
        }
      >
        Twitter
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={buildShareClass("bg-blue-700 hover:bg-blue-800")}
        onClick={() =>
          trackEvent("article_share_click", {
            platform: "linkedin",
            article_title: articleTitle,
            article_slug: articleSlug,
          })
        }
      >
        LinkedIn
      </a>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={buildShareClass("bg-emerald-600 hover:bg-emerald-700")}
        onClick={() =>
          trackEvent("article_share_click", {
            platform: "whatsapp",
            article_title: articleTitle,
            article_slug: articleSlug,
          })
        }
      >
        WhatsApp
      </a>
    </div>
  );
}
