import { List, ListRow, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
}

export const PostList: FC<Props> = ({ posts }) => (
  <section
    className="band flex flex-1 flex-col gap-3"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader title="Writing / Notes / Experiments" />
    <List>
      {posts.map((post) => (
        <ListRow
          key={post.slug}
          date={formatPostDate(post.date)}
          title={post.title}
          description={post.description}
          href={`/posts/${post.slug}`}
        />
      ))}
    </List>
  </section>
);
