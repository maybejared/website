"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";

import { WallpaperLayer } from "@/src/features/portfolio/components/background/wallpaper-layer";
import { Dashboard } from "@/src/features/portfolio/components/wm/dashboard";
import { Desktop } from "@/src/features/portfolio/components/wm/desktop";
import { EdgeHandle } from "@/src/features/portfolio/components/wm/edge-handle";
import { KeymapPanel } from "@/src/features/portfolio/components/wm/keymap-panel";
import { Palette } from "@/src/features/portfolio/components/wm/palette";
import { QuickMenu } from "@/src/features/portfolio/components/wm/quick-menu";
import { Rail } from "@/src/features/portfolio/components/wm/rail";
import { useKeymap } from "@/src/features/portfolio/hooks/use-keymap";
import { useWallpaperEnabled } from "@/src/features/portfolio/hooks/use-wallpaper-enabled";
import { useWmKeys } from "@/src/features/portfolio/hooks/use-wm-keys";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import { AppearanceProvider } from "@/src/features/portfolio/providers/appearance-context";
import { PlayerProvider } from "@/src/features/portfolio/providers/player-context";

interface Props {
  appearance: AppearanceState;
}

type ShellOverlay = "dash" | "quick" | "palette" | null;

/**
 * The hydrated desktop, Quickshell-style: one solid shell surface hosts the
 * left rail and frames the inset wallpaper "wall" (tiling field). Three
 * overlays pull out of the wall's edges — dashboard (top), quick menu
 * (right), search palette (bottom) — one open at a time. The keymap panel
 * stays a modal above everything, opened from the quick menu or leader → ?.
 */
export const DesktopChrome: FC<Props> = ({ appearance }) => {
  const [overlay, setOverlay] = useState<ShellOverlay>(null);
  const [keymapOpen, setKeymapOpen] = useState(false);
  const wallpaperEnabled = useWallpaperEnabled();
  const keymap = useKeymap();

  const toggle = (o: Exclude<ShellOverlay, null>) =>
    setOverlay((cur) => (cur === o ? null : o));

  const { armed, leaderHeld } = useWmKeys({
    keymap,
    toggleLauncher: () => toggle("palette"),
    toggleKeymapPanel: () => setKeymapOpen((open) => !open),
  });

  // "/" opens search from anywhere except a text field; Escape closes any pull.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField = t?.tagName === "INPUT" || t?.tagName === "TEXTAREA";
      if (e.key === "/" && !inField && overlay === null) {
        e.preventDefault();
        setOverlay("palette");
      } else if (e.key === "Escape" && overlay !== null) {
        setOverlay(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay]);

  return (
    <AppearanceProvider
      value={{ scheme: appearance.scheme, wallpaperId: appearance.wallpaperId }}
    >
      <PlayerProvider>
        <div className="fixed inset-0 flex overflow-hidden bg-bg-1">
          <Rail armed={armed} onOpenPalette={() => setOverlay("palette")} />

          <div className="relative min-w-0 flex-1 py-2.5 pr-2.5">
            <div className="wm-wall relative h-full w-full overflow-hidden rounded-2xl border border-fg-4/50">
              <WallpaperLayer
                wallpaperId={appearance.wallpaperId}
                enabled={wallpaperEnabled}
              />
              <div className="absolute inset-0">
                <Desktop leaderHeld={leaderHeld} />
              </div>
              <div aria-hidden className="wm-grain pointer-events-none absolute inset-0" />
            </div>

            <EdgeHandle
              side="top"
              label="toggle dashboard"
              active={overlay === "dash"}
              onClick={() => toggle("dash")}
            />
            <EdgeHandle
              side="right"
              label="toggle quick menu"
              active={overlay === "quick"}
              onClick={() => toggle("quick")}
            />
            <EdgeHandle
              side="bottom"
              label="toggle search"
              active={overlay === "palette"}
              onClick={() => toggle("palette")}
            />

            <Dashboard open={overlay === "dash"} onClose={() => setOverlay(null)} />
            <QuickMenu
              open={overlay === "quick"}
              onClose={() => setOverlay(null)}
              onOpenKeymap={() => setKeymapOpen(true)}
            />
          </div>

          <Palette
            key={`palette-${overlay === "palette" ? 1 : 0}`}
            open={overlay === "palette"}
            onClose={() => setOverlay(null)}
            appearance={appearance}
          />
          <KeymapPanel
            key={`keymap-${keymapOpen ? 1 : 0}`}
            keymap={keymap}
            open={keymapOpen}
            onClose={() => setKeymapOpen(false)}
          />
        </div>
      </PlayerProvider>
    </AppearanceProvider>
  );
};
