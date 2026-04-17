"use client";

import { MouseEvent, ReactNode } from "react";

interface TrackedAdLinkProps {
  href: string;
  adId: string;
  clickEndpoint: string;
  children: ReactNode;
}

export default function TrackedAdLink({
  href,
  adId,
  clickEndpoint,
  children,
}: TrackedAdLinkProps) {
  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
      await fetch(clickEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adId }),
        keepalive: true,
      });
    } catch {
      // Non-blocking ad click tracking.
    } finally {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
      {children}
    </a>
  );
}
