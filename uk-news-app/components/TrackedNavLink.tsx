"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedNavLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  label: string;
  location: string;
  eventName?: string;
}

export default function TrackedNavLink({
  children,
  className,
  label,
  location,
  eventName = "category_click",
  ...linkProps
}: TrackedNavLinkProps) {
  return (
    <Link
      {...linkProps}
      className={className}
      onClick={() =>
        trackEvent(eventName, {
          label,
          location,
          href: String(linkProps.href),
        })
      }
    >
      {children}
    </Link>
  );
}
