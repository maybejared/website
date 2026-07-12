# ASCII Art Renderer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A reusable canvas component that renders truecolour `.ans` ASCII-art exports (with scanline entrance reveal and scheme-tint mode), replacing the broken masked-webp `~/ascii.txt` panels in contact and about.

**Architecture:** Pure ANSI parser (`parseAnsi`) → cached art grid → `AsciiArt` canvas component (contain-fit, DPR-aware, reveal via rAF, tint via scheme CSS vars + body-class MutationObserver) → two panel swaps + retirement of the `.ascii-panel` blueprint special-case.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Vitest + Testing Library, Playwright. No new dependencies.

**Spec:** docs/superpowers/specs/2026-07-12-ascii-art-renderer-design.md

## Global Constraints

- Commit contract: ONE commit per task, message = one plain English sentence, imperative mood, NO conventional-commit prefixes, NO Co-Authored-By trailer, NO generated-with footer. Plain `git commit`; stage only the task's files.
- React conventions: `const` components, one component per file, local `interface Props`, `FC<Props>`, `@/src/...` imports.
- Colours in components only through scheme tokens/CSS vars — the parser deals in raw rgb tuples (data, not styling).
- jsdom guards: `canvas.getContext` may return null, `ResizeObserver`/`IntersectionObserver` may be undefined — the component must no-op gracefully (tests rely on this).
- `prefers-reduced-motion: reduce` must skip the reveal (paint fully, immediately).
- Test commands: `pnpm vitest run <path>`, `pnpm lint`, `pnpm test:e2e`.

## File Structure

```
Create:
  public/ascii/rose.ans                       # committed sample export (copied from ~/Downloads)
  src/shared/lib/ascii/ansi.ts                # parseAnsi + types
  src/shared/lib/ascii/ansi.test.ts
  src/shared/ui/ascii-art.tsx                 # canvas renderer component
  src/shared/ui/ascii-art.test.tsx
Modify:
  src/features/portfolio/components/sections/contact-section.tsx  # panel swap
  src/features/portfolio/components/sections/about-section.tsx    # panel swap
  app/globals.css                             # remove .scheme-beige .ascii-panel block
  e2e/workspace-desktop.spec.ts               # canvas-renders assertion
```

---

### Task 1: Fixture + ANSI parser

**Files:**
- Create: `public/ascii/rose.ans` (copy of `/Users/jared/Downloads/asciinator_12Jul_001.ans`)
- Create: `src/shared/lib/ascii/ansi.ts`
- Create: `src/shared/lib/ascii/ansi.test.ts`

**Interfaces:**
- Produces: `parseAnsi(text: string): AsciiArt`, `interface AsciiArt { cols: number; rows: number; cells: AsciiCell[][] }`, `interface AsciiCell { ch: string; rgb: [number, number, number] | null }`. Task 2 consumes these exactly.

- [ ] **Step 1: Commit the fixture**

Run: `mkdir -p public/ascii && cp /Users/jared/Downloads/asciinator_12Jul_001.ans public/ascii/rose.ans`
Verify: `wc -lc public/ascii/rose.ans` → 61 lines, ~34948 bytes.

- [ ] **Step 2: Write the failing test**

Create `src/shared/lib/ascii/ansi.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseAnsi } from "@/src/shared/lib/ascii/ansi";

const FIXTURE = readFileSync(
  join(process.cwd(), "public/ascii/rose.ans"),
  "utf8",
);

describe("parseAnsi", () => {
  it("parses a truecolour cell and a reset", () => {
    const art = parseAnsi("\u001b[38;2;200;10;30mA\u001b[0mB");
    expect(art.rows).toBe(1);
    expect(art.cells[0][0]).toEqual({ ch: "A", rgb: [200, 10, 30] });
    expect(art.cells[0][1]).toEqual({ ch: "B", rgb: null });
  });

  it("treats spaces as empty cells regardless of active colour", () => {
    const art = parseAnsi("\u001b[38;2;1;2;3m .");
    expect(art.cells[0][0].rgb).toBeNull();
    expect(art.cells[0][1].rgb).toEqual([1, 2, 3]);
  });

  it("skips unknown SGR sequences without consuming glyphs", () => {
    const art = parseAnsi("\u001b[1mX\u001b[48;2;9;9;9mY");
    expect(art.cells[0].map((c) => c.ch).join("")).toBe("XY");
  });

  it("trims fully-empty leading and trailing rows", () => {
    const art = parseAnsi("\u001b[0m   \nX\n   \n");
    expect(art.rows).toBe(1);
    expect(art.cells[0][0].ch).toBe("X");
  });

  it("parses the committed fixture into a plausible grid", () => {
    const art = parseAnsi(FIXTURE);
    expect(art.rows).toBeGreaterThan(30);
    expect(art.cols).toBeGreaterThan(80);
    // At least one coloured glyph exists.
    expect(
      art.cells.some((row) => row.some((c) => c.rgb !== null && c.ch !== " ")),
    ).toBe(true);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run src/shared/lib/ascii/ansi.test.ts`
