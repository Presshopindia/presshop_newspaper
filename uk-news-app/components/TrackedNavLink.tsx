"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

interface TrackedNavLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  label: string;
  location: string;
  eventName?: string;
  activeClassName?: string;
}

function resolveHrefPath(href: LinkProps["href"]): string {
  if (typeof href === "string") {
    return href;
  }

  return href.pathname || "";
}

function isActivePath(currentPath: string, targetPath: string): boolean {
  if (!targetPath) {
    return false;
  }

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export default function TrackedNavLink({
  children,
  className,
  label,
  location,
  eventName = "category_click",
  activeClassName,
  ...linkProps
}: TrackedNavLinkProps) {
  const pathname = usePathname();
  const hrefPath = resolveHrefPath(linkProps.href);
  const active = isActivePath(pathname || "/", hrefPath);
  const finalClassName = [className, active ? activeClassName : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      {...linkProps}
      className={finalClassName}
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
