# Hyprland Shell Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the desktop shell read as one continuous layered surface — overlays morph out of the shell frame with inverse corner caps, animated tabs and auto-resizing panels, a live sectioned rail, and a reworked warm "rosewater" beige palette.

**Architecture:** Restyle-in-place. `desktop-chrome.tsx` composition (rail + inset wall + three edge pull-outs) stays. New primitives: `ShellCorner` (inverse-radius cap), `transitions.ts` (shared motion tokens), `useMeasuredHeight` (height-morph), `PlayerProvider` (shared faux media state). Each overlay is restyled to shell-surface color + corner caps + framer-motion open/close and content morphs.

**Tech Stack:** Next.js 16, React 19, Tailwind v4 (CSS-var schemes), `motion` (framer-motion) — new dependency, vitest + testing-library.

**Spec:** `docs/superpowers/specs/2026-07-12-hyprland-shell-redesign-design.md`

## Global Constraints

- **NO git commits. Leave every change unstaged.** (User rule overrides the usual commit-per-task cadence.)
- React conventions (AGENTS.md): `const` components, `FC<Props>`, one component per file, local `Props` interface, feature-module separation.
- Motion imports come from `"motion/react"` (the `motion` package), never `"framer-motion"`.
- Every animated component respects `useReducedMotion()` — reduced motion ⇒ `{ duration: 0 }` transition.
- Color utilities only via scheme tokens (`bg-bg-1`, `text-fg-2`, `text-amber`, …). Never hardcode hexes in components.
- Surface ladder (all schemes): shell strip & overlay panels = `bg-1`, cards inside panels = `bg-2`, insets/hover/highlight = `bg-3`, page backdrop = `bg-0`.
- Do not touch mobile components (`mobile-nav.tsx`, `mobile-tab-bar.tsx`) beyond what compiles.
- Verify commands: `npm test -- <path>` (vitest), `npx tsc --noEmit`, `npm run lint`.
- Comments: sparing, match existing style (constraints only, no change-narration).

---

### Task 1: Motion foundation

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/features/portfolio/lib/wm/transitions.ts`
- Create: `src/features/portfolio/hooks/use-measured-height.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `shellSpring: Transition`, `fadeShift` (motion variants props object), `useMeasuredHeight<T extends HTMLElement>(): { ref: RefObject<T | null>; height: number | "auto" }`.

- [ ] **Step 1: Install motion**

Run: `npm install motion`
Expected: adds `motion` to dependencies, lockfile updated, no peer-dep errors against React 19.2.4. If npm reports a React peer conflict, STOP and report — do not force.

- [ ] **Step 2: Create transitions tokens**

```ts
// src/features/portfolio/lib/wm/transitions.ts
import type { Transition } from "motion/react";

/** One motion character for every shell morph — panels, tabs, popups. */
export const shellSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

/** Cross-fade + slight vertical shift for swapped tab/panel content. */
export const fadeShift = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.16, ease: "easeOut" },
} as const;
```

- [ ] **Step 3: Create measured-height hook**

```ts
// src/features/portfolio/hooks/use-measured-height.ts
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's rendered height so a motion wrapper can animate
 * `height` between content swaps (framer-motion can't animate to "auto").
 */
export const useMeasuredHeight = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    setHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  return { ref, height };
};
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

---

### Task 2: Rosewater beige palette + scheme previews

**Files:**
- Modify: `app/globals.css:19-109` (`.scheme-beige` block, delete `.scheme-beige .panel-chrome` block; keep `.scheme-beige .background-terminals` untouched)
- Modify: `src/features/portfolio/lib/config/schemes.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `SCHEME_PREVIEWS: Record<SchemeName, { surfaces: [string, string, string]; accent: string }>` (hex strings for palette swatch cards; consumed by Task 6).

- [ ] **Step 1: Replace `.scheme-beige` values**

Replace the entire `.scheme-beige { ... }` block (globals.css lines 23–57) with:

```css
/* "beige" scheme, reworked as rosewater: warm rosy-cream surface tiers with a
   terracotta accent, layered like a warm Hyprland rice. Depth comes from the
   bg ladder (shell/panels = bg-1, cards = bg-2, insets = bg-3), not from a
   contrast chrome color. */
.scheme-beige {
  --bg-0: #e2cbc3;
  --bg-1: #f1ded7;
  --bg-2: #f7eae4;
  --bg-3: #fcf3ee;
  --bg-glow: #fff8f4;

  --fg-0: #2d1b16;
  --fg-1: #4a332c;
  --fg-2: #7d6055;
  --fg-3: #a8887c;
  --fg-4: #d9bfb6;

  --amber: #a04b3a;
  --amber-dim: #7c3a2d;
  --cyan: #5c7a72;
  --cyan-dim: #8fa8a0;
  --magenta: #9c5573;
  --red: #b3402f;
  --red-dim: #c79388;
  --yellow: #a5793a;

  --glow-fg-rgb: 125, 96, 85;
  --glow-amber-rgb: 160, 75, 58;
  --glow-cyan-rgb: 92, 122, 114;
  --glow-border-rgb: 74, 51, 44;

  --crest: #5a2c22;

  --active-border: #a04b3a;
}
```

Keep the comment style shown. Delete the old header comment about dark-teal panels/periwinkle desktop (lines 19–22) — the new block's comment replaces it.

- [ ] **Step 2: Delete the navy chrome override**

Delete the whole `.scheme-beige .panel-chrome { ... }` block (globals.css lines 87–109) including its comment. The `panel-chrome` class stays in markup (`faux-terminal.tsx`) and now resolves to normal scheme tokens in beige.

Leave `.scheme-beige .background-terminals` (lines 59–85) exactly as is.

- [ ] **Step 3: Add scheme previews to schemes.ts**

Read `src/features/portfolio/lib/config/schemes.ts` first. Append:

```ts
/** Mini palette chips for the >theme swatch cards; mirrors globals.css. */
export const SCHEME_PREVIEWS: Record<
  SchemeName,
  { surfaces: [string, string, string]; accent: string }
> = {
  beige: { surfaces: ["#f1ded7", "#f7eae4", "#fcf3ee"], accent: "#a04b3a" },
  mono: { surfaces: ["#101013", "#181820", "#22222c"], accent: "#ff9b50" },
  moonlit: { surfaces: ["#0c1020", "#141a2e", "#1e263e"], accent: "#f0b878" },
};
```

Add the `SchemeName` import if the file doesn't already have it.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean. Visual check happens in the final task.

---

### Task 3: ShellCorner primitive

