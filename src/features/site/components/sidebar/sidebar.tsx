import { Label } from "@/src/shared/ui";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { SidebarPanel } from "@/src/features/site/components/sidebar/sidebar-panel";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
}

/** Left column of the sheet. The whole block sticks under the nav until the main content ends. */
export const Sidebar: FC<Props> = ({ posts }) => {
  const { now, contact, landing } = portfolioContent;
  const elsewhere = [
    { label: "GitHub", href: landing.github },
    { label: "LinkedIn", href: landing.linkedin },
    { label: "Email", href: `mailto:${contact.email}` },
  ];

  return (
    <aside className="site-chrome order-last flex flex-col border-t border-(--color-border) lg:order-none lg:row-span-2 lg:border-t-0 lg:border-r">
      {/* ponytail: sticky block taller than the viewport clips at the bottom; add max-h + overflow if the sidebar grows */}
      <div className="site-chrome flex flex-col lg:sticky lg:top-[calc(var(--bar-h)+24px)] lg:self-start">
        <SidebarPanel title="Now">
          <div className="flex flex-col gap-2.5">
            {now.items.map((item) => (
              <span key={item} className="body text-[11px]">
                {item}
              </span>
            ))}
          </div>
        </SidebarPanel>
        {/*<SidebarPanel
          title="Writing & notes"
          action={{ label: "View all", href: "/posts" }}
        >
          <div className="flex flex-col gap-3">
            {posts.slice(0, 3).map((post) => (
              <a
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="flex flex-col gap-0.5"
              >
                <span className="title">{post.title}</span>
                <Label>{formatPostDate(post.date)}</Label>
              </a>
            ))}
          </div>
        </SidebarPanel>*/}
        <SidebarPanel title="Elsewhere" className="border-b-0">
          <div className="flex flex-col gap-2">
            {elsewhere.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="flex justify-between"
              >
                <span className="body text-(--color-ink)">{link.label}</span>
                <Label tone="accent">↗</Label>
              </a>
            ))}
          </div>
        </SidebarPanel>
      </div>
    </aside>
  );
};
