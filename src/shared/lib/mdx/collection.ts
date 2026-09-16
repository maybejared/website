import fs from "fs";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import path from "path";
import readingTime from "reading-time";

import type { Heading } from "@/src/shared/types/portfolio";

/** One parsed MDX file: its slug, frontmatter, and body. */
export interface MdxEntry {
  slug: string;
  data: Record<string, unknown>;
  content: string;
}

export function calculateReadTime(content: string): number {
  const { minutes } = readingTime(content);
  return Math.max(1, Math.ceil(minutes));
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^#{2,3}\s+(.+)$/gm;
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[0].startsWith("###") ? 3 : 2;
    const text = match[1].trim();
    headings.push({ text, slug: slugger.slug(text), level: level as 2 | 3 });
  }

  return headings;
}

function parseFile(filePath: string): MdxEntry | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return { slug: path.basename(filePath, ".mdx"), data, content };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
    return null;
  }
}

/** Every MDX file in a directory, unsorted. */
export function readCollection(dir: string): MdxEntry[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseFile(path.join(dir, f)))
    .filter((p): p is MdxEntry => p !== null);
}

/** One MDX file by slug, or null when the slug is unsafe or missing. */
export function readEntry(dir: string, slug: string): MdxEntry | null {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null;
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parseFile(filePath);
}
