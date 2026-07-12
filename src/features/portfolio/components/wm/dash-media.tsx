"use client";

import type { FC } from "react";

import { usePlayer } from "@/src/features/portfolio/providers/player-context";
import { cn } from "@/src/shared/lib/utils";

const TINT_TILE: Record<string, string> = {
  amber: "bg-amber/20 text-amber",
  cyan: "bg-cyan/20 text-cyan",
  magenta: "bg-magenta/20 text-magenta",
  yellow: "bg-yellow/20 text-yellow",
};

/** Media tab body: placeholder album tile + track meta + transport controls. */
export const DashMedia: FC = () => {
  const player = usePlayer();
  if (!player) return null;
  const { track, trackIndex, trackCount, playing, toggle, next, prev } = player;

  return (
    <div className="flex items-center gap-4 p-4">
      <div
        aria-hidden
        className={cn(
          "grid h-24 w-24 flex-none place-items-center rounded-xl text-4xl",
          TINT_TILE[track.tint],
        )}
      >
        {track.title[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] text-fg-0">{track.title}</div>
        <div className="truncate text-[12px] text-fg-2">
          {track.artist} — {track.album}
        </div>
        <div className="mt-1 text-[10px] text-fg-3 tabular-nums">
          {trackIndex + 1} / {trackCount} · {track.length}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            aria-label="previous track"
            onClick={prev}
            className="grid h-8 w-8 place-items-center rounded-full bg-bg-2 text-[12px] text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-0"
          >
            ⏮
          </button>
          <button
            type="button"
            aria-label={playing ? "pause" : "play"}
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-full bg-amber/20 text-[13px] text-amber transition-colors hover:bg-amber/30"
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            aria-label="next track"
            onClick={next}
            className="grid h-8 w-8 place-items-center rounded-full bg-bg-2 text-[12px] text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-0"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
};
