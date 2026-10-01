import {
  Corners,
  DitherImage,
  Label,
  List,
  ListRow,
  SectionHeader,
} from "@/src/shared/ui";
import type { FC } from "react";

import { cdnUrl } from "@/src/shared/lib/cdn";

import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
}

export const WritingSection: FC<Props> = ({ posts }) => {
  return (
    <section
      id="writing"
      className="band grid items-start gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
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
      <div className="flex flex-col gap-4 max-md:hidden">
        <Corners>
          <DitherImage
            src={cdnUrl("ascii/field-notes.webp")}
            alt="Green hills under a cloudy sky"
            mode="color"
          />
        </Corners>
        <Label tone="ink" className="leading-[1.9]">
          Some places make better people.
        </Label>
      </div>
    </section>
  );
};
