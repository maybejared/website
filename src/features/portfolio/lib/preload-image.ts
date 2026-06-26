import {
  ORIGINAL_SIZES,
  WALLPAPER_SIZES,
  wallpaperById,
  type ResponsiveImage,
} from "@/src/features/portfolio/lib/config/wallpapers";
import { buildSrcSet, getCdnUrl } from "@/src/shared/lib/cdn-image-loader";

/**
 * Best-effort warm of a responsive image's webp ladder into the browser cache,
 * so a subsequent theme switch crossfades instantly. Driven by hover/focus on
 * scheme controls (intent-preload) — keeps loading lazy while hiding latency.
 *
 * No-op for a flat scheme (null) or non-DOM environments. Warms webp only; any
 * avif ladder (if added later) is left to resolve on actual render.
 */
export const preloadResponsiveImage = (
  image: ResponsiveImage | null,
  sizes: string,
): void => {
  if (!image || image.webp.length === 0 || typeof Image === "undefined") return;

  const el = new Image();
  el.sizes = sizes;
  el.srcset = buildSrcSet(image.webp);
  el.src = getCdnUrl(image.webp[0].src);
  // Decode off the main thread; ignore failures (aborted preloads are fine).
  void el.decode?.().catch(() => {});
};

/**
 * Warm both of a wallpaper's assets (full-bleed + viewer preview) ahead of a switch.
 * Wired to hover/focus on the desktop scheme switcher so the crossfade is
 * instant; unknown ids and the "none" wallpaper warm nothing.
 */
export const preloadScheme = (id: string): void => {
  const { image } = wallpaperById(id);
  // One set, two consumers: warm both the wallpaper (large) and viewer (small) tiers.
  preloadResponsiveImage(image, WALLPAPER_SIZES);
  preloadResponsiveImage(image, ORIGINAL_SIZES);
};
