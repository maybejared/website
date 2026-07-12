"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";

import {
  initialPlayerState,
  playerReducer,
  type PlayerAction,
  type PlayerState,
} from "@/src/features/portfolio/lib/wm/player-reducer";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import type { PlayerTrack } from "@/src/shared/types/portfolio";

export interface PlayerValue {
  track: PlayerTrack;
  trackIndex: number;
  trackCount: number;
  playing: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
}

const PlayerContext = createContext<PlayerValue | null>(null);

interface Props {
  children: ReactNode;
}

/**
 * Faux media player shared by the dashboard media tab, the rail's vertical
 * now-playing status, and the playlist decor panel. No audio — just state.
 */
export const PlayerProvider: FC<Props> = ({ children }) => {
  const { tracks } = portfolioContent.player;
  const [state, dispatch] = useReducer(
    (s: PlayerState, a: PlayerAction) => playerReducer(s, a, tracks.length),
    initialPlayerState,
  );

  const value = useMemo<PlayerValue>(
    () => ({
      track: tracks[state.trackIndex],
      trackIndex: state.trackIndex,
      trackCount: tracks.length,
      playing: state.playing,
      toggle: () => dispatch({ type: "toggle" }),
      next: () => dispatch({ type: "next" }),
      prev: () => dispatch({ type: "prev" }),
    }),
    [state, tracks],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

/** Null outside the desktop chrome — consumers fall back to static rendering. */
export const usePlayer = (): PlayerValue | null => useContext(PlayerContext);