Expected: FAIL — module `ansi` not found.

- [ ] **Step 4: Implement the parser**

Create `src/shared/lib/ascii/ansi.ts`:

```ts
export interface AsciiCell {
  ch: string;
  /** null → uncoloured (render with the scheme's default fg). */
  rgb: [number, number, number] | null;
}

export interface AsciiArt {
  cols: number;
  rows: number;
  cells: AsciiCell[][];
}

const ESC = "\u001b";

const rowEmpty = (row: AsciiCell[]): boolean =>
  row.every((c) => c.ch === " ");

/**
 * Parse truecolour SGR ANSI art into a cell grid. Understands exactly the
 * grammar the exporter emits — `ESC[38;2;R;G;Bm` sets the foreground,
 * `ESC[0m` (or `ESC[m`) resets — and skips any other SGR sequence, so
 * exports from other tools degrade gracefully instead of erroring.
 */
export function parseAnsi(text: string): AsciiArt {
  const cells: AsciiCell[][] = [];
  let rgb: [number, number, number] | null = null;

  for (const line of text.split(/\r?\n/)) {
    const row: AsciiCell[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === ESC && line[i + 1] === "[") {
        const end = line.indexOf("m", i + 2);
        if (end === -1) break; // malformed tail — drop the rest of the line
        const body = line.slice(i + 2, end);
        const params = body.split(";").map(Number);
        if (params[0] === 38 && params[1] === 2 && params.length >= 5) {
          rgb = [params[2] || 0, params[3] || 0, params[4] || 0];
        } else if (body === "" || params[0] === 0) {
          rgb = null;
        }
        i = end + 1;
      } else {
        // Spaces are empty cells; colour only travels with visible glyphs.
        row.push({ ch: line[i], rgb: line[i] === " " ? null : rgb });
        i += 1;
      }
    }
    cells.push(row);
  }

  // Exporters pad the art vertically; trim so the canvas aspect matches the
  // visible glyphs.
  while (cells.length && rowEmpty(cells[0])) cells.shift();
  while (cells.length && rowEmpty(cells[cells.length - 1])) cells.pop();

  const cols = cells.reduce((m, r) => Math.max(m, r.length), 0);
  return { cols, rows: cells.length, cells };
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run src/shared/lib/ascii/ansi.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Full gates, then commit**

Run: `pnpm vitest run && pnpm lint`
Commit (fixture + parser + test): e.g. "Add the ansi art parser with a committed sample export"

---

### Task 2: AsciiArt canvas component

**Files:**
- Create: `src/shared/ui/ascii-art.tsx`
- Create: `src/shared/ui/ascii-art.test.tsx`

**Interfaces:**
- Consumes: `parseAnsi`/`AsciiArt` from Task 1.
- Produces: `<AsciiArt src mode? reveal? label? className? />` — Task 3 mounts it with `className="absolute inset-0"` inside the panels.

- [ ] **Step 1: Write the failing test**

Create `src/shared/ui/ascii-art.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { AsciiArt } from "@/src/shared/ui/ascii-art";

const SAMPLE = "\u001b[38;2;200;10;30m##\n\u001b[0m##";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(SAMPLE, { status: 200 })),
  );
});

