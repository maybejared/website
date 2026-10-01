import type { FC } from "react";

import { MdxArticle } from "@/src/features/site/components/mdx-article";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { PostDoc } from "@/src/shared/types/portfolio";

interface Props {
  post: PostDoc;
}

export const PostArticle: FC<Props> = ({ post }) => {
  const tag = post.tag.replace(/[[\]]/g, "");
  return (
    <MdxArticle
      section="Writing"
      action={{ label: "All posts", href: "/posts" }}
      kicker={`${formatPostDate(post.date)} // ${tag} // ${post.readTime} min read`}
      title={post.title}
      description={post.description}
      date={post.date}
      meta={[
        { key: "Date", value: formatPostDate(post.date) },
        { key: "Tag", value: tag },
        { key: "Read time", value: `${post.readTime} min` },
      ]}
      links={post.links ?? []}
      image={
        post.image
          ? { src: post.image, alt: post.imageAlt ?? post.title }
          : undefined
      }
      headings={post.headings}
      content={post.content}
    />
  );
};
