"use client";

import type { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SCHEMES } from "@/src/features/portfolio/lib/config/schemes";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  appearance: AppearanceState;
}

const NAV_LINKS = [
  { href: "/", label: "about" },
  { href: "/posts", label: "posts" },
  { href: "/experience", label: "experience" },
  { href: "/contact", label: "contact" },
] as const;

export const MobileNav: FC<Props> = ({ appearance }) => {
  const pathname = usePathname();
  const { scheme, setScheme } = appearance;

  const cycleScheme = () => {
    const idx = SCHEMES.indexOf(scheme);
    setScheme(SCHEMES[(idx + 1) % SCHEMES.length]);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav
      aria-label="site navigation"
      className="sticky top-0 z-40 flex h-9 items-center justify-between border-b border-fg-4 bg-bg-0 px-4 text-[11px] tracking-[0.06em]"
    >
      <div className="flex items-center gap-4">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "uppercase transition-colors",
              isActive(href) ? "text-amber" : "text-fg-3 hover:text-fg-1",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={cycleScheme}
        aria-label={`Switch colour scheme, current: ${scheme}`}
        className="uppercase tracking-[0.06em] text-fg-3 hover:text-fg-1"
      >
        <span className="text-amber">{scheme}</span>
      </button>
    </nav>
  );
};
