"use client";

import type { FC } from "react";

import { Crossfade } from "@/src/features/portfolio/components/background/crossfade";
import {
  ORIGINAL_SIZES,
  wallpaperById,
} from "@/src/features/portfolio/lib/config/wallpapers";

interface ImageViewerPanelProps {
  wallpaperId: string;
  /** Gate from {@link useWallpaperEnabled}; when false no asset is fetched. */
  enabled: boolean;
}

/**
 * Faux `imv` image-viewer terminal: shows the selected wallpaper photo (the same
 * image as the full-bleed backdrop). `image: null` → empty viewer. Crossfades
 * via the shared pipeline.
 */
export const ImageViewerPanel: FC<ImageViewerPanelProps> = ({
  wallpaperId,
  enabled,
}) => {
  const image = enabled ? wallpaperById(wallpaperId).image : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-0">
      <Crossfade
        image={image}
        sizes={ORIGINAL_SIZES}
        imgClassName="object-cover"
      />
    </div>
  );
};
