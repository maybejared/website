"use client";

import type { FC } from "react";

import { APP_GLYPHS } from "@/src/features/portfolio/components/wm/app-glyphs";
import { RailPreview } from "@/src/features/portfolio/components/wm/rail-preview";
import { CONTENT_APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";
import { workspaceAppIds } from "@/src/features/portfolio/lib/wm/workspace-apps";
import { WORKSPACE_IDS } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { usePlayer } from "@/src/features/portfolio/providers/player-context";
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

const capsuleClass =
  "flex w-[38px] flex-col items-center gap-1 rounded-full bg-bg-2/70 py-2";

export const Rail: FC<Props> = ({ armed, onOpenPalette }) => {
  const { state, switchWorkspace, openApp } = useWorkspace();
  const player = usePlayer();
  const stamp = useDeskStamp();
  const [hh, mm] = stampTime(stamp);
  const focusedAppId = state.focused ? state.instances[state.focused] : null;
  const activeApps = workspaceAppIds(state, state.active);
  const playlistOpen = Object.values(state.instances).includes("playlist");
  const showStatus = player !== null && (playlistOpen || player.playing);

  return (
    <nav
      aria-label="navigation rail"
      className="z-40 flex w-[56px] flex-none flex-col items-center gap-2 py-3 font-mono"
    >
      <div className={capsuleClass}>
        <span aria-hidden className="text-[15px] text-amber">
          ✦
        </span>
        {WORKSPACE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`workspace ${id}`}
            onClick={() => switchWorkspace(id)}
            className={cn(
              "grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] transition-colors",
              state.active === id
                ? "bg-amber/15 text-amber"
                : "text-fg-3 hover:bg-fg-4/20 hover:text-fg-1",
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className={capsuleClass}>
        {CONTENT_APPS.map((app) => {
          const isOpen = activeApps.includes(app.id);
          const isFocused = focusedAppId === app.id;
          return (
            <button
              key={app.id}
              type="button"
              aria-label={app.label}
              onClick={() => openApp(app.id)}
              className={cn(
                "group relative flex h-9 w-8 flex-col items-center justify-center rounded-full transition-colors",
                isFocused
                  ? "bg-amber/15 text-amber"
                  : "text-fg-3 hover:bg-fg-4/20 hover:text-fg-1",
              )}
            >
              {APP_GLYPHS[app.id]}
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 h-1 w-1 rounded-full transition-colors",
                  isOpen ? (isFocused ? "bg-amber" : "bg-fg-3") : "bg-transparent",
                )}
              />
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {app.title}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          aria-label="search"
          onClick={onOpenPalette}
          className="grid h-8 w-8 place-items-center rounded-full text-[13px] text-fg-3 transition-colors hover:bg-fg-4/20 hover:text-fg-1"
        >
          ›_
        </button>
      </div>

      {player && showStatus && (
        <div className="group/status relative flex min-h-0 flex-1 justify-center">
          <button
            type="button"
            aria-label="now playing"
            onClick={player.toggle}
            className="max-h-full truncate text-[9.5px] text-fg-2 transition-colors [writing-mode:vertical-rl] hover:text-fg-0"
          >
            ({player.playing ? "playing" : "paused"}) {player.track.title} —{" "}
            {player.track.artist}
          </button>
          <RailPreview />
        </div>
      )}
      {!(player && showStatus) && <span className="flex-1" />}

      <div className={capsuleClass}>
        {armed && (
          <span className="text-[9px] uppercase tracking-[0.08em] text-amber">
            ldr
          </span>
        )}
        <div
          aria-label="clock"
          className="text-center text-[11.5px] leading-[1.5] text-fg-1 tabular-nums"
        >
          <span className="block">{hh}</span>
          <span className="block">{mm}</span>
        </div>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-amber"
          title={portfolioContent.user.handle}
        />
      </div>
    </nav>
  );
};
