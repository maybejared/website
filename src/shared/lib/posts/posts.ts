import path from "path";

import {
  calculateReadTime,
  extractHeadings,
  readCollection,
  readEntry,
  type MdxEntry,
} from "@/src/shared/lib/mdx/collection";
import { readArticleMedia } from "@/src/shared/lib/mdx/article-media";
import type { Post, PostDoc } from "@/src/shared/types/portfolio";

export { formatDate } from "@/src/shared/lib/posts/format";
export { calculateReadTime, extractHeadings };

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "posts");

const toPost = ({ slug, data, content }: MdxEntry): Post => ({
  slug,
  title: data.title as string,
  description: data.description as string,
  date: data.date as string,
  tag: data.tag as string,
  readTime: calculateReadTime(content),
  ...readArticleMedia(data),
});

export async function getAllPosts(): Promise<Post[]> {
  return readCollection(CONTENT_DIR)
    .map(toPost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<PostDoc | null> {
  const entry = readEntry(CONTENT_DIR, slug);
  if (!entry) return null;
  return {
    ...toPost(entry),
    content: entry.content,
    headings: extractHeadings(entry.content),
  };
}
