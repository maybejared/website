"use client";

import type { FC } from "react";

import { SCHEMES } from "@/src/features/portfolio/lib/config/schemes";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

interface Props {
  appearance: AppearanceState;
}

/**
 * Slim mobile header: identity chip + scheme cycle. Section navigation lives
 * in the thumb-reach MobileTabBar at the bottom of the viewport.
 */
export const MobileNav: FC<Props> = ({ appearance }) => {
  const { scheme, setScheme } = appearance;

  const cycleScheme = () => {
    const idx = SCHEMES.indexOf(scheme);
    setScheme(SCHEMES[(idx + 1) % SCHEMES.length]);
  };

  return (
    <header className="sticky top-0 z-40 flex h-9 items-center justify-between border-b border-fg-4 bg-bg-0 px-4 text-[11px] tracking-[0.06em]">
      <span className="flex items-center gap-2 text-fg-2">
        <span aria-hidden className="text-amber">✦</span>
        <span className="uppercase">{portfolioContent.user.handle}@fjell</span>
      </span>

      <button
        type="button"
        onClick={cycleScheme}
        aria-label={`Switch colour scheme, current: ${scheme}`}
        className="uppercase tracking-[0.06em] text-fg-3 hover:text-fg-1"
      >
        <span className="text-amber">{scheme}</span>
      </button>
    </header>
  );
};
