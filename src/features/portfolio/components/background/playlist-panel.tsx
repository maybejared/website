"use client";

import type { FC } from "react";

import { cn } from "@/src/shared/lib/utils";
import { usePlayer } from "@/src/features/portfolio/providers/player-context";

const TRACKS: [n: string, title: string, year: string, dur: string][] = [
  ["1.", "H.", "1996", "06:07"],
  ["2.", "Useful Idiot", "1996", "00:38"],
  ["3.", "Forty Six & 2", "1996", "06:04"],
  ["4.", "Message To Harry Manb.", "1996", "01:53"],
  ["5.", "Hooker With A Penis", "1996", "04:33"],
  ["6.", "Intermission", "1996", "00:55"],
  ["7.", "Jimmy", "1996", "05:24"],
  ["8.", "Die Eier Von Satan", "1996", "02:17"],
  ["9.", "Pushit", "1996", "09:55"],
  ["10.", "Cesaro Summability", "1996", "01:26"],
  ["11.", "Ænema", "1996", "06:39"],
  ["12.", "(-) Ions", "1996", "04:00"],
  ["13.", "Third Eye", "1996", "13:46"],
  ["14.", "The Grudge", "2001", "08:36"],
  ["15.", "Eon Blue Apocalypse", "2001", "01:04"],
  ["16.", "The Patient", "2001", "07:13"],
  ["17.", "Mantra", "2001", "01:12"],
  ["18.", "Schism", "2001", "06:47"],
  ["19.", "Parabol", "2001", "03:04"],
  ["20.", "Parabola", "2001", "06:03"],
  ["21.", "Ticks & Leeches", "2001", "08:10"],
  ["22.", "Lateralus", "2001", "09:24"],
  ["23.", "Disposition", "2001", "04:46"],
  ["24.", "Reflection", "2001", "11:07"],
];

/** Faux spotify play-queue with a now-playing footer. */
export const PlaylistPanel: FC = () => {
  const player = usePlayer();

  return (
    <div className="flex h-full flex-col font-mono text-[9px] leading-[1.5]">
      <div className="mb-1 border-b border-fg-4 pb-1 text-fg-2">
        Play Queue — 24 tracks
      </div>
      <div className="min-h-0 flex-1 space-y-[1px] overflow-hidden">
        {TRACKS.map(([n, title, year, dur], i) => (
          <div
            key={i}
            className={cn(
              "flex items-baseline gap-2",
              i === 0 ? "bg-cyan-dim/40 text-fg-0" : "text-fg-2",
            )}
          >
            <span className="text-amber-dim">TOOL</span>
            <span className="w-5 flex-none text-right text-fg-3">{n}</span>
            <span className="flex-1 truncate">{title}</span>
            <span className="text-fg-3">{year}</span>
            <span className="text-fg-3">{dur}</span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 border-t border-fg-4 pt-1 text-fg-3">
        <div className="flex justify-between text-fg-1">
          <span>
            {player
              ? `${player.track.artist} — ${player.track.album} — ${player.trackIndex + 1}. ${player.track.title}`
              : "TOOL — Ænima — 1. Eulogy"}
          </span>
          <span className="text-fg-3">1996</span>
        </div>
        <div className="flex justify-between text-amber-dim">
          <span>
            {player?.playing ? "▶" : "⏸"} 00:00 / {player?.track.length ?? "08:27"} — 00:00
          </span>
          <span>all from library | C</span>
        </div>
      </div>
    </div>
  );
};
