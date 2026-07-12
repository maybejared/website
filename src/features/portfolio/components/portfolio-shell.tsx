"use client";

import type { FC, ReactNode } from "react";
import { Suspense, useMemo } from "react";
import { usePathname } from "next/navigation";

import { DesktopChrome } from "@/src/features/portfolio/components/wm/desktop-chrome";
import { MobileNav } from "@/src/features/portfolio/components/wm/mobile-nav";
import { MobileTabBar } from "@/src/features/portfolio/components/wm/mobile-tab-bar";
import { RouteContentProvider } from "@/src/features/portfolio/providers/route-content-context";
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

// Seed the workspace with just the route's content window — utility/decor
// content now lives in the dashboard pull, not in seeded windows.
const buildSeed = (entryAppId: string): WorkspaceSeed => ({
  workspace: 1,
  instances: [{ id: entryAppId, appId: entryAppId }],
  layout: entryAppId,
});

/**
 * Three render modes share one route tree:
 *  1. Mobile/tablet (<lg): stacked page with a MobileNav above.
 *  2. Pre-hydration / SSR: children render raw (no WM) for SEO.
 *  3. Desktop (lg+), hydrated: WM mounts and takes over.
 *
 * The WM (WorkspaceProvider + Mosaic + react-dnd) never mounts below lg —
 * react-dnd's HTML5 backend is desktop-only; the shell (rail + pulls) is lg-only.
 */
export const PortfolioShell: FC<PortfolioShellProps> = ({ children }) => {
  const pathname = usePathname();
  const appearance = useAppearance();
  const isDesktop = useIsDesktop();

  const entryAppId = routeToAppId(pathname);
  const seed = useMemo(() => buildSeed(entryAppId), [entryAppId]);

  return (
    // The provider mounts unconditionally so workspace state (open windows,
    // layouts, focus) survives crossing the lg breakpoint — only the chrome
    // unmounts below lg. The mobile view never reads the context.
    <WorkspaceProvider seed={seed}>
      {/* The live route content is shared via context so a WM window can
          render the real page for its route (the posts reader is
          server-rendered and reaches the desktop only through this seam). */}
      <RouteContentProvider value={children}>
        {/* Stacked page: renders children for SSR/SEO and mobile. On the
            hydrated desktop the route content renders inside the matching WM
            window instead, so the hidden copy is dropped entirely. Sections
            call useSearchParams, hence the Suspense boundary. */}
        <div className={isDesktop ? "hidden" : "pb-16"}>
          {!isDesktop && <MobileNav appearance={appearance} />}
          <Suspense fallback={null}>{isDesktop ? null : children}</Suspense>
          {!isDesktop && <MobileTabBar appearance={appearance} />}
        </div>

        {/* WM chrome mounts only at lg+ — never on mobile/tablet. */}
        {isDesktop && <DesktopChrome appearance={appearance} />}
      </RouteContentProvider>
    </WorkspaceProvider>
  );
};
