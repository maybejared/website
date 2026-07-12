"use client";

import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  buildPaletteItems,
  type PaletteItem,
} from "@/src/features/portfolio/lib/wm/palette-items";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import type { AppMeta } from "@/src/features/portfolio/lib/config/apps.config";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { cdnImageLoader } from "@/src/shared/lib/cdn-image-loader";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  appearance: AppearanceState;
  /** Restrict the app rows (mobile passes CONTENT_APPS); defaults to all apps. */
  apps?: AppMeta[];
}

export const Palette: FC<Props> = ({ open, onClose, appearance, apps }) => {
  const { openApp } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(
    () =>
      buildPaletteItems(
        query,
        {
          openApp,
          openPost: (slug) => {
            openApp("posts");
            router.push(`/posts/${slug}`);
          },
          setScheme: appearance.setScheme,
          setWallpaperId: appearance.setWallpaperId,
        },
        apps,
      ),
    [query, openApp, router, appearance.setScheme, appearance.setWallpaperId, apps],
  );

  // Wallpaper actions render as a thumbnail strip instead of rows.
  const stripMode = items.length > 0 && items.every((i) => i.kind === "wallpaper");

  // Focus on mount — the parent remounts this component per open cycle.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!open) return null;

  const run = (item: PaletteItem) => {
    item.run();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = (d: number) =>
      setHighlight((h) => Math.max(0, Math.min(h + d, items.length - 1)));
    if (e.key === "ArrowDown" || (stripMode && e.key === "ArrowRight")) {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowUp" || (stripMode && e.key === "ArrowLeft")) {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[highlight];
      if (item) run(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onMouseDown={onClose}
    >
      <div
        className="w-[560px] max-w-[88%] overflow-hidden rounded-t-xl border border-b-0 border-fg-4 bg-bg-1 shadow-[0_-18px_48px_-20px_rgba(0,0,0,0.75)] max-md:w-full max-md:max-w-full"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {stripMode ? (
          <div className="flex gap-2 overflow-x-auto border-b border-fg-4/60 p-3">
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                onMouseDown={() => run(item)}
                className={cn(
                  "flex flex-none flex-col items-center gap-1 rounded-md border p-1.5 text-[10px]",
                  i === highlight
                    ? "border-amber/70 text-fg-0"
                    : "border-fg-4 text-fg-2 hover:border-fg-3",
                )}
              >
                {item.thumbSrc ? (
                  <Image
                    loader={cdnImageLoader}
                    src={item.thumbSrc}
                    alt=""
                    width={120}
                    height={75}
                    className="h-[75px] w-[120px] rounded-sm object-cover"
                  />
                ) : (
                  <span className="flex h-[75px] w-[120px] items-center justify-center rounded-sm bg-bg-2 text-fg-3">
                    flat
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto border-b border-fg-4/60 py-1">
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                onMouseDown={() => run(item)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left text-[13px]",
                  i === highlight
                    ? "bg-bg-2 text-fg-0"
                    : "text-fg-2 hover:bg-bg-2/60",
                )}
              >
                <span className="w-14 flex-none text-[10px] text-fg-3">
                  {item.kind}
                </span>
                <span className="truncate font-sans">{item.label}</span>
                <span className="ml-auto text-[11px] text-fg-4">
                  {item.hint}
                </span>
              </button>
            ))}
            {items.length === 0 && (
              <div className="px-3 py-4 text-center text-[13px] text-fg-4">
                no matches
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="text-[12px] text-amber">›</span>
          <input
            ref={inputRef}
            type="text"
            aria-label="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-3"
            placeholder="search apps, posts…  ( > for actions )"
          />
          <span className="rounded border border-fg-4 px-1.5 py-0.5 text-[9px] text-fg-3">
            /
          </span>
        </div>
      </div>
    </div>
  );
};
