import {
  Button,
  Corners,
  DitherImage,
  KeyValue,
  Label,
  Panel,
  SectionHeader,
} from "@/src/shared/ui";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { FC, ReactNode } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";

import { mdxComponents } from "@/src/features/site/components/mdx-components";
import { cdnUrl } from "@/src/shared/lib/cdn";
import type { ContentLink, Heading } from "@/src/shared/types/portfolio";

interface Props {
  section: string;
  action: { label: string; href: string };
  kicker: ReactNode;
  title: string;
  description: string;
  /** ISO `YYYY-MM-DD`; the year signs the image column. */
  date: string;
  /** Rows for the meta panel, before the links. */
  meta: Array<{ key: string; value: ReactNode }>;
  links: ContentLink[];
  image?: { src: string; alt: string };
  headings: Heading[];
  content: string;
}

/** Long-form MDX page: hero-style header with meta panel and optional image, contents, body. Posts and projects share it. */
export const MdxArticle: FC<Props> = ({
  section,
  action,
  kicker,
  title,
  description,
  date,
  meta,
  links,
  image,
  headings,
  content,
}) => (
  <section
    className="band flex flex-1 flex-col gap-6"
    style={{ padding: "24px 32px 40px" }}
  >
    <SectionHeader title={section} action={action} />
    <div
      className={
        image
          ? "grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
          : "flex flex-col"
      }
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <h1 className="display text-[clamp(32px,5vw,64px)]">{title}</h1>
          <Label tone="ink" className="tracking-[0.18em]">
            {kicker}
          </Label>
          <div className="hatch">/ / / / / / / / / / / /</div>
          <p className="body max-w-[52ch]">{description}</p>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {links.map((link, i) => (
                <Button
                  key={link.href}
                  variant={i === 0 ? "fill" : "outline"}
                  href={link.href}
                  target="_blank"
                >
                  {link.label} ↗
                </Button>
              ))}
            </div>
          )}
          <Panel title="Meta" index="01" className="mt-4">
            <KeyValue
              rows={[
                ...meta,
                ...links.map((link) => ({
                  key: link.label,
                  value: (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.href}
                    </a>
                  ),
                })),
              ]}
            />
          </Panel>
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
      </div>
      {image && (
        <aside className="flex flex-col gap-5 self-start max-md:hidden">
          <Corners className="flex">
            <DitherImage
              src={cdnUrl(image.src)}
              alt={image.alt}
              mode="color"
              className="hero-portrait flex-1"
            />
          </Corners>
          <div className="flex flex-col gap-2.5">
            <span className="rule max-w-10" />
            <Label>JT.{date.slice(0, 4)}</Label>
          </div>
        </aside>
      )}
    </div>
  </section>
);
