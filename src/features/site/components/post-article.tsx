import type { FC } from "react";

import { MdxArticle } from "@/src/features/site/components/mdx-article";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { PostDoc } from "@/src/shared/types/portfolio";

interface Props {
  post: PostDoc;
}

export const PostArticle: FC<Props> = ({ post }) => (
  <MdxArticle
    section="Writing"
    action={{ label: "All posts", href: "/posts" }}
    kicker={
      <>
        {formatPostDate(post.date)} &nbsp;//&nbsp;{" "}
        {post.tag.replace(/[[\]]/g, "")} &nbsp;//&nbsp; {post.readTime} min read
      </>
    }
    title={post.title}
    description={post.description}
    headings={post.headings}
    content={post.content}
  />
);
