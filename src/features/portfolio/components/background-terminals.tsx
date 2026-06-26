"use client";

import type { FC } from "react";
import { memo, useEffect, useState } from "react";

import { BtopPanel } from "@/src/features/portfolio/components/background/btop-panel";
import { FauxTerminal } from "@/src/features/portfolio/components/background/faux-terminal";
import { FetchPanel } from "@/src/features/portfolio/components/background/fetch-panel";
import { ImageViewerPanel } from "@/src/features/portfolio/components/background/image-viewer-panel";
import { PlaylistPanel } from "@/src/features/portfolio/components/background/playlist-panel";
import { ScramblePanel } from "@/src/features/portfolio/components/background/scramble-panel";
import { VimPanel } from "@/src/features/portfolio/components/background/vim-panel";
import { WallpaperLayer } from "@/src/features/portfolio/components/background/wallpaper-layer";
import { ZfsPanel } from "@/src/features/portfolio/components/background/zfs-panel";
import { useWindowManager } from "@/src/features/portfolio/providers/window-manager-provider";
import { useWallpaperEnabled } from "@/src/features/portfolio/hooks/use-wallpaper-enabled";
import { DEFAULT_WALLPAPER_ID } from "@/src/features/portfolio/lib/config/wallpapers";
import type { SchemeName } from "@/src/shared/types/portfolio";
import { cn } from "@/src/shared/lib/utils";

/**
 * Decorative desktop of faux terminals arranged to mirror the reference rice:
 * nvim (top-left) and btop (top-right) ride above, while spotify, zfs and pfetch
 * form the lower band (left → right). The whole cluster lives inside a single
 * centered, aspect-bounded *stage* rather than the raw viewport, so it stays
 * pinned to screen-center and never flies apart on tall displays. The stage is
 * sized a touch larger than the portfolio shell so each window's outer edge
 * peeks out from behind it while the inner edges stay covered. A photo wallpaper
 * sits behind the cluster (per scheme), and the lower-left window is an `imv`
 * viewer showing that same photo.
 */
interface BackgroundTerminalsProps {
  scheme: SchemeName;
}

const BackgroundTerminalsView: FC<BackgroundTerminalsProps> = ({ scheme }) => {
  // Fade the whole desktop in on mount so the scrambling panels don't pop in at
  // full intensity — they ease up from transparent as the page settles.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Gate image fetching to desktop, non-Save-Data clients (this whole layer is
  // max-md:hidden, but display:none does not stop <img> loads).
  const enabled = useWallpaperEnabled();

  // Open/close state lives in the window manager; the dock toggles it and the
  // terminals' own traffic-lights hide themselves. Closing a window unmounts it,
  // so reopening replays its scramble intro.
  const { isOpen, hide } = useWindowManager();

  return (
    <div
      aria-hidden
      className={cn(
        "background-terminals pointer-events-none fixed inset-0 z-0 flex select-none items-center justify-center overflow-hidden transition-opacity duration-700 ease-out max-md:hidden",
        shown ? "opacity-85" : "opacity-0",
      )}
    >
      {/* Dithered photo wallpaper, behind the whole terminal cluster. */}
      <WallpaperLayer wallpaperId={DEFAULT_WALLPAPER_ID} enabled={enabled} />

      {/* On lg+ the dock occupies the left edge; nudge the whole cluster clear of
          it so the left-column windows' own controls stay reachable. */}
      <div className="relative h-[min(980px,100dvh)] w-full max-w-[min(90dvw,120rem)] lg:translate-x-4">
        <FauxTerminal
          open={isOpen("spotify")}
          title="spotify — music"
          className="h-[34%] w-[34%]"
          style={{ left: "34%", top: "-5%" }}
          onClose={() => hide("spotify")}
        >
          <ScramblePanel delay={90}>
            <PlaylistPanel />
          </ScramblePanel>
        </FauxTerminal>

        {/* ── top band ── */}
        <FauxTerminal
          open={isOpen("nvim")}
          title="nvim ~/src/coreutils/pwd.c"
          className="h-[45%] w-[45%]"
          style={{ left: 0, top: 0 }}
          onClose={() => hide("nvim")}
        >
          <ScramblePanel delay={40}>
            <VimPanel />
          </ScramblePanel>
        </FauxTerminal>

        <FauxTerminal
          open={isOpen("btop")}
          title="btop — system monitor"
          className="h-[46%] w-[40%]"
          style={{ right: 0, top: 0 }}
          onClose={() => hide("btop")}
        >
          <ScramblePanel delay={130}>
            <BtopPanel />
          </ScramblePanel>
        </FauxTerminal>

        {/* ── lower band: imv · zfs · pfetch ── */}
        <FauxTerminal
          open={isOpen("imv")}
          title="imv — ~/wall/current.png"
          className="h-[40%] w-[29%]"
          style={{ left: 0, bottom: 0 }}
          onClose={() => hide("imv")}
        >
          <ImageViewerPanel wallpaperId={DEFAULT_WALLPAPER_ID} enabled={enabled} />
        </FauxTerminal>

        <FauxTerminal
          open={isOpen("zfs")}
          title="regn@fjell : ~ — zsh"
          className="h-[40%] w-[38%]"
          style={{ left: "33%", bottom: 0 }}
          onClose={() => hide("zfs")}
        >
          <ScramblePanel delay={210}>
            <ZfsPanel />
          </ScramblePanel>
        </FauxTerminal>

        <FauxTerminal
          open={isOpen("pfetch")}
          title="regn@fjell : ~ — pfetch"
          className="h-[22%] w-[22%]"
          style={{ right: 0, top: "52%" }}
          onClose={() => hide("pfetch")}
        >
          <ScramblePanel delay={370}>
            <FetchPanel />
          </ScramblePanel>
        </FauxTerminal>
      </div>

      {/* Faint vignette so the outer edges sink into the desktop. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 86% 90% at center, rgba(0,0,0,0) 62%, color-mix(in oklch, var(--bg-0) 55%, transparent) 100%)",
        }}
      />
    </div>
  );
};

/**
 * Memoised: the backdrop depends only on `scheme` (and its own window-manager
 * context), so it must not re-render with the shell's high-frequency intro/route
 * transition state — that churn dropped frames during the jumble→content reveal.
 */
export const BackgroundTerminals = memo(BackgroundTerminalsView);
