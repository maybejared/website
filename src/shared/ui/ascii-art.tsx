"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { parseAnsi, type AsciiArt as Art } from "@/src/shared/lib/ascii/ansi";
import { cn } from "@/src/shared/lib/utils";

type RevealMode = "scanline" | "dither" | "none";

interface Props {
  /** Path to a truecolour .ans export under public/, e.g. "/ascii/rose.ans". */
  src: string;
  /** "original" renders exported colours; "tint" maps luminance onto the scheme. */
  mode?: "original" | "tint";
  /**
   * Entrance on first view — "scanline" paints top→bottom, "dither" pops
   * glyphs in pseudo-randomly. Skipped under prefers-reduced-motion.
   */
  reveal?: RevealMode;
  /**
   * Ambient life after the reveal: "flicker" blinks a few percent of glyphs
   * out/dim each tick so the art never sits fully still. Skipped under
   * prefers-reduced-motion.
   */
  ambient?: "flicker" | "none";
  label?: string;
  className?: string;
}

// Mono glyph advance/line-height ratio — drives the cell box the glyphs sit in.
const CELL_ASPECT = 0.6;
const REVEAL_MS: Record<Exclude<RevealMode, "none">, number> = {
  scanline: 600,
  dither: 900,
};

// Deterministic per-cell threshold in [0,1) — stable across frames, so during
// a dither reveal cells accumulate instead of flickering.
const hash01 = (r: number, c: number): number => {
  let h = (r * 73856093) ^ (c * 19349663);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Ambient flicker: stepped, low-fps ticks read a time-seeded hash per cell —
// each tick a different few percent of glyphs blink out or dim, then return.
const AMBIENT_TICK_MS = 120;
const AMBIENT_OUT = 0.04; // fraction fully blinked out per tick
const AMBIENT_DIM = 0.1; // additional fraction drawn at half strength

// Parse once per src for the whole session, however many placements exist.
const artCache = new Map<string, Promise<Art>>();

const loadArt = (src: string): Promise<Art> => {
  let p = artCache.get(src);
  if (!p) {
    p = fetch(src).then(async (res) => {
      if (!res.ok) throw new Error(`ascii art fetch failed: ${res.status}`);
      return parseAnsi(await res.text());
    });
    artCache.set(src, p);
    p.catch(() => artCache.delete(src)); // let a later mount retry
  }
  return p;
};

const hexToRgb = (hex: string): [number, number, number] | null => {
  const h = hex.trim().replace("#", "");
  const v = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = ([r, g, b]: [number, number, number]): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const lerp = (a: number, b: number, t: number): number =>
  Math.round(a + (b - a) * t);

export const AsciiArt: FC<Props> = ({
  src,
  mode = "original",
  reveal = "scanline",
  ambient = "none",
  label = "ascii art",
  className,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [art, setArt] = useState<Art | null>(null);
  // Bumped whenever the scheme class changes so tint mode re-reads the vars.
  const [schemeTick, setSchemeTick] = useState(0);
  // Reveal progress 0..1; 1 once fully painted.
  const [progress, setProgress] = useState<number>(() => {
    if (reveal === "none") return 1;
    if (typeof IntersectionObserver === "undefined") return 1;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return 1;
    }
    return 0;
  });

  useEffect(() => {
    let cancelled = false;
    loadArt(src)
      .then((a) => {
        if (!cancelled) setArt(a);
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") console.warn(err);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Reveal: start the entrance the first time the canvas is in view.
  useEffect(() => {
    if (reveal === "none" || !art || progress > 0) return;
    const el = canvasRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const duration = REVEAL_MS[reveal];
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setProgress(t);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reveal, art, progress]);

  // Tint mode tracks scheme swaps (a .scheme-* class toggled on <body>).
  useEffect(() => {
    if (mode !== "tint" || typeof MutationObserver === "undefined") return;
    const mo = new MutationObserver(() => setSchemeTick((t) => t + 1));
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [mode]);

  // Draw — contain-fit into the wrapper, DPR-aware, re-runs on resize.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || !art || art.rows === 0) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ambientActive = ambient === "flicker" && !reduced && progress >= 1;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return; // jsdom
      const { width: w, height: h } = wrap.getBoundingClientRect();
      if (w === 0 || h === 0) return;

      const cellH = Math.min(h / art.rows, w / (art.cols * CELL_ASPECT));
      const cellW = cellH * CELL_ASPECT;
      const artW = cellW * art.cols;
      const artH = cellH * art.rows;
      const x0 = (w - artW) / 2;
      const y0 = (h - artH) / 2;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const style = getComputedStyle(document.body);
      const fallback = style.getPropertyValue("--fg-2").trim();
      const dark = hexToRgb(style.getPropertyValue("--fg-4")) ?? [64, 64, 64];
      const light = hexToRgb(style.getPropertyValue("--fg-0")) ?? [
        255, 255, 255,
      ];

      ctx.font = `${cellH}px ${style.fontFamily}`;
      ctx.textBaseline = "top";

      const bucket = ambientActive
        ? Math.floor(performance.now() / AMBIENT_TICK_MS)
        : -1;

      for (let r = 0; r < art.rows; r++) {
        // Scanline: rows paint top→bottom with progress.
        if (reveal === "scanline" && r >= progress * art.rows) break;
        const row = art.cells[r];
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell.ch === " ") continue;
          // Dither: each glyph pops in once progress crosses its threshold.
          if (reveal === "dither" && hash01(r, c) > progress) continue;
          if (bucket >= 0) {
            const flick = hash01(r * 31 + bucket, c * 17 - bucket);
            if (flick < AMBIENT_OUT) continue; // blinked out this tick
            ctx.globalAlpha = flick < AMBIENT_OUT + AMBIENT_DIM ? 0.45 : 1;
          }
          if (cell.rgb === null) {
            ctx.fillStyle = fallback || "#888";
          } else if (mode === "tint") {
            const t = luminance(cell.rgb);
            ctx.fillStyle = `rgb(${lerp(dark[0], light[0], t)},${lerp(dark[1], light[1], t)},${lerp(dark[2], light[2], t)})`;
          } else {
            ctx.fillStyle = `rgb(${cell.rgb[0]},${cell.rgb[1]},${cell.rgb[2]})`;
          }
          ctx.fillText(cell.ch, x0 + c * cellW, y0 + r * cellH);
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(draw) : null;
    ro?.observe(wrap);

    // Ambient loop: stepped redraws, gated to the canvas being in view so an
    // off-screen art doesn't burn frames.
    let interval: number | undefined;
    let io: IntersectionObserver | undefined;
    if (ambientActive) {
      const inView = { current: true };
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(([entry]) => {
          inView.current = entry.isIntersecting;
        });
        io.observe(canvas);
      }
      interval = window.setInterval(() => {
        if (inView.current) draw();
      }, AMBIENT_TICK_MS);
    }

    return () => {
      ro?.disconnect();
      io?.disconnect();
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [art, mode, reveal, ambient, progress, schemeTick]);

  return (
    <div ref={wrapRef} className={cn("overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="h-full w-full"
      />
    </div>
  );
};
