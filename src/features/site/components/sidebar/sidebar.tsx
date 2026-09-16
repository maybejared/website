import { KeyValue, Label } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { SidebarPanel } from "@/src/features/site/components/sidebar/sidebar-panel";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
}

/** Left column of the sheet. The top block sticks under the nav until the main content ends; Elsewhere shares a subgrid row with the CTA so their heights match. */
export const Sidebar: FC<Props> = ({ posts }) => {
  const { user, about, now, contact, landing } = portfolioContent;
  const focus = about.bullets.find(([label]) => label === "focus")?.[1] ?? "";
  const elsewhere = [
    { label: "GitHub", href: landing.github },
    { label: "Email", href: `mailto:${contact.email}` },
  ];

  return (
    <aside className="site-chrome order-last flex flex-col border-t border-(--jt-border) lg:order-none lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:border-t-0 lg:border-r">
      <div className="flex flex-col">
        {/* ponytail: sticky block taller than the viewport clips at the bottom; add max-h + overflow if the sidebar grows */}
        <div className="site-chrome flex flex-col lg:sticky lg:top-[calc(var(--jt-bar-h)+24px)]">
          <SidebarPanel title="Basecamp" index="01">
            <KeyValue
              rows={[
                { key: "Location", value: user.based },
                { key: "Focus", value: focus.split(" · ").join("\n") },
                {
                  key: "Available",
                  value: "Open to opportunities",
                  live: true,
                },
                {
                  key: "Contact",
                  value: (
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  ),
                },
              ]}
            />
          </SidebarPanel>
          <SidebarPanel title="Now">
            <div className="flex flex-col gap-2.5">
              {now.items.map((item) => (
                <span key={item} className="jt-body text-[11px]">
                  {item}
                </span>
              ))}
            </div>
          </SidebarPanel>
          <SidebarPanel
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
                  <span className="jt-title">{post.title}</span>
                  <Label>{formatPostDate(post.date)}</Label>
                </a>
              ))}
            </div>
          </SidebarPanel>
        </div>
      </div>
      <SidebarPanel title="Elsewhere" className="border-b-0">
        <div className="flex flex-col gap-2">
          {elsewhere.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex justify-between"
            >
              <span className="jt-body text-(--jt-ink)">{link.label}</span>
              <Label tone="accent">↗</Label>
            </a>
          ))}
        </div>
      </SidebarPanel>
    </aside>
  );
};