**Files:**
- Create: `src/features/portfolio/components/wm/shell-corner.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `ShellCorner: FC<{ notch: "tl" | "tr" | "bl" | "br"; size?: number; className?: string }>` — `notch` names the corner of the cap square where the concave cut sits.

- [ ] **Step 1: Create component**

```tsx
// src/features/portfolio/components/wm/shell-corner.tsx
"use client";

import type { FC } from "react";

import { cn } from "@/src/shared/lib/utils";

type Notch = "tl" | "tr" | "bl" | "br";

interface Props {
  /** Corner of the cap square carrying the concave cut. */
  notch: Notch;
  size?: number;
  className?: string;
}

const NOTCH_AT: Record<Notch, string> = {
  tl: "0% 0%",
  tr: "100% 0%",
  bl: "0% 100%",
  br: "100% 100%",
};

/**
 * Inverse-radius corner cap: a square of shell surface with a concave
 * quarter-circle masked out, so pull-out panels appear to flow out of the
 * shell skin (the eww/quickshell bar trick). Paints `bg-1` — place it flush
 * against a `bg-bg-1` panel edge and the shell gutter.
 */
export const ShellCorner: FC<Props> = ({ notch, size = 16, className }) => {
  const mask = `radial-gradient(${size}px at ${NOTCH_AT[notch]}, transparent ${
    size - 0.5
  }px, #000 ${size}px)`;
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none block bg-bg-1", className)}
      style={{ width: size, height: size, WebkitMaskImage: mask, maskImage: mask }}
    />
  );
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: clean. Orientation sanity: `notch="bl"` leaves fill hugging the top+right edges — that's the cap for a top-hung panel's left side. Final visual verification in the integration task; if a curve looks inverted there, the fix is swapping the `notch` value at the call site, not changing this component.

---

### Task 4: Player domain (types, tracks, reducer, provider) + mount

**Files:**
- Modify: `src/shared/types/portfolio/index.ts`
- Modify: `src/content/portfolio/portfolio-content.ts`
- Create: `src/features/portfolio/lib/wm/player-reducer.ts`
- Create: `src/features/portfolio/lib/wm/player-reducer.test.ts`
- Create: `src/features/portfolio/providers/player-context.tsx`
- Modify: `src/features/portfolio/components/wm/desktop-chrome.tsx` (mount provider)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `PlayerTrack { title: string; artist: string; album: string; length: string; tint: "amber" | "cyan" | "magenta" | "yellow" }` (shared types)
  - `portfolioContent.player.tracks: PlayerTrack[]` (5 entries)
  - `playerReducer(state: PlayerState, action: PlayerAction, trackCount: number): PlayerState` with `PlayerState { trackIndex: number; playing: boolean }`, `PlayerAction = { type: "toggle" } | { type: "next" } | { type: "prev" }`
  - `PlayerProvider: FC<{ children: ReactNode }>`
  - `usePlayer(): { track: PlayerTrack; trackIndex: number; trackCount: number; playing: boolean; toggle: () => void; next: () => void; prev: () => void } | null` (null outside provider — consumers fall back to static rendering)

- [ ] **Step 1: Add types**

In `src/shared/types/portfolio/index.ts`, add after `Contact`:

```ts
export interface PlayerTrack {
  title: string;
  artist: string;
  album: string;
  /** mm:ss display string. */
  length: string;
  /** Accent token used to tint the placeholder album tile. */
  tint: "amber" | "cyan" | "magenta" | "yellow";
}

export interface PlayerContent {
  tracks: PlayerTrack[];
}
```

And add `player: PlayerContent;` to `PortfolioContent`.

- [ ] **Step 2: Add track data**

In `src/content/portfolio/portfolio-content.ts`, add a `player` section to `portfolioContent` (after `contact`), coherent with the TOOL playlist decor panel:

```ts
player: {
  tracks: [
    { title: "Eulogy", artist: "TOOL", album: "Ænima", length: "08:27", tint: "amber" },
    { title: "Forty Six & 2", artist: "TOOL", album: "Ænima", length: "06:04", tint: "cyan" },
    { title: "Schism", artist: "TOOL", album: "Lateralus", length: "06:47", tint: "magenta" },
    { title: "Parabola", artist: "TOOL", album: "Lateralus", length: "06:03", tint: "yellow" },
    { title: "Lateralus", artist: "TOOL", album: "Lateralus", length: "09:24", tint: "amber" },
  ],
},
```

- [ ] **Step 3: Write failing reducer test**

```ts
// src/features/portfolio/lib/wm/player-reducer.test.ts
import { describe, expect, it } from "vitest";

import {
  initialPlayerState,
  playerReducer,
} from "@/src/features/portfolio/lib/wm/player-reducer";

describe("playerReducer", () => {
  it("toggles playing", () => {
    const s1 = playerReducer(initialPlayerState, { type: "toggle" }, 5);
    expect(s1.playing).toBe(true);
    const s2 = playerReducer(s1, { type: "toggle" }, 5);
    expect(s2.playing).toBe(false);
  });

  it("next advances and wraps", () => {
    const at4 = { trackIndex: 4, playing: true };
    expect(playerReducer(at4, { type: "next" }, 5).trackIndex).toBe(0);
    expect(playerReducer(initialPlayerState, { type: "next" }, 5).trackIndex).toBe(1);
  });

  it("prev retreats and wraps", () => {
    expect(playerReducer(initialPlayerState, { type: "prev" }, 5).trackIndex).toBe(4);
  });

  it("next/prev keep playing state", () => {
    const playing = { trackIndex: 0, playing: true };
    expect(playerReducer(playing, { type: "next" }, 5).playing).toBe(true);
  });
});
```

- [ ] **Step 4: Run test, verify it fails**

Run: `npm test -- src/features/portfolio/lib/wm/player-reducer.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5: Implement reducer**

```ts
// src/features/portfolio/lib/wm/player-reducer.ts
export interface PlayerState {
  trackIndex: number;
  playing: boolean;
}

export type PlayerAction = { type: "toggle" } | { type: "next" } | { type: "prev" };

export const initialPlayerState: PlayerState = { trackIndex: 0, playing: false };

export const playerReducer = (
  state: PlayerState,
  action: PlayerAction,
  trackCount: number,
): PlayerState => {
  switch (action.type) {
    case "toggle":
      return { ...state, playing: !state.playing };
    case "next":
      return { ...state, trackIndex: (state.trackIndex + 1) % trackCount };
    case "prev":
      return {
        ...state,
        trackIndex: (state.trackIndex + trackCount - 1) % trackCount,
      };
  }
};
```

- [ ] **Step 6: Run test, verify it passes**

Run: `npm test -- src/features/portfolio/lib/wm/player-reducer.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Create provider**

