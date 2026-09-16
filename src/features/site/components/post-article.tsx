import { Label, SectionHeader } from "@jt/ds";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { FC } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";

import { mdxComponents } from "@/src/features/site/components/mdx-components";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { PostDoc } from "@/src/shared/types/portfolio";

interface Props {
  post: PostDoc;
}

export const PostArticle: FC<Props> = ({ post }) => (
  <section
    className="jt-band flex flex-1 flex-col gap-6"
    style={{ padding: "24px 32px 40px" }}
  >
    <SectionHeader
      title="Writing"
      action={{ label: "All posts", href: "/posts" }}
    />
    <header className="flex flex-col gap-3">
      <Label>
        {formatPostDate(post.date)} &nbsp;//&nbsp;{" "}
        {post.tag.replace(/[[\]]/g, "")} &nbsp;//&nbsp; {post.readTime} min read
      </Label>
      <h1 className="jt-display text-[clamp(32px,5vw,64px)]">{post.title}</h1>
      <p className="jt-body max-w-[60ch] text-[13px]">{post.description}</p>
    </header>
    {post.headings.length > 0 && (
      <nav className="flex flex-col gap-1 border-l border-(--jt-rule) pl-4">
        <Label className="mb-1">Contents</Label>
        {post.headings.map((h) => (
          <a
            key={h.slug}
            href={`#${h.slug}`}
            className={h.level === 3 ? "jt-body pl-4" : "jt-body"}
          >
            {h.text}
          </a>
        ))}
      </nav>
    )}
    <article className="max-w-[68ch]">
      <MDXRemote
        source={post.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkSmartypants],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
              [rehypePrettyCode, { theme: "github-dark-default" }],
              [
                rehypeExternalLinks,
                { target: "_blank", rel: ["noopener", "noreferrer"] },
              ],
            ],
          },
        }}
      />
    </article>
  </section>
);
