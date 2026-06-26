"use client";

import type { FC } from "react";

import { ImageViewerPanel } from "@/src/features/portfolio/components/background/image-viewer-panel";
import { useWallpaperEnabled } from "@/src/features/portfolio/hooks/use-wallpaper-enabled";
import { useAppearanceContext } from "@/src/features/portfolio/providers/appearance-context";

/**
 * Decor `imv` window. Reads the live wallpaper selection from
 * {@link useAppearanceContext} so the faux viewer always shows the same image as
 * the desktop backdrop. Falls back to the empty viewer when rendered outside the
 * appearance provider.
 */
export const ImvApp: FC = () => {
  const appearance = useAppearanceContext();
  const enabled = useWallpaperEnabled();

  return (
    <ImageViewerPanel
      wallpaperId={appearance?.wallpaperId ?? "none"}
      enabled={enabled}
    />
  );
};
