"use client";

import type { FC } from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { PostsSection } from "@/src/features/portfolio/components/sections/posts-section";
import { useRouteContent } from "@/src/features/portfolio/providers/route-content-context";
import { POSTS } from "@/src/content/portfolio/posts-client";

/**
 * The posts app for the WM window. On any /posts route it renders the live
 * route content — the only channel that carries the reader's server-rendered
 * MDX article — and falls back to the static list elsewhere.
 */
export const PostsWindow: FC = () => {
  const pathname = usePathname();
  const routeContent = useRouteContent();

  if (pathname?.startsWith("/posts") && routeContent) {
    // Sections under the route call useSearchParams — same boundary the
    // stacked page uses.
    return <Suspense fallback={null}>{routeContent}</Suspense>;
  }
  return <PostsSection posts={POSTS} />;
};
