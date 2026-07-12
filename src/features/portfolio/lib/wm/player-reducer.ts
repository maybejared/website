export interface PlayerState {
  trackIndex: number;
  playing: boolean;
}

export type PlayerAction = { type: "toggle" } | { type: "next" } | { type: "prev" };

export const initialPlayerState: PlayerState = { trackIndex: 0, playing: false };

export const playerReducer = (
  state: PlayerState,
  action: PlayerAction,
  trackCount: number,
): PlayerState => {
  switch (action.type) {
    case "toggle":
      return { ...state, playing: !state.playing };
    case "next":
      return { ...state, trackIndex: (state.trackIndex + 1) % trackCount };
    case "prev":
      return {
        ...state,
        trackIndex: (state.trackIndex + trackCount - 1) % trackCount,
      };
  }
};
