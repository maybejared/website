import type { ArticleMedia, ContentLink } from "@/src/shared/types/portfolio";

const isLink = (value: unknown): value is ContentLink =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ContentLink).label === "string" &&
  typeof (value as ContentLink).href === "string";

/** Header image and links from frontmatter; malformed link entries are dropped. */
export const readArticleMedia = (
  data: Record<string, unknown>,
): ArticleMedia => ({
  image: typeof data.image === "string" ? data.image : undefined,
  imageAlt: typeof data.imageAlt === "string" ? data.imageAlt : undefined,
  links: Array.isArray(data.links) ? data.links.filter(isLink) : undefined,
});
