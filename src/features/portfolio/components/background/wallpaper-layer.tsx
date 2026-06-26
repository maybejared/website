"use client";

import type { FC } from "react";

import { Crossfade } from "@/src/features/portfolio/components/background/crossfade";
import {
  WALLPAPER_SIZES,
  wallpaperById,
} from "@/src/features/portfolio/lib/config/wallpapers";

interface WallpaperLayerProps {
  wallpaperId: string;
  /** Gate from {@link useWallpaperEnabled}; when false no asset is fetched. */
  enabled: boolean;
}

/**
 * Full-bleed wallpaper behind the faux-terminal desktop. Resolves the active
 * wallpaper from the catalogue (null → flat, vignette only) and crossfades on
 * switch. Lives at the back of the background stage.
 */
export const WallpaperLayer: FC<WallpaperLayerProps> = ({
  wallpaperId,
  enabled,
}) => {
  const image = enabled ? wallpaperById(wallpaperId).image : null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Crossfade
        image={image}
        sizes={WALLPAPER_SIZES}
        imgClassName="object-cover"
      />
    </div>
  );
};
