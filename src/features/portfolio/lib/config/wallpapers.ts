import type { ImageVariant } from "@/src/shared/lib/cdn-image-loader";

/**
 * Background wallpaper catalogue — the single source of truth for which assets
 * exist and where they live on the CDN. Wallpaper is now scheme-independent: any
 * colour scheme can pair with any wallpaper (or none). Each entry drives both
 * consumers: the full-bleed backdrop and the `imv` viewer window.
 *
 * To wire real assets: upload `bg/<id>/original-<width>.webp` to the CDN and
 * set `NEXT_PUBLIC_CDN_URL`. The full-bleed wallpaper picks the larger widths
 * (sizes 100vw); the small viewer picks the smaller ones (sizes ~30vw).
 */

/** Width ladder, laptop → 4K → 21:9 ultrawide; small end also serves the viewer panel. */
export const IMAGE_WIDTHS = [640, 960, 1280, 1920, 2560, 3440, 3840] as const;

/** `sizes` hint for the full-bleed wallpaper. */
export const WALLPAPER_SIZES = "100vw";

/** `sizes` hint for the viewer panel — roughly a third of the viewport on desktop, nil on mobile. */
export const ORIGINAL_SIZES = "(min-width: 768px) 30vw, 0px";

/** A responsive image with a required webp ladder and an optional avif ladder. */
export interface ResponsiveImage {
  webp: ImageVariant[];
  avif?: ImageVariant[];
}

/** A selectable wallpaper entry. `image: null` means render flat (no asset fetched). */
export interface WallpaperOption {
  id: string;
  label: string;
  image: ResponsiveImage | null;
}

const photo = (id: string): ResponsiveImage => ({
  webp: IMAGE_WIDTHS.map((width) => ({
    src: `bg/${id}/original-${width}.webp`,
    width,
  })),
});

export const WALLPAPERS: WallpaperOption[] = [
  { id: "none", label: "none", image: null },
  { id: "mono", label: "mono", image: photo("mono") },
  { id: "moonlit", label: "moonlit", image: photo("moonlit") },
];

/** The wallpaper shown on first load. */
export const DEFAULT_WALLPAPER_ID = "moonlit";

/** Returns the matching entry, or the "none" option if the id is unrecognised. */
export const wallpaperById = (id: string): WallpaperOption =>
  WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
