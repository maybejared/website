"use client";

import type { FC, ReactNode } from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { DesktopChrome } from "@/src/features/portfolio/components/wm/desktop-chrome";
import { useAppearance } from "@/src/features/portfolio/hooks/use-appearance";
import type { initialWorkspaceState } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";

interface PortfolioShellProps {
  children: ReactNode;
}

type Seed = Parameters<typeof initialWorkspaceState>[0];

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
const buildSeed = (entryAppId: string): Seed => ({
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
 *  1. Mobile (`max-md`): the route children render as a plain stacked page.
 *  2. Desktop pre-hydration / no-JS: the same children render raw, for SEO.
 *  3. Desktop, hydrated: the window manager takes over.
 */
export const PortfolioShell: FC<PortfolioShellProps> = ({ children }) => {
  const pathname = usePathname();
  const appearance = useAppearance();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const entryAppId = routeToAppId(pathname);
  const seed = useMemo(() => buildSeed(entryAppId), [entryAppId]);

  return (
    <>
      {/* Mobile always; on desktop this is the pre-hydration static frame, then
          hidden once the WM mounts. Sections call `useSearchParams` for
          deep-linking, so one Suspense boundary covers every route. */}
      <div className={mounted ? "md:hidden" : undefined}>
        <Suspense fallback={null}>{children}</Suspense>
      </div>

      {mounted && (
        <div className="hidden md:block">
          <WorkspaceProvider seed={seed}>
            <DesktopChrome appearance={appearance} />
          </WorkspaceProvider>
        </div>
      )}
    </>
  );
};