describe("AsciiArt", () => {
  it("mounts an accessible canvas and fetches the art once", async () => {
    render(<AsciiArt src="/ascii/one.ans" label="rose" />);
    expect(screen.getByRole("img", { name: "rose" })).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/ascii/one.ans"));
  });

  it("caches parses per src across instances", async () => {
    render(
      <>
        <AsciiArt src="/ascii/two.ans" />
        <AsciiArt src="/ascii/two.ans" />
      </>,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getAllByRole("img", { name: "ascii art" })).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/shared/ui/ascii-art.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

Create `src/shared/ui/ascii-art.tsx`:

```tsx
"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { parseAnsi, type AsciiArt as Art } from "@/src/shared/lib/ascii/ansi";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  /** Path to a truecolour .ans export under public/, e.g. "/ascii/rose.ans". */
  src: string;
  /** "original" renders exported colours; "tint" maps luminance onto the scheme. */
  mode?: "original" | "tint";
  /** Scanline entrance on first view; skipped under prefers-reduced-motion. */
  reveal?: boolean;
  label?: string;
  className?: string;
}

// Mono glyph advance/line-height ratio — drives the cell box the glyphs sit in.
const CELL_ASPECT = 0.6;
const REVEAL_MS = 600;

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
  reveal = true,
  label = "ascii art",
  className,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [art, setArt] = useState<Art | null>(null);
  // Bumped whenever the scheme class changes so tint mode re-reads the vars.
  const [schemeTick, setSchemeTick] = useState(0);
  // Rows currently painted; Infinity once fully revealed.
  const [visibleRows, setVisibleRows] = useState<number>(reveal ? 0 : Infinity);

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

  // Reveal: start the scanline the first time the canvas is in view.
  useEffect(() => {
    if (!reveal || !art || visibleRows > 0) return;
    const el = canvasRef.current;
    if (!el) return;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setVisibleRows(Infinity);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / REVEAL_MS);
        setVisibleRows(t >= 1 ? Infinity : Math.ceil(t * art.rows));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reveal, art, visibleRows]);

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

      const rows = Math.min(art.rows, visibleRows);
      for (let r = 0; r < rows; r++) {
        const row = art.cells[r];
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell.ch === " ") continue;
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
    };

    draw();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [art, mode, visibleRows, schemeTick]);

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/shared/ui/ascii-art.test.tsx`
Expected: PASS (2 tests). Output must be pristine — the jsdom guards mean no canvas/observer errors.

- [ ] **Step 5: Full gates, then commit**

Run: `pnpm vitest run && pnpm lint`
Commit: e.g. "Add a canvas ascii art component with reveal and tint modes"

---

### Task 3: Panel swaps + CSS retirement + e2e

**Files:**
- Modify: `src/features/portfolio/components/sections/contact-section.tsx:98-120` (the `~/ascii.txt` Panel)
- Modify: `src/features/portfolio/components/sections/about-section.tsx:79-108` (the `~/ascii.txt` Panel)
- Modify: `app/globals.css` (delete the `.scheme-beige .ascii-panel` block, lines ~111-140)
- Modify: `e2e/workspace-desktop.spec.ts`

**Interfaces:**
- Consumes: `AsciiArt` from Task 2, fixture `/ascii/rose.ans` from Task 1.

- [ ] **Step 1: Swap the contact panel**

In `contact-section.tsx`, replace the whole `~/ascii.txt` `<Panel>` (the `ascii-panel` classed one and its masked `<div>`) with:

```tsx
      <Panel label="~/ascii.txt" className="max-md:aspect-square">
        {/* Colour ASCII export rendered live on canvas — swap the .ans file
            under public/ascii/ to change the art. */}
        <AsciiArt
          src="/ascii/rose.ans"
          mode="original"
          label="ascii rose"
          className="absolute inset-0"
        />
      </Panel>
```

Add the import: `import { AsciiArt } from "@/src/shared/ui/ascii-art";`

- [ ] **Step 2: Swap the about panel**

Same replacement in `about-section.tsx` (the `md:hidden` mobile panel), using tint mode so the art follows the scheme:

```tsx
      <Panel label="~/ascii.txt" className="max-md:aspect-square md:hidden">
        <AsciiArt
          src="/ascii/rose.ans"
          mode="tint"
          label="ascii rose"
          className="absolute inset-0"
        />
      </Panel>
```

Add the same import. Note: the Panel's content region must remain `position: relative` for `absolute inset-0` to anchor — the existing masked div relied on the same thing, so no change is expected; verify visually in Step 5.

- [ ] **Step 3: Retire the blueprint special-case**

In `app/globals.css`, delete the entire `.scheme-beige .ascii-panel { ... }` rule block (the comment beginning "In beige the ascii.txt panel reads poorly" through its closing brace). Grep to confirm no `ascii-panel` class usage remains anywhere: `grep -rn "ascii-panel" src app` → no hits.

- [ ] **Step 4: e2e assertion**

In `e2e/workspace-desktop.spec.ts`, add:

```ts
  test("the contact window renders the ascii art canvas", async ({ page }) => {
    await page.goto("/contact");
    const win = page.locator('[data-leaf="contact"]');
    await win.waitFor({ timeout: 10_000 });
    await expect(win.getByRole("img", { name: "ascii rose" })).toBeVisible();
  });
```

- [ ] **Step 5: Verify**

Run: `pnpm vitest run && pnpm lint && pnpm test:e2e && pnpm build`
Expected: all green.

Visual: run a throwaway Playwright script that screenshots `/contact` at 1440×900 (desktop WM) and `/contact` at 390×844 (mobile) and confirm the rose renders coloured, contain-fit, not squashed; delete the script after. If the art doesn't render, check DevTools/network for the `.ans` fetch and report findings rather than papering over.

- [ ] **Step 6: Commit**

Commit: e.g. "Render the ascii panels from ans exports instead of masked images"

---

## Self-Review Notes

- Spec coverage: parser (T1), component with original/tint/reveal/a11y/caching (T2), both panel swaps + `.ascii-panel` retirement + fallback-colour behavior (T3). Contain-fit replaces the spec's width-only sizing — panels have fixed heights, so fitting both axes is the correct reading.
- Type consistency: `AsciiArt`/`AsciiCell`/`parseAnsi` names match across T1/T2; component alias `Art` is local.
- Known risk: `ctx.scale(dpr, dpr)` after setting width/height is correct (sizing resets the transform); fillText per cell at 61×120 is ~7k calls — fine at 60fps for a one-shot reveal.