```tsx
// src/features/portfolio/providers/player-context.tsx
"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";

import {
  initialPlayerState,
  playerReducer,
  type PlayerAction,
  type PlayerState,
} from "@/src/features/portfolio/lib/wm/player-reducer";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import type { PlayerTrack } from "@/src/shared/types/portfolio";

export interface PlayerValue {
  track: PlayerTrack;
  trackIndex: number;
  trackCount: number;
  playing: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
}

const PlayerContext = createContext<PlayerValue | null>(null);

interface Props {
  children: ReactNode;
}

/**
 * Faux media player shared by the dashboard media tab, the rail's vertical
 * now-playing status, and the playlist decor panel. No audio — just state.
 */
export const PlayerProvider: FC<Props> = ({ children }) => {
  const { tracks } = portfolioContent.player;
  const [state, dispatch] = useReducer(
    (s: PlayerState, a: PlayerAction) => playerReducer(s, a, tracks.length),
    initialPlayerState,
  );

  const value = useMemo<PlayerValue>(
    () => ({
      track: tracks[state.trackIndex],
      trackIndex: state.trackIndex,
      trackCount: tracks.length,
      playing: state.playing,
      toggle: () => dispatch({ type: "toggle" }),
      next: () => dispatch({ type: "next" }),
      prev: () => dispatch({ type: "prev" }),
    }),
    [state, tracks],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

/** Null outside the desktop chrome — consumers fall back to static rendering. */
export const usePlayer = (): PlayerValue | null => useContext(PlayerContext);
```

- [ ] **Step 8: Mount provider in desktop chrome**

In `desktop-chrome.tsx`, import `PlayerProvider` and wrap the existing top-level `<div className="fixed inset-0 ...">` so the tree reads `<AppearanceProvider><PlayerProvider><div ...>...</div></PlayerProvider></AppearanceProvider>`.

- [ ] **Step 9: Verify**

Run: `npm test && npx tsc --noEmit`
Expected: full suite + typecheck clean.

---

### Task 5: Shared workspace-apps helper

**Files:**
- Create: `src/features/portfolio/lib/wm/workspace-apps.ts`
- Create: `src/features/portfolio/lib/wm/workspace-apps.test.ts`
- Modify: `src/features/portfolio/components/wm/dashboard.tsx:24-31` (replace local `workspaceApps` with the helper)

**Interfaces:**
- Consumes: `leafRects` from `@/src/features/portfolio/lib/wm/mosaic-geometry`, `WorkspaceState`/`WorkspaceId` from `workspace-reducer`.
- Produces: `workspaceAppIds(state: WorkspaceState, id: WorkspaceId): AppId[]` — app ids for every window on a workspace in tree order (duplicates preserved for multi-instance apps).

- [ ] **Step 1: Write failing test**

Read `src/features/portfolio/lib/wm/workspace-reducer.ts` first to construct a minimal valid `WorkspaceState`. The state shape has `active`, `layouts` (Mosaic tree per workspace: a leaf is an instance-id string, a parent is `{ direction, first, second, splitPercentage? }`), `instances` (instanceId → appId), `focused`.

```ts
// src/features/portfolio/lib/wm/workspace-apps.test.ts
import { describe, expect, it } from "vitest";

import { workspaceAppIds } from "@/src/features/portfolio/lib/wm/workspace-apps";
import type { WorkspaceState } from "@/src/features/portfolio/lib/wm/workspace-reducer";

const state = {
  active: 1,
  layouts: {
    1: { direction: "row", first: "about-1", second: "terminal-1" },
    2: "posts-1",
    3: null,
    4: null,
  },
  instances: {
    "about-1": "about",
    "terminal-1": "terminal",
    "posts-1": "posts",
  },
  focused: "about-1",
} as unknown as WorkspaceState;

describe("workspaceAppIds", () => {
  it("returns app ids in tree order", () => {
    expect(workspaceAppIds(state, 1 as never)).toEqual(["about", "terminal"]);
  });

  it("returns empty for an empty workspace", () => {
    expect(workspaceAppIds(state, 3 as never)).toEqual([]);
  });
});
```

Adjust the fixture if `WorkspaceState`'s real shape differs — the assertion behavior is the contract, the fixture just needs to be valid.

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- src/features/portfolio/lib/wm/workspace-apps.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement helper**

```ts
// src/features/portfolio/lib/wm/workspace-apps.ts
import type { AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { leafRects } from "@/src/features/portfolio/lib/wm/mosaic-geometry";
import type {
  WorkspaceId,
  WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";

/** App ids for every window on a workspace, in tree order. */
export const workspaceAppIds = (
  state: WorkspaceState,
  id: WorkspaceId,
): AppId[] => {
  const tree = state.layouts[id];
  if (!tree) return [];
  return [...leafRects(tree).keys()]
    .map((leaf) => state.instances[leaf] as AppId | undefined)
    .filter((appId): appId is AppId => appId !== undefined);
};
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- src/features/portfolio/lib/wm/workspace-apps.test.ts`
Expected: PASS.

- [ ] **Step 5: Refactor dashboard to use it**

In `dashboard.tsx`, delete the local `workspaceApps` helper (lines 24–31) and replace its one call site: `workspaceApps(state, id)` becomes `workspaceAppIds(state, id).map((appId) => APP_BY_ID[appId]?.label ?? appId)`. Remove the now-unused `leafRects` import; keep `APP_BY_ID`.

- [ ] **Step 6: Verify**

Run: `npm test && npx tsc --noEmit`
Expected: clean.

---

### Task 6: Palette rework — >theme strip, morph, corner caps

**Files:**
- Modify: `src/features/portfolio/lib/wm/palette-items.ts`
- Create: `src/features/portfolio/lib/wm/palette-items.test.ts`
- Modify: `src/features/portfolio/components/wm/palette.tsx`

**Interfaces:**
- Consumes: `SCHEME_PREVIEWS` (Task 2), `ShellCorner` (Task 3), `shellSpring`/`fadeShift` (Task 1), `useMeasuredHeight` (Task 1).
- Produces: `PaletteItem` gains optional `keywords?: string` (extra match terms, not displayed) and optional `swatch?: { surfaces: [string, string, string]; accent: string }` on scheme items. Palette root element becomes a motion component whose mount/unmount is driven by the parent's `AnimatePresence` (Task 9 relies on this — no internal `if (!open) return null`; keep the `open` prop accepted but only used by mobile until Task 9 removes it, see Step 5).

- [ ] **Step 1: Write failing palette-items test**

