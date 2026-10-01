import path from "path";

import {
  extractHeadings,
  readCollection,
  readEntry,
  type MdxEntry,
} from "@/src/shared/lib/mdx/collection";
import { readArticleMedia } from "@/src/shared/lib/mdx/article-media";
import type { Project, ProjectDoc } from "@/src/shared/types/portfolio";

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "projects");

const toProject = ({ slug, data }: MdxEntry): Project => ({
  slug,
  title: data.title as string,
  description: data.description as string,
  date: data.date as string,
  tag: data.tag as string,
  status: data.status as string,
  repo: data.repo as string | undefined,
  ...readArticleMedia(data),
});

export async function getAllProjects(): Promise<Project[]> {
  return readCollection(CONTENT_DIR)
    .map(toProject)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDoc | null> {
  const entry = readEntry(CONTENT_DIR, slug);
  if (!entry) return null;
  return {
    ...toProject(entry),
    content: entry.content,
    headings: extractHeadings(entry.content),
  };
}
