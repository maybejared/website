import { describe, expect, it } from "vitest";

import {
  initialPlayerState,
  playerReducer,
} from "@/src/features/portfolio/lib/wm/player-reducer";

describe("playerReducer", () => {
  it("toggles playing", () => {
    const s1 = playerReducer(initialPlayerState, { type: "toggle" }, 5);
    expect(s1.playing).toBe(true);
    const s2 = playerReducer(s1, { type: "toggle" }, 5);
    expect(s2.playing).toBe(false);
  });

  it("next advances and wraps", () => {
    const at4 = { trackIndex: 4, playing: true };
    expect(playerReducer(at4, { type: "next" }, 5).trackIndex).toBe(0);
    expect(playerReducer(initialPlayerState, { type: "next" }, 5).trackIndex).toBe(1);
  });

  it("prev retreats and wraps", () => {
    expect(playerReducer(initialPlayerState, { type: "prev" }, 5).trackIndex).toBe(4);
  });

  it("next/prev keep playing state", () => {
    const playing = { trackIndex: 0, playing: true };
    expect(playerReducer(playing, { type: "next" }, 5).playing).toBe(true);
    expect(playerReducer(playing, { type: "prev" }, 5).playing).toBe(true);
  });
});
