import { Label, SectionHeader } from "@jt/ds";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { FC, ReactNode } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";

import { mdxComponents } from "@/src/features/site/components/mdx-components";
import type { Heading } from "@/src/shared/types/portfolio";

interface Props {
  section: string;
  action: { label: string; href: string };
  kicker: ReactNode;
  title: string;
  description: string;
  headings: Heading[];
  content: string;
}

/** Long-form MDX page: section header, meta line, title, contents, body. Posts and projects share it. */
export const MdxArticle: FC<Props> = ({
  section,
  action,
  kicker,
  title,
  description,
  headings,
  content,
}) => (
  <section
    className="band flex flex-1 flex-col gap-6"
    style={{ padding: "24px 32px 40px" }}
  >
    <SectionHeader title={section} action={action} />
    <header className="flex flex-col gap-3">
      <Label>{kicker}</Label>
      <h1 className="display text-[clamp(32px,5vw,64px)]">{title}</h1>
      <p className="body max-w-[60ch] text-[13px]">{description}</p>
    </header>
    {headings.length > 0 && (
      <nav className="flex flex-col gap-1 border-l border-(--color-rule) pl-4">
        <Label className="mb-1">Contents</Label>
        {headings.map((h) => (
          <a
            key={h.slug}
            href={`#${h.slug}`}
            className={h.level === 3 ? "body pl-4" : "body"}
          >
            {h.text}
          </a>
        ))}
      </nav>
    )}
    <article className="max-w-[68ch]">
      <MDXRemote
        source={content}
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