```ts
// src/features/portfolio/lib/wm/palette-items.test.ts
import { describe, expect, it } from "vitest";

import { buildPaletteItems } from "@/src/features/portfolio/lib/wm/palette-items";

const deps = {
  openApp: () => {},
  openPost: () => {},
  setScheme: () => {},
  setWallpaperId: () => {},
};

describe("buildPaletteItems action mode", () => {
  it(">theme returns only scheme items", () => {
    const items = buildPaletteItems(">theme", deps);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.kind === "scheme")).toBe(true);
  });

  it(">scheme still returns scheme items", () => {
    const items = buildPaletteItems(">scheme", deps);
    expect(items.every((i) => i.kind === "scheme")).toBe(true);
  });

  it("scheme items carry swatches", () => {
    const items = buildPaletteItems(">theme", deps);
    for (const i of items) {
      expect(i.swatch?.surfaces).toHaveLength(3);
      expect(i.swatch?.accent).toMatch(/^#/);
    }
  });

  it(">wallpaper returns only wallpaper items", () => {
    const items = buildPaletteItems(">wallpaper", deps);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.kind === "wallpaper")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- src/features/portfolio/lib/wm/palette-items.test.ts`
Expected: FAIL — `>theme` currently matches nothing (scheme hint is "scheme") and `swatch` doesn't exist.

- [ ] **Step 3: Extend palette-items**

In `palette-items.ts`:

```ts
import { SCHEMES, SCHEME_PREVIEWS } from "@/src/features/portfolio/lib/config/schemes";
```

Extend the interface:

```ts
export interface PaletteItem {
  key: string;
  kind: "app" | "post" | "scheme" | "wallpaper";
  label: string;
  hint: string;
  /** Extra match-only terms (never displayed). */
  keywords?: string;
  /** CDN-relative preview path for wallpaper items (null → flat swatch). */
  thumbSrc?: string | null;
  /** Mini palette preview for scheme items. */
  swatch?: { surfaces: [string, string, string]; accent: string };
  run: () => void;
}
```

Update the scheme mapping inside the `>` branch:

```ts
const schemes: PaletteItem[] = SCHEMES.map((s) => ({
  key: `scheme-${s}`,
  kind: "scheme",
  label: s,
  hint: "scheme",
  keywords: "theme colors",
  swatch: SCHEME_PREVIEWS[s],
  run: () => deps.setScheme(s),
}));
```

And widen the filter to include keywords:

```ts
return [...schemes, ...walls].filter((i) =>
  matches(cmd, i.hint, i.label, i.keywords ?? ""),
);
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- src/features/portfolio/lib/wm/palette-items.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Rework palette.tsx**

Full replacement of `palette.tsx` (same props contract; `open` still gates rendering internally for now — the desktop parent switches to `AnimatePresence`-driven mounting in Task 9, and the mobile tab bar keeps passing `open`):

```tsx
"use client";

import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import {
  buildPaletteItems,
  type PaletteItem,
} from "@/src/features/portfolio/lib/wm/palette-items";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import type { AppMeta } from "@/src/features/portfolio/lib/config/apps.config";
import { ShellCorner } from "@/src/features/portfolio/components/wm/shell-corner";
import { useMeasuredHeight } from "@/src/features/portfolio/hooks/use-measured-height";
import { shellSpring } from "@/src/features/portfolio/lib/wm/transitions";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { cdnImageLoader } from "@/src/shared/lib/cdn-image-loader";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  appearance: AppearanceState;
  /** Restrict the app rows (mobile passes CONTENT_APPS); defaults to all apps. */
  apps?: AppMeta[];
}

