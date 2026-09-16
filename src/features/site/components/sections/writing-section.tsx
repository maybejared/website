import { Label, List, ListRow, Panel, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
}

export const WritingSection: FC<Props> = ({ posts }) => {
  const { user, landing } = portfolioContent;
  return (
    <section
      id="writing"
      className="jt-band grid items-start gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
      style={{ padding: "24px 32px 28px" }}
    >
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Writing / Notes / Experiments"
          action={{ label: "View all", href: "/posts" }}
        />
        <List>
          {posts.slice(0, 3).map((post) => (
            <ListRow
              key={post.slug}
              date={formatPostDate(post.date)}
              title={post.title}
              description={post.description}
              href={`/posts/${post.slug}`}
            />
          ))}
        </List>
      </div>
      <Panel
        title="Field notes"
        footer={
          <>
            <Label className="capitalize">
              {user.name}
              <br />
              {landing.roles}
            </Label>
            <Label tone="accent">{"// JT.2026"}</Label>
          </>
        }
      >
        <p className="jt-body text-(--jt-ink)" style={{ lineHeight: 2 }}>
          Better tools.
          <br />
          Kinder systems.
          <br />
          {landing.headline}.
        </p>
      </Panel>
    </section>
  );
};
