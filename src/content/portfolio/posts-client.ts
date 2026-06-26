// Static post metadata for client-side use. Mirrors what getAllPosts() returns
// at build time — sorted newest first, readTime calculated from content length.
// Update this array whenever a post is added or its frontmatter changes.
import type { Post } from "@/src/shared/types/portfolio";

export const POSTS: Post[] = [
  {
    slug: "on-small-models-and-small-teams",
    title: "On small models and small teams",
    description:
      "A long argument that small teams should ship more, not less. Notes from working on signal/cli for a year.",
    date: "2026-05-12",
    tag: "[design]",
    readTime: 1,
  },
  {
    slug: "the-case-against-the-command-palette",
    title: 'The case against the "command palette"',
    description:
      "Command palettes are great until they replace the menu. A nuanced rant.",
    date: "2026-04-02",
    tag: "[ux]",
    readTime: 1,
  },
  {
    slug: "designing-for-keyboards-first",
    title: "Designing for keyboards first",
    description:
      "Six rules for designing keyboard-first interfaces that do not suck for mouse users.",
    date: "2025-11-04",
    tag: "[ux]",
    readTime: 1,
  },
];
