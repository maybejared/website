"use client";

import type { FC } from "react";

import { CONTENT_APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";
import { WORKSPACE_IDS } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  /** True while the leader chord is armed — shows the leader chip. */
  armed: boolean;
  onOpenPalette: () => void;
}

/** `thu 29 may · 21:40` → ["21", "40"]; placeholder-safe. */
const stampTime = (stamp: string): [string, string] => {
  const time = stamp.split("·")[1]?.trim() ?? "--:--";
  const [h = "--", m = "--"] = time.split(":");
  return [h, m];
};

export const Rail: FC<Props> = ({ armed, onOpenPalette }) => {
  const { state, switchWorkspace, openApp } = useWorkspace();
  const stamp = useDeskStamp();
  const [hh, mm] = stampTime(stamp);
  const focusedAppId = state.focused ? state.instances[state.focused] : null;

  return (
    <nav
      aria-label="navigation rail"
      className="z-40 flex w-[52px] flex-none flex-col items-center gap-1.5 py-3 font-mono"
    >
      <span aria-hidden className="mb-1 text-[15px] text-amber">
        ✦
      </span>

      {WORKSPACE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-label={`workspace ${id}`}
          onClick={() => switchWorkspace(id)}
          className={cn(
            "grid h-[26px] w-[26px] place-items-center rounded-lg text-[11px] transition-colors",
            state.active === id
              ? "bg-amber/15 text-amber"
              : "text-fg-3 hover:bg-fg-4/20 hover:text-fg-1",
          )}
        >
          {id}
        </button>
      ))}

      <span aria-hidden className="my-1.5 w-[18px] border-t border-fg-4" />

      {CONTENT_APPS.map((app) => (
        <button
          key={app.id}
          type="button"
          aria-label={app.label}
          onClick={() => openApp(app.id)}
          className={cn(
            "group relative grid h-8 w-8 place-items-center rounded-lg transition-colors",
            focusedAppId === app.id
              ? "bg-amber/15"
              : "hover:bg-fg-4/20",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local svg glyph */}
          <img src={app.icon} alt="" className="h-4 w-4 opacity-80" />
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {app.title}
          </span>
        </button>
      ))}

      <button
        type="button"
        aria-label="search"
        onClick={onOpenPalette}
        className="mt-1.5 grid h-8 w-8 place-items-center rounded-lg text-[13px] text-fg-3 transition-colors hover:bg-fg-4/20 hover:text-fg-1"
      >
        ›_
      </button>

      <span className="flex-1" />

      {armed && (
        <span className="text-[9px] uppercase tracking-[0.08em] text-amber">
          leader
        </span>
      )}
      <div
        aria-label="clock"
        className="my-1 text-center text-[11.5px] leading-[1.5] text-fg-1 tabular-nums"
      >
        <span className="block">{hh}</span>
        <span className="block">{mm}</span>
      </div>
      <span className="flex items-center gap-1 text-[9px] text-fg-3">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
        {portfolioContent.user.handle}
      </span>
    </nav>
  );
};
