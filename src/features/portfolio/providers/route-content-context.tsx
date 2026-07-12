"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

/**
 * The live route's server-rendered content, provided by PortfolioShell so a
 * WM window can render the real page for its route (e.g. the posts window
 * showing the reader article on /posts/[slug]) instead of a static fallback.
 */
const RouteContentContext = createContext<ReactNode>(null);

export const RouteContentProvider = RouteContentContext.Provider;

export function useRouteContent(): ReactNode {
  return useContext(RouteContentContext);
}
