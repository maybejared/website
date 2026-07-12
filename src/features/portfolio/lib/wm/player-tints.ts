import type { PlayerTrack } from "@/src/shared/types/portfolio";

/** Accent classes for the placeholder album tiles, keyed by track tint. */
export const TINT_TILE: Record<PlayerTrack["tint"], string> = {
  amber: "bg-amber/20 text-amber",
  cyan: "bg-cyan/20 text-cyan",
  magenta: "bg-magenta/20 text-magenta",
  yellow: "bg-yellow/20 text-yellow",
};
