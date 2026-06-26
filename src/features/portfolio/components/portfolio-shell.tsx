"use client";

import type { FC, ReactNode } from "react";
import { Suspense, useMemo } from "react";
import { usePathname } from "next/navigation";

import { DesktopChrome } from "@/src/features/portfolio/components/wm/desktop-chrome";
import { MobileNav } from "@/src/features/portfolio/components/wm/mobile-nav";
import { useAppearance } from "@/src/features/portfolio/hooks/use-appearance";
import { useIsDesktop } from "@/src/features/portfolio/hooks/use-is-desktop";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";

interface PortfolioShellProps {
  children: ReactNode;
}

// Which content app a route opens into when the desktop hydrates. Anything
// under /posts (including reader articles) maps to the posts app.
const ROUTE_APP: Record<string, string> = {
  "/": "about",
  "/posts": "posts",
  "/experience": "experience",
  "/contact": "contact",
};

const routeToAppId = (pathname: string | null): string => {
  if (pathname?.startsWith("/posts")) return "posts";
  return ROUTE_APP[pathname ?? "/"] ?? "about";
};

// Seed the workspace with the route's content window plus the clock + fetch
// decor, laid out as the entry app beside a stacked clock/fetch column.
const buildSeed = (entryAppId: string): WorkspaceSeed => ({
  workspace: 1,
  instances: [
    { id: entryAppId, appId: entryAppId },
    { id: "clock", appId: "clock" },
    { id: "fetch", appId: "fetch" },
  ],
  layout: {
    direction: "row",
    first: entryAppId,
    second: { direction: "column", first: "clock", second: "fetch" },
  },
});

/**
 * Three render modes share one route tree:
 *  1. Mobile/tablet (<lg): stacked page with a MobileNav above.
 *  2. Pre-hydration / SSR: children render raw (no WM) for SEO.
 *  3. Desktop (lg+), hydrated: WM mounts and takes over.
 *
 * The WM (WorkspaceProvider + Mosaic + react-dnd) never mounts below lg —
 * react-dnd's HTML5 backend is desktop-only, and the TopBar only appears at lg.
 */
export const PortfolioShell: FC<PortfolioShellProps> = ({ children }) => {
  const pathname = usePathname();
  const appearance = useAppearance();
  const isDesktop = useIsDesktop();

  const entryAppId = routeToAppId(pathname);
  const seed = useMemo(() => buildSeed(entryAppId), [entryAppId]);

  return (
    <>
      {/* Stacked page: always present for SSR/SEO. Hidden after desktop hydrates.
          Sections call useSearchParams for deep-linking, so one Suspense boundary
          covers every route. MobileNav only renders below lg (after hydration). */}
      <div className={isDesktop ? "hidden" : undefined}>
        {!isDesktop && <MobileNav appearance={appearance} />}
        <Suspense fallback={null}>{children}</Suspense>
      </div>

      {/* WM mounts only at lg+ — never on mobile/tablet. */}
      {isDesktop && (
        <WorkspaceProvider seed={seed}>
          <DesktopChrome appearance={appearance} />
        </WorkspaceProvider>
      )}
    </>
  );
};
