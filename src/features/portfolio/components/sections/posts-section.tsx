"use client";

import { useRouter } from "next/navigation";
import type { FC, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { MasterDetail } from "@/src/features/portfolio/components/sections/master-detail";
import { PostRow } from "@/src/features/portfolio/components/sections/post-row";
import { useWindowFocus } from "@/src/features/portfolio/hooks/use-window-focus";
import { formatDate } from "@/src/shared/lib/posts/format";
import type { Post } from "@/src/shared/types/portfolio";

interface Props {
  posts: Post[];
  /** Slug of the open post on the reader route; absent on the list route. */
  activeSlug?: string;
  /** Server-rendered article body, shown in the left pane on the reader route. */
  article?: ReactNode;
}

export const PostsSection: FC<Props> = ({ posts, activeSlug, article }) => {
  const router = useRouter();
  const focused = useWindowFocus();

  const activeIndex = activeSlug
    ? posts.findIndex((p) => p.slug === activeSlug)
    : -1;
  const [highlight, setHighlight] = useState(
    activeIndex >= 0 ? activeIndex : 0,
  );

  // Snap the highlight to the URL-driven post when the reader route changes it
  // (render-time sync — the React-recommended alternative to an effect).
  const [lastActive, setLastActive] = useState(activeIndex);
  if (activeIndex >= 0 && activeIndex !== lastActive) {
    setLastActive(activeIndex);
    setHighlight(activeIndex);
  }

  const opened = activeIndex >= 0;
  const selected = opened ? activeIndex : highlight;

  const open = useCallback(
    (index: number) => {
      const post = posts[index];
      if (post) router.push(`/posts/${post.slug}`);
    },
    [posts, router],
  );

  const close = useCallback(() => router.push("/posts"), [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!focused) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((s) => Math.min(s + 1, posts.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        open(selected);
      } else if (e.key === "Escape" && opened) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, posts.length, open, close, opened, selected]);

  return (
    <MasterDetail<Post>
      detailLabel={opened ? "post.reader" : "post.preview"}
      listLabel="~/posts"
      listCmd="tail -f posts/"
      items={posts}
      selected={selected}
      open={open}
      opened={opened}
      close={close}
      RowComponent={PostRow}
      renderDetail={(sel) =>
        article ?? (
          <div className="text-[13px] leading-[1.65] text-fg-1">
            <div className="mb-[14px] flex items-baseline justify-between gap-3 border-b border-dashed border-fg-4 pb-3">
              <span className="min-w-0 flex-1 break-words text-[16px] font-semibold text-fg-0">
                {sel.title}
              </span>
              <span className="flex-none whitespace-nowrap text-[11px] tracking-[0.06em] text-fg-3">
                {formatDate(sel.date)}
              </span>
            </div>
            <div className="mb-4 text-[12px] text-fg-2">
              {sel.tag} · {sel.readTime} min read
            </div>
            <div className="text-fg-1">
              <p className="mb-3 max-w-[56ch]">{sel.description}</p>
              <p className="text-[11px] text-fg-3">
                {"// preview only · press ⏎ to open in reader"}
              </p>
            </div>
            <div className="mt-[18px] flex flex-wrap items-center gap-2.5 text-[11px] text-fg-3">
              <span className="text-amber">⏎</span>
              <span>read</span>
              <span className="text-fg-4">·</span>
              <span className="text-amber">r</span>
              <span>raw .md</span>
            </div>
          </div>
        )
      }
    />
  );
};
