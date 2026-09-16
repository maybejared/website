import type { FC, ReactNode } from "react";

import { CtaSection } from "@/src/features/site/components/sections/cta-section";
import { LandscapeBand } from "@/src/features/site/components/landscape-band";
import { Sidebar } from "@/src/features/site/components/sidebar/sidebar";
import { SiteFooter } from "@/src/features/site/components/site-footer";
import { SiteNav } from "@/src/features/site/components/site-nav";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
  children: ReactNode;
}

/** One bordered sheet shared by every route: sticky nav, sidebar, main, CTA, landscape, footer. */
export const SiteShell: FC<Props> = ({ posts, children }) => (
  <div className="sheet mx-auto w-full max-w-[1440px]">
    <SiteNav />
    <div className="grid grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)] lg:grid-rows-[1fr_auto]">
      <Sidebar posts={posts} />
      <main className="flex min-w-0 flex-col lg:row-span-2 lg:grid lg:grid-rows-subgrid">
        <div className="flex flex-col">{children}</div>
        <CtaSection />
      </main>
    </div>
    <LandscapeBand />
    <SiteFooter />
  </div>
);
