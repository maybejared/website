"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";

import { WallpaperLayer } from "@/src/features/portfolio/components/background/wallpaper-layer";
import { Desktop } from "@/src/features/portfolio/components/wm/desktop";
import { KeymapPanel } from "@/src/features/portfolio/components/wm/keymap-panel";
import { Palette } from "@/src/features/portfolio/components/wm/palette";
import { TopBar } from "@/src/features/portfolio/components/wm/top-bar";
import { useKeymap } from "@/src/features/portfolio/hooks/use-keymap";
import { useWallpaperEnabled } from "@/src/features/portfolio/hooks/use-wallpaper-enabled";
import { useWmKeys } from "@/src/features/portfolio/hooks/use-wm-keys";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import { AppearanceProvider } from "@/src/features/portfolio/providers/appearance-context";

interface Props {
  appearance: AppearanceState;
}

/**
 * The hydrated desktop: full-screen compositor chrome (wallpaper, top bar, the
 * Mosaic window field, and the app launcher) plus the keyboard layer. Lives
 * inside {@link WorkspaceProvider}; rendered only on hydrated desktop viewports.
 */
export const DesktopChrome: FC<Props> = ({ appearance }) => {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [keymapOpen, setKeymapOpen] = useState(false);
  const wallpaperEnabled = useWallpaperEnabled();
  const keymap = useKeymap();

  const { armed, leaderHeld } = useWmKeys({
    keymap,
    toggleLauncher: () => setLauncherOpen((open) => !open),
    toggleKeymapPanel: () => setKeymapOpen((open) => !open),
  });

  // "/" opens the search palette from anywhere except a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField = t?.tagName === "INPUT" || t?.tagName === "TEXTAREA";
      if (e.key === "/" && !inField && !launcherOpen) {
        e.preventDefault();
        setLauncherOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launcherOpen]);

  return (
    <AppearanceProvider
      value={{ scheme: appearance.scheme, wallpaperId: appearance.wallpaperId }}
    >
      <div className="fixed inset-0 overflow-hidden">
        <WallpaperLayer
          wallpaperId={appearance.wallpaperId}
          enabled={wallpaperEnabled}
        />
        <TopBar
          appearance={appearance}
          onOpenLauncher={() => setLauncherOpen(true)}
          onOpenKeymap={() => setKeymapOpen(true)}
          armed={armed}
        />
        {/* TopBar only renders at lg+ (hidden lg:flex); below lg the field fills
            from the top, at lg+ it clears the 28px bar. */}
        <div className="absolute inset-x-0 bottom-0 top-0 lg:top-7">
          <Desktop leaderHeld={leaderHeld} />
        </div>
        <Palette
          key={`palette-${launcherOpen ? 1 : 0}`}
          open={launcherOpen}
          onClose={() => setLauncherOpen(false)}
          appearance={appearance}
        />
        <KeymapPanel
          key={`keymap-${keymapOpen ? 1 : 0}`}
          keymap={keymap}
          open={keymapOpen}
          onClose={() => setKeymapOpen(false)}
        />
        {/* CRT scanline + phosphor-glow overlay, carried over from the old shell. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay"
          style={{
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0) 0 2px, rgba(0,0,0,0.16) 3px 3px), radial-gradient(ellipse at center, rgba(var(--glow-fg-rgb),0.05) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
      </div>
    </AppearanceProvider>
  );
};
