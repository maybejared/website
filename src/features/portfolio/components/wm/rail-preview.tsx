"use client";

import type { FC } from "react";

import { TINT_TILE } from "@/src/features/portfolio/lib/wm/player-tints";
import { usePlayer } from "@/src/features/portfolio/providers/player-context";
import { cn } from "@/src/shared/lib/utils";

/**
 * Hover popup for the rail's now-playing status: album tile, track meta and
 * transport controls. Rendered inside a `group/status` wrapper — visibility
 * is driven by the wrapper's hover state so the popup stays open while the
 * pointer travels onto it.
 */
export const RailPreview: FC = () => {
  const player = usePlayer();
  if (!player) return null;
  const { track, trackIndex, trackCount, playing, toggle, next, prev } = player;

  return (
    <div className="invisible absolute left-full top-1/2 z-50 ml-2.5 w-[220px] -translate-y-1/2 opacity-0 transition-opacity group-hover/status:visible group-hover/status:opacity-100 group-focus-within/status:visible group-focus-within/status:opacity-100">
      <div className="flex items-center gap-3 rounded-xl bg-bg-1 p-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]">
        <div
          aria-hidden
          className={cn(
            "grid h-12 w-12 flex-none place-items-center rounded-lg text-xl",
            TINT_TILE[track.tint],
          )}
        >
          {track.title[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] text-fg-0">{track.title}</div>
          <div className="truncate text-[10px] text-fg-2">
            {track.artist} · {trackIndex + 1}/{trackCount}
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              aria-label="previous track"
              onClick={prev}
              className="grid h-6 w-6 place-items-center rounded-full bg-bg-2 text-[10px] text-fg-2 hover:text-fg-0"
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label={playing ? "pause" : "play"}
              onClick={toggle}
              className="grid h-6 w-6 place-items-center rounded-full bg-amber/20 text-[10px] text-amber"
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              aria-label="next track"
              onClick={next}
              className="grid h-6 w-6 place-items-center rounded-full bg-bg-2 text-[10px] text-fg-2 hover:text-fg-0"
            >
              ⏭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
