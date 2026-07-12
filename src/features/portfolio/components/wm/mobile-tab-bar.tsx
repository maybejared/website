"use client";

import type { FC } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_GLYPHS } from "@/src/features/portfolio/components/wm/app-glyphs";
import { Palette } from "@/src/features/portfolio/components/wm/palette";
import { CONTENT_APPS } from "@/src/features/portfolio/lib/config/apps.config";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  appearance: AppearanceState;
}

/**
 * Thumb-reach navigation for the stacked mobile view: one tab per content
 * section plus a search tab that opens the palette as a bottom sheet.
 */
export const MobileTabBar: FC<Props> = ({ appearance }) => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      <nav
        aria-label="site navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-fg-4 bg-bg-1 pb-[env(safe-area-inset-bottom)]"
      >
        {CONTENT_APPS.map((app) => (
          <Link
            key={app.id}
            href={app.href ?? "/"}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[9px] uppercase tracking-[0.08em] transition-colors",
              isActive(app.href ?? "/") ? "text-amber" : "text-fg-3",
            )}
          >
            {APP_GLYPHS[app.id]}
            {app.label}
          </Link>
        ))}
        <button
          type="button"
          aria-label="search"
          onClick={() => setSearchOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[9px] uppercase tracking-[0.08em] text-fg-3"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.5-4.5" />
          </svg>
          search
        </button>
      </nav>

      <Palette
        key={`palette-${searchOpen ? 1 : 0}`}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        appearance={appearance}
        apps={CONTENT_APPS}
      />
    </>
  );
};
