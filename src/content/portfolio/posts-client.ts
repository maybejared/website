// Static post metadata for client-side use. Mirrors what getAllPosts() returns
// at build time — sorted newest first, readTime calculated from content length.
//
// ponytail: this hardcoded POSTS array is a deploy-time staleness risk — adding
// or editing an MDX post under src/content/posts/ silently leaves the
// window-manager posts list stale, since nothing regenerates this file.
//
// Upgrade path: generate this at build time from getAllPosts() (e.g. a build
// script emitting a posts.json the client imports), or move the posts window to
// a server-fed path and delete this file entirely.
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