export const Palette: FC<Props> = ({ open, onClose, appearance, apps }) => {
  const { openApp } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();
  const { ref: bodyRef, height } = useMeasuredHeight<HTMLDivElement>();

  const items = useMemo(
    () =>
      buildPaletteItems(
        query,
        {
          openApp,
          openPost: (slug) => {
            openApp("posts");
            router.push(`/posts/${slug}`);
          },
          setScheme: appearance.setScheme,
          setWallpaperId: appearance.setWallpaperId,
        },
        apps,
      ),
    [query, openApp, router, appearance.setScheme, appearance.setWallpaperId, apps],
  );

  // Homogeneous action results (all wallpapers, all schemes) render as a
  // thumbnail/swatch strip instead of rows.
  const stripMode =
    items.length > 0 &&
    (items.every((i) => i.kind === "wallpaper") ||
      items.every((i) => i.kind === "scheme"));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!open) return null;

  const run = (item: PaletteItem) => {
    item.run();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = (d: number) =>
      setHighlight((h) => Math.max(0, Math.min(h + d, items.length - 1)));
    if (e.key === "ArrowDown" || (stripMode && e.key === "ArrowRight")) {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowUp" || (stripMode && e.key === "ArrowLeft")) {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[highlight];
      if (item) run(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const transition = reduced ? { duration: 0 } : shellSpring;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={transition}
        className="relative w-[560px] max-w-[88%] max-md:w-full max-md:max-w-full"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ShellCorner notch="tl" className="absolute bottom-0 right-full" />
        <ShellCorner notch="tr" className="absolute bottom-0 left-full" />
        <div className="overflow-hidden rounded-t-2xl bg-bg-1 shadow-[0_-24px_60px_-30px_rgba(0,0,0,0.5)]">
          <motion.div
            animate={{ height }}
            transition={transition}
            className="overflow-hidden"
          >
            <div ref={bodyRef}>
              {stripMode ? (
                <div className="flex gap-2 overflow-x-auto border-b border-fg-4/40 p-3">
                  {items.map((item, i) => (
                    <button
                      key={item.key}
                      type="button"
                      aria-label={item.label}
                      onMouseDown={() => run(item)}
                      className={cn(
                        "flex flex-none flex-col items-center gap-1.5 rounded-xl bg-bg-2 p-2 text-[10px]",
                        i === highlight
                          ? "ring-1 ring-amber/70 text-fg-0"
                          : "text-fg-2 hover:bg-bg-3",
                      )}
                    >
                      {item.kind === "scheme" && item.swatch ? (
                        <span className="flex h-[75px] w-[120px] flex-col overflow-hidden rounded-lg">
                          {item.swatch.surfaces.map((hex, j) => (
                            <span
                              key={j}
                              className="flex-1"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                          <span
                            className="h-2.5"
                            style={{ backgroundColor: item.swatch.accent }}
                          />
                        </span>
                      ) : item.thumbSrc ? (
                        <Image
                          loader={cdnImageLoader}
                          src={item.thumbSrc}
                          alt=""
                          width={120}
                          height={75}
                          className="h-[75px] w-[120px] rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-[75px] w-[120px] items-center justify-center rounded-lg bg-bg-3 text-fg-3">
                          flat
                        </span>
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto border-b border-fg-4/40 py-1">
                  {items.map((item, i) => (
                    <button
                      key={item.key}
                      type="button"
                      onMouseDown={() => run(item)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-[13px]",
                        i === highlight
                          ? "bg-bg-3 text-fg-0"
                          : "text-fg-2 hover:bg-bg-2",
                      )}
                    >
                      <span className="w-14 flex-none rounded-full bg-bg-2 px-1.5 py-0.5 text-center text-[9px] text-fg-3">
                        {item.kind}
                      </span>
                      <span className="truncate font-sans">{item.label}</span>
                      <span className="ml-auto text-[11px] text-fg-4">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <div className="px-3 py-4 text-center text-[13px] text-fg-4">
                      no matches
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="text-[12px] text-amber">›</span>
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-3"
                  placeholder="search apps, posts…  ( > for actions )"
                />
                <span className="rounded border border-fg-4 px-1.5 py-0.5 text-[9px] text-fg-3">
                  /
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
```

Notes: outer border dropped (shell surface continues); highlight moves to the `bg-3` inset per the surface ladder; strip cards sit on `bg-2`.

- [ ] **Step 6: Verify**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: clean.

---

### Task 7: Dashboard rework — four animated tabs + corner caps

**Files:**
- Create: `src/features/portfolio/components/wm/dash-media.tsx`
- Create: `src/features/portfolio/components/wm/dash-performance.tsx`
- Modify: `src/features/portfolio/components/wm/dashboard.tsx` (full rework)

**Interfaces:**
- Consumes: `usePlayer` (Task 4), `ShellCorner` (Task 3), `shellSpring`/`fadeShift` (Task 1), `useMeasuredHeight` (Task 1), `workspaceAppIds` (Task 5).
- Produces: `Dashboard: FC<{ onClose: () => void }>` — **no `open` prop anymore**; mounting is driven by the parent's `AnimatePresence` (Task 9 updates the call site; until then the parent still passes `open`, which TypeScript will flag — acceptable mid-plan only if Tasks 7 and 9 land in the same session; otherwise keep accepting an ignored `open?: boolean` and let Task 9 delete it. Do the latter: accept `open?: boolean` marked deprecated-in-comment).
  - `DashMedia: FC` (no props), `DashPerformance: FC` (no props).

- [ ] **Step 1: Create DashMedia**

```tsx
// src/features/portfolio/components/wm/dash-media.tsx
"use client";

import type { FC } from "react";

import { usePlayer } from "@/src/features/portfolio/providers/player-context";
import { cn } from "@/src/shared/lib/utils";

const TINT_TILE: Record<string, string> = {
  amber: "bg-amber/20 text-amber",
  cyan: "bg-cyan/20 text-cyan",
  magenta: "bg-magenta/20 text-magenta",
  yellow: "bg-yellow/20 text-yellow",
};

/** Media tab body: placeholder album tile + track meta + transport controls. */
export const DashMedia: FC = () => {
  const player = usePlayer();
  if (!player) return null;
  const { track, trackIndex, trackCount, playing, toggle, next, prev } = player;

  return (
    <div className="flex items-center gap-4 p-4">
      <div
        aria-hidden
        className={cn(
          "grid h-24 w-24 flex-none place-items-center rounded-xl text-4xl",
          TINT_TILE[track.tint],
        )}
      >
        {track.title[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] text-fg-0">{track.title}</div>
        <div className="truncate text-[12px] text-fg-2">
          {track.artist} — {track.album}
        </div>
        <div className="mt-1 text-[10px] text-fg-3 tabular-nums">
          {trackIndex + 1} / {trackCount} · {track.length}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            aria-label="previous track"
            onClick={prev}
            className="grid h-8 w-8 place-items-center rounded-full bg-bg-2 text-[12px] text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-0"
          >
            ⏮
          </button>
          <button
            type="button"
            aria-label={playing ? "pause" : "play"}
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-full bg-amber/20 text-[13px] text-amber transition-colors hover:bg-amber/30"
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            aria-label="next track"
            onClick={next}
            className="grid h-8 w-8 place-items-center rounded-full bg-bg-2 text-[12px] text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-0"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create DashPerformance**

```tsx
// src/features/portfolio/components/wm/dash-performance.tsx
"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const GAUGES: { label: string; base: number; phase: number; tint: string }[] = [
  { label: "cpu", base: 34, phase: 0, tint: "bg-amber" },
  { label: "mem", base: 58, phase: 1.4, tint: "bg-cyan" },
  { label: "disk", base: 71, phase: 2.9, tint: "bg-magenta" },
  { label: "net", base: 22, phase: 4.1, tint: "bg-yellow" },
];

/** Deterministic wander so the gauges feel alive without real metrics. */
const gaugeValue = (base: number, phase: number, t: number): number =>
  Math.min(94, Math.max(6, base + Math.sin(t / 2.6 + phase) * 14));

export const DashPerformance: FC = () => {
  const [tick, setTick] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1200);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="flex flex-col gap-2.5 p-4 font-mono">
      {GAUGES.map(({ label, base, phase, tint }) => {
        const value = gaugeValue(base, phase, tick);
        return (
          <div key={label} className="flex items-center gap-3 text-[11px]">
            <span className="w-8 flex-none text-fg-3">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-2">
              <motion.span
                className={`block h-full rounded-full ${tint}`}
                animate={{ width: `${value}%` }}
                transition={{ duration: reduced ? 0 : 1.1, ease: "easeInOut" }}
              />
            </div>
            <span className="w-9 flex-none text-right text-fg-2 tabular-nums">
              {Math.round(value)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 3: Rework dashboard.tsx**

Full replacement:

```tsx
// src/features/portfolio/components/wm/dashboard.tsx
"use client";

import type { FC } from "react";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { DashMedia } from "@/src/features/portfolio/components/wm/dash-media";
import { DashPerformance } from "@/src/features/portfolio/components/wm/dash-performance";
import { ShellCorner } from "@/src/features/portfolio/components/wm/shell-corner";
import { APP_BY_ID } from "@/src/features/portfolio/lib/config/apps.config";
import { workspaceAppIds } from "@/src/features/portfolio/lib/wm/workspace-apps";
import { WORKSPACE_IDS } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { fadeShift, shellSpring } from "@/src/features/portfolio/lib/wm/transitions";
import { useMeasuredHeight } from "@/src/features/portfolio/hooks/use-measured-height";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  /** Legacy gate — the desktop chrome now mounts via AnimatePresence. */
  open?: boolean;
  onClose: () => void;
}

type Tab = "dashboard" | "media" | "performance" | "workspaces";
const TABS: Tab[] = ["dashboard", "media", "performance", "workspaces"];

export const Dashboard: FC<Props> = ({ open = true, onClose }) => {
  const { state, switchWorkspace } = useWorkspace();
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, now } = portfolioContent;
  const reduced = useReducedMotion();
  const { ref: bodyRef, height } = useMeasuredHeight<HTMLDivElement>();

  if (!open) return null;

  const transition = reduced ? { duration: 0 } : shellSpring;

  return (
    <motion.section
      aria-label="dashboard"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -24, opacity: 0 }}
      transition={transition}
      style={{ x: "-50%" }}
      className="absolute left-1/2 top-0 z-40 w-[620px] max-w-[88%]"
    >
      <ShellCorner notch="bl" className="absolute right-full top-0" />
      <ShellCorner notch="br" className="absolute left-full top-0" />
      <div className="overflow-hidden rounded-b-2xl bg-bg-1 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
        <div role="tablist" className="flex justify-center gap-1 px-2 pt-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "relative rounded-lg px-4 py-1.5 text-[12px] transition-colors",
                tab === t ? "text-amber" : "text-fg-3 hover:text-fg-1",
              )}
            >
              {tab === t && (
                <motion.span
                  layoutId="dash-tab-pill"
                  transition={transition}
                  className="absolute inset-0 rounded-lg bg-amber/15"
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        <motion.div
          animate={{ height }}
          transition={transition}
          className="overflow-hidden"
        >
          <div ref={bodyRef}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={tab} {...fadeShift}>
                {tab === "dashboard" && (
                  <div className="grid grid-cols-[1.2fr_1fr] gap-2.5 p-3">
                    <div className="min-w-0 rounded-xl bg-bg-2 px-4 py-3">
                      <div className="mb-2 text-[10px] tracking-[0.05em] text-amber">
                        {user.handle}@fjell
                      </div>
                      <dl className="text-[11.5px] leading-[1.7]">
                        <div className="flex gap-3">
                          <dt className="w-14 flex-none text-fg-3">name</dt>
                          <dd className="min-w-0 break-words text-fg-1">{user.name}</dd>
                        </div>
                        <div className="flex gap-3">
                          <dt className="w-14 flex-none text-fg-3">role</dt>
                          <dd className="min-w-0 break-words text-fg-1">{user.role}</dd>
                        </div>
                        <div className="flex gap-3">
                          <dt className="w-14 flex-none text-fg-3">based</dt>
                          <dd className="min-w-0 break-words text-fg-1">{user.based}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="min-w-0 rounded-xl bg-bg-2 px-4 py-3">
                      <div className="mb-2 text-[10px] tracking-[0.05em] text-amber">
                        ~/now
                      </div>
                      <ul className="flex flex-col gap-1 font-sans text-[12px] text-fg-2">
                        {now.items.slice(0, 3).map((item) => (
                          <li key={item} className="truncate">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {tab === "media" && <DashMedia />}
                {tab === "performance" && <DashPerformance />}
                {tab === "workspaces" && (
                  <div className="grid grid-cols-4 gap-2.5 p-3">
                    {WORKSPACE_IDS.map((id) => {
                      const apps = workspaceAppIds(state, id).map(
                        (appId) => APP_BY_ID[appId]?.label ?? appId,
                      );
                      const current = state.active === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-label={`workspace ${id}`}
                          onClick={() => {
                            switchWorkspace(id);
                            onClose();
                          }}
                          className={cn(
                            "relative flex aspect-[16/10] flex-col items-start gap-0.5 overflow-hidden rounded-xl bg-bg-2 p-2 text-left text-[10px]",
                            current
                              ? "ring-1 ring-amber/60"
                              : "hover:bg-bg-3",
                          )}
                        >
                          {apps.length === 0 ? (
                            <span className="m-auto text-fg-4">empty</span>
                          ) : (
                            apps.map((label, i) => (
                              <span key={`${label}-${i}`} className="truncate text-fg-2">
                                {label}
                              </span>
                            ))
                          )}
                          <span
                            className={cn(
                              "absolute bottom-1 right-2",
                              current ? "text-amber" : "text-fg-4",
                            )}
                          >
                            {id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
```

Key mechanics: `style={{ x: "-50%" }}` (not a translate class) so motion's y-animation composes with the centering transform; caps sit outside the clipped inner div; card borders dropped in favor of the `bg-2` surface tier.

- [ ] **Step 4: Verify**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: clean. (`desktop-chrome.tsx` still passes `open` — still compatible since `open` remains an accepted prop.)

---

### Task 8: Rail rework — capsules, indicators, vertical status, preview popup

**Files:**
- Create: `src/features/portfolio/components/wm/rail-preview.tsx`
- Modify: `src/features/portfolio/components/wm/rail.tsx` (full rework)

**Interfaces:**
- Consumes: `usePlayer` (Task 4), `workspaceAppIds` (Task 5), `APP_GLYPHS`, `CONTENT_APPS`, workspace provider.
- Produces: `Rail: FC<{ armed: boolean; onOpenPalette: () => void }>` (unchanged contract). `RailPreview: FC` (self-contained hover popup, reads player context).

- [ ] **Step 1: Create RailPreview**

```tsx
// src/features/portfolio/components/wm/rail-preview.tsx
"use client";

import type { FC } from "react";

import { usePlayer } from "@/src/features/portfolio/providers/player-context";
import { cn } from "@/src/shared/lib/utils";

const TINT_TILE: Record<string, string> = {
  amber: "bg-amber/20 text-amber",
  cyan: "bg-cyan/20 text-cyan",
  magenta: "bg-magenta/20 text-magenta",
  yellow: "bg-yellow/20 text-yellow",
};

/**
 * Hover popup for the rail's now-playing status: album tile, track meta and
 * transport controls. Rendered inside a `group/status` wrapper — visibility
 * is driven by the wrapper's hover state so the popup stays open while the
 * pointer travels onto it.
 */
export const RailPreview: FC = () => {
  const player = usePlayer();
  if (!player) return null;
  const { track, trackIndex, trackCount, playing, toggle, next, prev } = player;

  return (
    <div className="invisible absolute left-full top-1/2 z-50 ml-2.5 w-[220px] -translate-y-1/2 opacity-0 transition-opacity group-hover/status:visible group-hover/status:opacity-100 group-focus-within/status:visible group-focus-within/status:opacity-100">
      <div className="flex items-center gap-3 rounded-xl bg-bg-1 p-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]">
        <div
          aria-hidden
          className={cn(
            "grid h-12 w-12 flex-none place-items-center rounded-lg text-xl",
            TINT_TILE[track.tint],
          )}
        >
          {track.title[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] text-fg-0">{track.title}</div>
          <div className="truncate text-[10px] text-fg-2">
            {track.artist} · {trackIndex + 1}/{trackCount}
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              aria-label="previous track"
              onClick={prev}
              className="grid h-6 w-6 place-items-center rounded-full bg-bg-2 text-[10px] text-fg-2 hover:text-fg-0"
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label={playing ? "pause" : "play"}
              onClick={toggle}
              className="grid h-6 w-6 place-items-center rounded-full bg-amber/20 text-[10px] text-amber"
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              aria-label="next track"
              onClick={next}
              className="grid h-6 w-6 place-items-center rounded-full bg-bg-2 text-[10px] text-fg-2 hover:text-fg-0"
            >
              ⏭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Rework rail.tsx**

Full replacement:

```tsx
// src/features/portfolio/components/wm/rail.tsx
"use client";

import type { FC } from "react";

import { APP_GLYPHS } from "@/src/features/portfolio/components/wm/app-glyphs";
import { RailPreview } from "@/src/features/portfolio/components/wm/rail-preview";
import { CONTENT_APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";
import { workspaceAppIds } from "@/src/features/portfolio/lib/wm/workspace-apps";
import { WORKSPACE_IDS } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { usePlayer } from "@/src/features/portfolio/providers/player-context";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  /** True while the leader chord is armed — shows the leader chip. */
  armed: boolean;
  onOpenPalette: () => void;
}

/** `thu 29 may · 21:40` → ["21", "40"]; placeholder-safe. */
const stampTime = (stamp: string): [string, string] => {
  const time = stamp.split("·")[1]?.trim() ?? "--:--";
  const [h = "--", m = "--"] = time.split(":");
  return [h, m];
};

const capsuleClass =
  "flex w-[38px] flex-col items-center gap-1 rounded-full bg-bg-2/70 py-2";

export const Rail: FC<Props> = ({ armed, onOpenPalette }) => {
  const { state, switchWorkspace, openApp } = useWorkspace();
  const player = usePlayer();
  const stamp = useDeskStamp();
  const [hh, mm] = stampTime(stamp);
  const focusedAppId = state.focused ? state.instances[state.focused] : null;
  const activeApps = workspaceAppIds(state, state.active);
  const playlistOpen = Object.values(state.instances).includes("playlist");
  const showStatus = player !== null && (playlistOpen || player.playing);

  return (
    <nav
      aria-label="navigation rail"
      className="z-40 flex w-[56px] flex-none flex-col items-center gap-2 py-3 font-mono"
    >
      <div className={capsuleClass}>
        <span aria-hidden className="text-[15px] text-amber">
          ✦
        </span>
        {WORKSPACE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={`workspace ${id}`}
            onClick={() => switchWorkspace(id)}
            className={cn(
              "grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] transition-colors",
              state.active === id
                ? "bg-amber/15 text-amber"
                : "text-fg-3 hover:bg-fg-4/20 hover:text-fg-1",
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className={capsuleClass}>
        {CONTENT_APPS.map((app) => {
          const isOpen = activeApps.includes(app.id);
          const isFocused = focusedAppId === app.id;
          return (
            <button
              key={app.id}
              type="button"
              aria-label={app.label}
              onClick={() => openApp(app.id)}
              className={cn(
                "group relative flex h-9 w-8 flex-col items-center justify-center rounded-full transition-colors",
                isFocused
                  ? "bg-amber/15 text-amber"
                  : "text-fg-3 hover:bg-fg-4/20 hover:text-fg-1",
              )}
            >
              {APP_GLYPHS[app.id]}
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 h-1 w-1 rounded-full transition-colors",
                  isOpen ? (isFocused ? "bg-amber" : "bg-fg-3") : "bg-transparent",
                )}
              />
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {app.title}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          aria-label="search"
          onClick={onOpenPalette}
          className="grid h-8 w-8 place-items-center rounded-full text-[13px] text-fg-3 transition-colors hover:bg-fg-4/20 hover:text-fg-1"
        >
          ›_
        </button>
      </div>

      {player && showStatus && (
        <div className="group/status relative flex min-h-0 flex-1 justify-center">
          <button
            type="button"
            aria-label="now playing"
            onClick={player.toggle}
            className="max-h-full truncate text-[9.5px] text-fg-2 transition-colors [writing-mode:vertical-rl] hover:text-fg-0"
          >
            ({player.playing ? "playing" : "paused"}) {player.track.title} —{" "}
            {player.track.artist}
          </button>
          <RailPreview />
        </div>
      )}
      {!(player && showStatus) && <span className="flex-1" />}

      <div className={capsuleClass}>
        {armed && (
          <span className="text-[9px] uppercase tracking-[0.08em] text-amber">
            ldr
          </span>
        )}
        <div
          aria-label="clock"
          className="text-center text-[11.5px] leading-[1.5] text-fg-1 tabular-nums"
        >
          <span className="block">{hh}</span>
          <span className="block">{mm}</span>
        </div>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-amber"
          title={portfolioContent.user.handle}
        />
      </div>
    </nav>
  );
};
```

Notes: width 52→56px; handle text replaced by the amber dot (capsule too narrow for text) with the handle as `title`; leader chip abbreviated to fit the capsule.

- [ ] **Step 3: Verify**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: clean.

---

### Task 9: Chrome integration — AnimatePresence, quick menu + edge handle styling

**Files:**
- Modify: `src/features/portfolio/components/wm/desktop-chrome.tsx`
- Modify: `src/features/portfolio/components/wm/quick-menu.tsx`
- Modify: `src/features/portfolio/components/wm/edge-handle.tsx`
- Modify: `src/features/portfolio/components/wm/dashboard.tsx` (remove legacy `open` prop)
- Modify: `src/features/portfolio/components/wm/palette.tsx` (desktop no longer passes `open`; keep prop for mobile — make it optional, default true)

**Interfaces:**
- Consumes: everything above.
- Produces: final composition. `Dashboard: FC<{ onClose: () => void }>`, `QuickMenu: FC<{ onClose: () => void; onOpenKeymap: () => void }>`, `Palette: FC<{ open?: boolean; ... }>` (mobile tab bar keeps passing `open`).

- [ ] **Step 1: Rework quick-menu.tsx**

Full replacement:

```tsx
// src/features/portfolio/components/wm/quick-menu.tsx
"use client";

import type { FC, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ShellCorner } from "@/src/features/portfolio/components/wm/shell-corner";
import { shellSpring } from "@/src/features/portfolio/lib/wm/transitions";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

interface Props {
  onClose: () => void;
  onOpenKeymap: () => void;
}

const itemClass =
  "group relative grid h-9 w-9 place-items-center rounded-full text-[14px] text-fg-2 transition-colors hover:bg-bg-3 hover:text-fg-0";

const Tip: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
);

export const QuickMenu: FC<Props> = ({ onClose, onOpenKeymap }) => {
  const reduced = useReducedMotion();
  const transition = reduced ? { duration: 0 } : shellSpring;

  return (
    <motion.section
      aria-label="quick menu"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={transition}
      style={{ y: "-50%" }}
      className="absolute right-0 top-1/2 z-40 w-[52px]"
    >
      <ShellCorner notch="tl" className="absolute bottom-full right-0" />
      <ShellCorner notch="bl" className="absolute top-full right-0" />
      <div className="flex flex-col items-center gap-1.5 rounded-l-2xl bg-bg-1 py-3 shadow-[-16px_0_40px_-20px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          aria-label="keybinds"
          onClick={() => {
            onOpenKeymap();
            onClose();
          }}
          className={itemClass}
        >
          ⌨<Tip>keybinds — ` ?</Tip>
        </button>
        <span aria-hidden className="my-1 w-[18px] border-t border-fg-4" />
        <a
          href="https://github.com/Dawaad"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="github"
          className={itemClass}
        >
          gh<Tip>github</Tip>
        </a>
        <a
          href="https://linkedin.com/in/ibuildshitgood"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="linkedin"
          className={itemClass}
        >
          in<Tip>linkedin — résumé</Tip>
        </a>
        <a
          href={`mailto:${portfolioContent.contact.email}`}
          aria-label="email"
          className={itemClass}
        >
          @<Tip>{portfolioContent.contact.email}</Tip>
        </a>
      </div>
    </motion.section>
  );
};
```

(Same `style={{ y: "-50%" }}` trick — the vertical centering must live in motion's transform, not a class.)

- [ ] **Step 2: Soften edge handles**

In `edge-handle.tsx`, change the button's base classes from
`"group absolute z-30 grid place-items-center border border-fg-4/60 bg-bg-1"` to
`"group absolute z-30 grid place-items-center bg-bg-1"` — the handle is a nub of shell skin, not a bordered chip. Everything else stays.

- [ ] **Step 3: Wire AnimatePresence in desktop-chrome.tsx**

- Import `AnimatePresence` from `"motion/react"`.
- Replace the overlay render block:

```tsx
<AnimatePresence>
  {overlay === "dash" && (
    <Dashboard key="dash" onClose={() => setOverlay(null)} />
  )}
  {overlay === "quick" && (
    <QuickMenu
      key="quick"
      onClose={() => setOverlay(null)}
      onOpenKeymap={() => setKeymapOpen(true)}
    />
  )}
</AnimatePresence>
```

- And for the palette (outside the wall wrapper, where it is now):

```tsx
<AnimatePresence>
  {overlay === "palette" && (
    <Palette
      key="palette"
      onClose={() => setOverlay(null)}
      appearance={appearance}
    />
  )}
</AnimatePresence>
```

- Delete the `key={`palette-${...}`}` remount hack — conditional mount inside `AnimatePresence` gives a fresh mount per open cycle, so the focus-on-mount effect still runs. Leave `KeymapPanel` as is.

- [ ] **Step 4: Drop legacy open props**

- `dashboard.tsx`: remove `open` from `Props` and the `if (!open) return null;` line (with its default). Component is only mounted when open now.
- `palette.tsx`: make `open` optional with default `true` (`open = true` in destructuring) and keep the `if (!open) return null;` guard — the mobile tab bar still passes `open`. Verify with `grep -rn "Palette" src/features/portfolio/components/wm/mobile-tab-bar.tsx` that its usage still typechecks.
- `quick-menu.tsx` already lost `open` in Step 1.

- [ ] **Step 5: Verify**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: clean.

---

### Task 10: Playlist panel wiring

**Files:**
- Modify: `src/features/portfolio/components/background/playlist-panel.tsx`

**Interfaces:**
- Consumes: `usePlayer` (Task 4).
- Produces: nothing new — footer mirrors live player state, static fallback outside the provider.

- [ ] **Step 1: Wire the now-playing footer**

Add `"use client";` at the top. Import `usePlayer`. Inside the component:

```tsx
const player = usePlayer();
```

Replace the hardcoded footer block (the two `flex justify-between` rows) with:

```tsx
<div className="mt-1.5 border-t border-fg-4 pt-1 text-fg-3">
  <div className="flex justify-between text-fg-1">
    <span>
      {player
        ? `${player.track.artist} — ${player.track.album} — ${player.trackIndex + 1}. ${player.track.title}`
        : "TOOL — Ænima — 1. Eulogy"}
    </span>
    <span className="text-fg-3">1996</span>
  </div>
  <div className="flex justify-between text-amber-dim">
    <span>
      {player?.playing ? "▶" : "⏸"} 00:00 / {player?.track.length ?? "08:27"} — 00:00
    </span>
    <span>all from library | C</span>
  </div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm test -- src/features/portfolio/components/background && npx tsc --noEmit`
Expected: existing background-panel tests still pass (playlist has none; faux-terminal snapshot unaffected).

---

### Task 11: Full verification + visual pass

**Files:** none (verification only)

- [ ] **Step 1: Full suite**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all clean.

- [ ] **Step 2: Visual pass on dev server**

Run `npm run dev`, open `http://localhost:3000` at ≥1024px width. Check:

1. **Dashboard**: top handle click → panel springs down; corner caps curve into the top gutter with no seams (if a cap's curve points the wrong way, swap its `notch` value); four tabs; pill slides between tabs; panel height animates between tab bodies; media controls change track; performance bars wander.
2. **Palette**: `/` opens with spring; `>theme` shows swatch strip and switches scheme; `>wallpaper` shows thumbnails; height morphs between rows/strips; bottom caps seamless.
3. **Rail**: capsule clusters render; opening apps shows dots (amber on focused); open playlist decor app (via `>` … or workspace with playlist) → vertical now-playing appears; hover → preview popup; controls work; dashboard media tab reflects the same state.
4. **Quick menu**: right handle → slides in with caps.
5. **Schemes**: cycle beige/mono/moonlit via `>theme` — beige is warm rosewater with visible surface tiers, no navy chrome anywhere; ascii panels still legible.
6. **Reduced motion**: toggle OS reduce-motion (or DevTools emulation) → no springs, instant swaps.

Report any visual defect back rather than silently patching unrelated code.
