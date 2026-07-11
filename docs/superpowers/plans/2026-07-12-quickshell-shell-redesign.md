# Quickshell Shell Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top-bar shell with a Quickshell-style layered shell — left rail on a base frame, wallpaper inset as a "wall", and three edge-pull overlays (top dashboard, right quick menu, bottom rofi search palette with `>scheme` / `>wallpaper` actions) — plus rounded/gapped/dimmed window chrome.

**Architecture:** One base "shell" surface (solid `bg-1`) hosts the rail and frames an inset rounded "wall" (wallpaper + tiling field). Three overlays slide out of the wall's edges, toggled by handles cut from the frame. All shell state is one `overlay` union in `DesktopChrome`; the workspace reducer, keyboard layer, and mosaic geometry are untouched. `TopBar`, `ThemePanel`, and `Launcher` are deleted; their capabilities move to the rail, the quick menu, and the palette.

**Tech Stack:** Next.js 16 (app dir), React 19, Tailwind v4 (`@theme inline` tokens in `app/globals.css`), Vitest + Testing Library, Playwright. Fonts via `next/font` + the `geist` npm package.

**Reference mock:** `claude.ai/code/artifact/11d13356-f437-4970-82df-a4c720700290` (v3 "shell-layer-pulls"). Visual reference: Rexcrazy804's Quickshell rice.

## Global Constraints

- **NO commits.** The user's git workflow leaves all changes unstaged for review. Every task ends at verification, never at `git commit`. (This overrides the usual plan-skill commit steps.)
- **No new UI libraries.** shadcn/Radix/cmdk are deliberately NOT added — the repo has a hand-rolled Tailwind design system with runtime scheme vars, and every needed behavior (translate transitions, tab state, filter list) already exists in-repo or is a few lines. If the user later insists on shadcn, that's a separate migration.
- React conventions (from AGENTS.md): `const` components, one component per file, local `interface Props`, `FC<Props>` declarations.
- Import alias style: `@/src/...` (match existing files exactly).
- All new visible shell text is lowercase mono chrome except description lines, which use the new `font-sans` utility.
- Color only through scheme tokens (`bg-*`, `fg-*`, `amber`, `red`…) — never hex in components.
- Test commands: `pnpm vitest run <path>` (unit), `pnpm test:e2e` (Playwright), `pnpm lint`, `pnpm build`.
- Existing keyboard layer (`use-wm-keys.ts`, leader chords) must keep working unchanged; `KeymapActionId` values must not change (persisted in localStorage under `portfolio:keymap`).

## File Structure

```
Create:
  src/features/portfolio/components/wm/rail.tsx            # left nav rail on the shell frame
  src/features/portfolio/components/wm/rail.test.tsx
  src/features/portfolio/components/wm/edge-handle.tsx      # shared frame-edge handle button
  src/features/portfolio/components/wm/palette.tsx          # bottom rofi search (replaces launcher.tsx)
  src/features/portfolio/components/wm/quick-menu.tsx       # right pull: keybinds, github, linkedin, email
  src/features/portfolio/components/wm/quick-menu.test.tsx
  src/features/portfolio/components/wm/dashboard.tsx        # top pull: tabbed identity/now/workspaces
  src/features/portfolio/components/wm/dashboard.test.tsx
  src/features/portfolio/lib/wm/palette-items.ts            # pure item builder (search + > actions)
  src/features/portfolio/lib/wm/palette-items.test.ts

Modify:
  package.json                                              # add geist
  app/layout.tsx                                            # GeistSans variable
  app/globals.css                                           # --font-sans token, .wm-grain, .wm-wall
  src/features/portfolio/components/wm/desktop-chrome.tsx   # shell layout + overlay state
  src/features/portfolio/components/portfolio-shell.tsx     # seed: entry app only (no clock/fetch)
  src/features/portfolio/components/wm/desktop.tsx          # window chrome: rounding, gaps, dim
  src/features/portfolio/components/wm/window-frame.tsx     # border moves to unified frame
  src/features/portfolio/lib/config/keymap.config.ts        # 'launcher' action copy → search
  e2e/workspace-desktop.spec.ts                             # keys via quick menu
  e2e/wallpaper.spec.ts                                     # wallpaper switch via palette

Delete:
  src/features/portfolio/components/wm/top-bar.tsx
  src/features/portfolio/components/wm/theme-panel.tsx
  src/features/portfolio/components/wm/launcher.tsx
```

Task order is chosen so the app builds and e2e stays meaningful after every task: foundation → palette (replaces launcher while TopBar still exists) → rail/quick/dashboard built unmounted → one mount-and-delete task → window chrome → final verification.

---

### Task 1: Foundation — sans font token + shell CSS utilities

**Files:**
- Modify: `package.json`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: Tailwind `font-sans` utility (Geist), CSS classes `.wm-grain` (film-grain overlay) and `.wm-wall` (inset wall surface) used by Tasks 5–6.

- [ ] **Step 1: Install geist**

Run: `pnpm add geist`
Expected: `geist` appears in `package.json` dependencies.

- [ ] **Step 2: Register the sans variable in the root layout**

In `app/layout.tsx`, add the import and extend the `<html>` className (JetBrains Mono block stays as is):

```tsx
import { GeistSans } from "geist/font/sans";
```

```tsx
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${GeistSans.variable}`}
      suppressHydrationWarning
    >
```

- [ ] **Step 3: Add the font token and shell utilities to globals.css**

In `app/globals.css`, inside the existing `@theme inline` block (after the `--font-mono` entry), add:

```css
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
```

At the end of the file, add:

```css
/* ============ SHELL LAYER ============
   The Quickshell-style shell: a solid base frame that hosts the rail and the
   edge-pull overlays, with the wallpaper "wall" inset into it. Film grain
   replaces the old CRT scanlines — 2025 rice, not 1985 terminal. */
.wm-wall {
  background: radial-gradient(ellipse at center, var(--bg-1) 0%, var(--bg-0) 80%);
}

.wm-grain {
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
}
```

- [ ] **Step 4: Verify build and lint**

Run: `pnpm build && pnpm lint`
Expected: both pass. Leave changes unstaged.

---

### Task 2: Palette — rofi search with `>scheme` / `>wallpaper` actions (replaces Launcher)

The palette is the bottom pull: results stack **above** the input, wallpaper action shows a horizontal thumbnail strip (per the reference screenshots). It replaces `launcher.tsx` while the TopBar still exists — the TopBar "apps" button and the `leader → space` chord both open it, plus a new global `/` opener.

**Files:**
- Create: `src/features/portfolio/lib/wm/palette-items.ts`
- Create: `src/features/portfolio/lib/wm/palette-items.test.ts`
- Create: `src/features/portfolio/components/wm/palette.tsx`
- Modify: `src/features/portfolio/components/wm/desktop-chrome.tsx`
- Modify: `src/features/portfolio/lib/config/keymap.config.ts:73-78`
- Modify: `e2e/wallpaper.spec.ts`
- Delete: `src/features/portfolio/components/wm/launcher.tsx`

**Interfaces:**
- Consumes: `useWorkspace().openApp(appId)`, `useAppearance` setters via the `AppearanceState` prop already passed to `DesktopChrome`, `POSTS` from `@/src/content/portfolio/posts-client`, `SCHEMES`, `WALLPAPERS`, `cdnImageLoader`.
- Produces: `buildPaletteItems(query, deps): PaletteItem[]` and `<Palette open onClose appearance />`. Task 6 re-anchors nothing — the palette is already bottom-anchored and keyed-remounted here.

- [ ] **Step 1: Write the failing test for the item builder**

Create `src/features/portfolio/lib/wm/palette-items.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import {
  buildPaletteItems,
  type PaletteDeps,
} from "@/src/features/portfolio/lib/wm/palette-items";

const deps = (): PaletteDeps => ({
  openApp: vi.fn(),
  openPost: vi.fn(),
  setScheme: vi.fn(),
  setWallpaperId: vi.fn(),
});

describe("buildPaletteItems", () => {
  it("empty query lists every app and no posts", () => {
    const items = buildPaletteItems("", deps());
    expect(items.every((i) => i.kind === "app")).toBe(true);
    expect(items.map((i) => i.label)).toContain("about");
    expect(items).toHaveLength(12);
  });

  it("a text query matches apps and post titles", () => {
    const items = buildPaletteItems("keyboards", deps());
    expect(items.some((i) => i.kind === "post")).toBe(true);
    expect(items.map((i) => i.label)).toContain(
      "Designing for keyboards first",
    );
  });

  it("running a post item opens the posts app at the post route", () => {
    const d = deps();
    const post = buildPaletteItems("keyboards", d).find(
      (i) => i.kind === "post",
    )!;
    post.run();
    expect(d.openPost).toHaveBeenCalledWith("designing-for-keyboards-first");
  });

  it("'>' lists scheme and wallpaper actions", () => {
    const items = buildPaletteItems(">", deps());
    expect(items.some((i) => i.kind === "scheme")).toBe(true);
    expect(items.some((i) => i.kind === "wallpaper")).toBe(true);
  });

  it("'>wallpaper' narrows to wallpapers and carries thumbnails", () => {
    const items = buildPaletteItems(">wallpaper", deps());
    expect(items.every((i) => i.kind === "wallpaper")).toBe(true);
    const mono = items.find((i) => i.label === "mono")!;
    expect(mono.thumbSrc).toBe("bg/mono/original-640.webp");
  });

  it("'>scheme mo' filters schemes and running one applies it", () => {
    const d = deps();
    const items = buildPaletteItems(">scheme mo", d);
    expect(items.map((i) => i.label)).toEqual(["mono", "moonlit"]);
    items[0].run();
    expect(d.setScheme).toHaveBeenCalledWith("mono");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/features/portfolio/lib/wm/palette-items.test.ts`
Expected: FAIL — module `palette-items` not found.

- [ ] **Step 3: Implement the item builder**

Create `src/features/portfolio/lib/wm/palette-items.ts`:

```ts
import { APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { SCHEMES } from "@/src/features/portfolio/lib/config/schemes";
import { WALLPAPERS } from "@/src/features/portfolio/lib/config/wallpapers";
import { POSTS } from "@/src/content/portfolio/posts-client";
import type { SchemeName } from "@/src/shared/types/portfolio";

export interface PaletteDeps {
  openApp: (appId: string) => void;
  openPost: (slug: string) => void;
  setScheme: (s: SchemeName) => void;
  setWallpaperId: (id: string) => void;
}

export interface PaletteItem {
  key: string;
  kind: "app" | "post" | "scheme" | "wallpaper";
  label: string;
  hint: string;
  /** CDN-relative preview path for wallpaper items (null → flat swatch). */
  thumbSrc?: string | null;
  run: () => void;
}

const matches = (needle: string, ...hay: string[]): boolean =>
  hay.join(" ").toLowerCase().includes(needle);

/**
 * Rofi-style item model. Plain queries search apps and posts (empty query =
 * apps only, so the default view is the launcher). A leading ">" enters
 * action mode: schemes and wallpapers, narrowed by the rest of the query —
 * ">wallpaper" shows the thumbnail strip, ">scheme mo" filters schemes.
 */
export const buildPaletteItems = (
  query: string,
  deps: PaletteDeps,
): PaletteItem[] => {
  const q = query.trim().toLowerCase();

  if (q.startsWith(">")) {
    const cmd = q.slice(1).trim();
    const schemes: PaletteItem[] = SCHEMES.map((s) => ({
      key: `scheme-${s}`,
      kind: "scheme",
      label: s,
      hint: "scheme",
      run: () => deps.setScheme(s),
    }));
    const walls: PaletteItem[] = WALLPAPERS.map((w) => ({
      key: `wallpaper-${w.id}`,
      kind: "wallpaper",
      label: w.label,
      hint: "wallpaper",
      thumbSrc: w.image ? w.image.webp[0].src : null,
      run: () => deps.setWallpaperId(w.id),
    }));
    return [...schemes, ...walls].filter((i) =>
      matches(cmd, i.hint, i.label),
    );
  }

  const apps: PaletteItem[] = APPS.map((a) => ({
    key: `app-${a.id}`,
    kind: "app",
    label: a.label,
    hint: a.id,
    run: () => deps.openApp(a.id),
  }));
  if (q === "") return apps;

  const posts: PaletteItem[] = POSTS.map((p) => ({
    key: `post-${p.slug}`,
    kind: "post",
    label: p.title,
    hint: p.tag,
    run: () => deps.openPost(p.slug),
  }));
  return [
    ...apps.filter((i) => matches(q, i.label, i.hint)),
    ...posts.filter((i) => matches(q, i.label, i.hint)),
  ];
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/features/portfolio/lib/wm/palette-items.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Create the Palette component**

Create `src/features/portfolio/components/wm/palette.tsx`. Results render above the input (input pinned to the bottom edge of the panel); wallpaper mode renders a horizontal thumbnail strip; the panel is anchored to the bottom of the viewport with rounded top corners (shell material — solid `bg-1`, not glass):

```tsx
"use client";

import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  buildPaletteItems,
  type PaletteItem,
} from "@/src/features/portfolio/lib/wm/palette-items";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { cdnImageLoader } from "@/src/shared/lib/cdn-image-loader";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  appearance: AppearanceState;
}

export const Palette: FC<Props> = ({ open, onClose, appearance }) => {
  const { openApp } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(
    () =>
      buildPaletteItems(query, {
        openApp,
        openPost: (slug) => {
          openApp("posts");
          router.push(`/posts/${slug}`);
        },
        setScheme: appearance.setScheme,
        setWallpaperId: appearance.setWallpaperId,
      }),
    [query, openApp, router, appearance.setScheme, appearance.setWallpaperId],
  );

  // Wallpaper actions render as a thumbnail strip instead of rows.
  const stripMode = items.length > 0 && items.every((i) => i.kind === "wallpaper");

  // Focus on mount — the parent remounts this component per open cycle.
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onMouseDown={onClose}
    >
      <div
        className="w-[560px] max-w-[88%] overflow-hidden rounded-t-xl border border-b-0 border-fg-4 bg-bg-1 shadow-[0_-18px_48px_-20px_rgba(0,0,0,0.75)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {stripMode ? (
          <div className="flex gap-2 overflow-x-auto border-b border-fg-4/60 p-3">
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                onMouseDown={() => run(item)}
                className={cn(
                  "flex flex-none flex-col items-center gap-1 rounded-md border p-1.5 text-[10px]",
                  i === highlight
                    ? "border-amber/70 text-fg-0"
                    : "border-fg-4 text-fg-2 hover:border-fg-3",
                )}
              >
                {item.thumbSrc ? (
                  <Image
                    loader={cdnImageLoader}
                    src={item.thumbSrc}
                    alt=""
                    width={120}
                    height={75}
                    className="h-[75px] w-[120px] rounded-sm object-cover"
                  />
                ) : (
                  <span className="flex h-[75px] w-[120px] items-center justify-center rounded-sm bg-bg-2 text-fg-3">
                    flat
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto border-b border-fg-4/60 py-1">
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                onMouseDown={() => run(item)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left text-[13px]",
                  i === highlight
                    ? "bg-bg-2 text-fg-0"
                    : "text-fg-2 hover:bg-bg-2/60",
                )}
              >
                <span className="w-14 flex-none text-[10px] text-fg-3">
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
    </div>
  );
};
```

- [ ] **Step 6: Swap Launcher → Palette in DesktopChrome and add the `/` opener**

In `src/features/portfolio/components/wm/desktop-chrome.tsx`:

Replace the Launcher import with:

```tsx
import { Palette } from "@/src/features/portfolio/components/wm/palette";
```

Add `useEffect` to the react import. Then add a global `/` listener after the `useWmKeys` call (leaves typing in inputs alone — the same guard style as `use-wm-keys.ts:160`):

```tsx
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
```

Replace the `<Launcher …/>` element with:

```tsx
        <Palette
          key={`palette-${launcherOpen ? 1 : 0}`}
          open={launcherOpen}
          onClose={() => setLauncherOpen(false)}
          appearance={appearance}
        />
```

(`launcherOpen` state and the `useWmKeys` `toggleLauncher` wiring stay exactly as they are — the leader→space chord now opens the palette. The state is renamed to `overlay` in Task 6.)

- [ ] **Step 7: Delete launcher.tsx and update the keymap copy**

Delete `src/features/portfolio/components/wm/launcher.tsx`.

In `src/features/portfolio/lib/config/keymap.config.ts`, update the `launcher` action (id stays `"launcher"` — it's persisted in users' localStorage):

```ts
  {
    id: "launcher",
    label: "Search",
    description: "Open the search palette",
    default: { leader: true, key: " " },
  },
```

- [ ] **Step 8: Update the wallpaper e2e spec to the palette flow**

In `e2e/wallpaper.spec.ts`, replace the two theme-panel interactions (lines 40-57, the `getByRole("button", { name: /theme/i })` blocks) with palette interactions:

```ts
    // Open the search palette and pick the 'none' wallpaper (no image).
    await page.keyboard.press("/");
    await page.getByRole("textbox", { name: "search" }).fill(">wallpaper");
    await page.getByRole("button", { name: "none" }).click();

    // Allow a tick for any lazy loads that should NOT fire.
    await page.waitForTimeout(600);
    expect(
      requested.length,
      "switching to none must not fetch any new bg assets",
    ).toBe(moonlitCount);

    // Reopen and pick the 'mono' wallpaper — action mode lists wallpapers only,
    // so the label is unambiguous (no scheme buttons in the strip).
    await page.keyboard.press("/");
    await page.getByRole("textbox", { name: "search" }).fill(">wallpaper");
    await page.getByRole("button", { name: "mono" }).click();
```

Note: the wallpaper thumbnails themselves request `/bg/**` assets through the image loader, so the "no new fetches for none" count assertion must move ABOVE the palette-open that shows thumbnails — reorder so the count snapshot happens before pressing `/`, and change the assertion to compare only non-thumbnail paths. Simplest robust form: filter thumbnail requests out by width, since thumbnails always use the 640 ladder entry via the loader while the full-bleed picks larger widths at this viewport:

```ts
    const nonThumb = () =>
      requested.filter((p) => !p.includes("-640.webp")).length;
```

Snapshot `const before = nonThumb();` before pressing `/`, and assert `expect(nonThumb()).toBe(before)` after picking `none`. Keep the existing `/bg/mono/` poll and the moonlit re-fetch assertion using `nonThumb()`-style filtering as well.

- [ ] **Step 9: Verify**

Run: `pnpm vitest run` then `pnpm test:e2e`
Expected: all unit tests pass; `wallpaper.spec.ts` and `workspace-desktop.spec.ts` pass (the workspace spec's "apps"/"posts"/keys flows are unchanged — TopBar still exists).

Run: `pnpm lint`
Expected: pass (no unused imports left from the Launcher removal). Leave changes unstaged.

---

### Task 3: Rail component (built unmounted)

**Files:**
- Create: `src/features/portfolio/components/wm/rail.tsx`
- Create: `src/features/portfolio/components/wm/rail.test.tsx`

**Interfaces:**
- Consumes: `useWorkspace()` (`state`, `switchWorkspace`, `openApp`), `useDeskStamp()`, `CONTENT_APPS`, `WORKSPACE_IDS`, `portfolioContent.user.handle`.
- Produces: `<Rail armed onOpenPalette />` — mounted by Task 6. Content-app buttons carry `aria-label={app.label}` so the existing e2e `getByRole("button", { name: "posts" })` keeps matching after TopBar is deleted.

- [ ] **Step 1: Write the failing test**

Create `src/features/portfolio/components/wm/rail.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rail } from "@/src/features/portfolio/components/wm/rail";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const seed: WorkspaceSeed = {
  workspace: 1,
  instances: [{ id: "about", appId: "about" }],
  layout: "about",
};

const renderRail = () =>
  render(
    <WorkspaceProvider seed={seed}>
      <Rail armed={false} onOpenPalette={vi.fn()} />
    </WorkspaceProvider>,
  );

describe("Rail", () => {
  it("renders a button per workspace and per content app", () => {
    renderRail();
    for (const id of [1, 2, 3, 4]) {
      expect(
        screen.getByRole("button", { name: `workspace ${id}` }),
      ).toBeInTheDocument();
    }
    for (const label of ["about", "posts", "experience", "contact"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("clicking a content app opens it (navigates to its route)", async () => {
    renderRail();
    await userEvent.click(screen.getByRole("button", { name: "posts" }));
    expect(push).toHaveBeenCalledWith("/posts");
  });

  it("shows the leader chip only when armed", () => {
    const { rerender } = renderRail();
    expect(screen.queryByText("leader")).not.toBeInTheDocument();
    rerender(
      <WorkspaceProvider seed={seed}>
        <Rail armed onOpenPalette={vi.fn()} />
      </WorkspaceProvider>,
    );
    expect(screen.getByText("leader")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/features/portfolio/components/wm/rail.test.tsx`
Expected: FAIL — `rail` module not found.

- [ ] **Step 3: Implement the Rail**

Create `src/features/portfolio/components/wm/rail.tsx`. Notes: sits directly on the shell surface (no own background); app icons reuse the existing `/icons/*.svg` assets from `apps.config.ts`; the active content app is derived from the focused instance; clock reuses `useDeskStamp()` and shows only its `hh:mm` tail, stacked; the armed leader chip replaces the old TopBar indicator; tooltips are pure-CSS flyouts (`group-hover`), matching the mock.

```tsx
"use client";

import type { FC } from "react";

import { CONTENT_APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";
import { WORKSPACE_IDS } from "@/src/features/portfolio/lib/wm/workspace-reducer";
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

export const Rail: FC<Props> = ({ armed, onOpenPalette }) => {
  const { state, switchWorkspace, openApp } = useWorkspace();
  const stamp = useDeskStamp();
  const [hh, mm] = stampTime(stamp);
  const focusedAppId = state.focused ? state.instances[state.focused] : null;

  return (
    <nav
      aria-label="navigation rail"
      className="z-40 flex w-[52px] flex-none flex-col items-center gap-1.5 py-3 font-mono"
    >
      <span aria-hidden className="mb-1 text-[15px] text-amber">
        ✦
      </span>

      {WORKSPACE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-label={`workspace ${id}`}
          onClick={() => switchWorkspace(id)}
          className={cn(
            "grid h-[26px] w-[26px] place-items-center rounded-lg text-[11px] transition-colors",
            state.active === id
              ? "bg-amber/15 text-amber"
              : "text-fg-3 hover:bg-fg-4/20 hover:text-fg-1",
          )}
        >
          {id}
        </button>
      ))}

      <span aria-hidden className="my-1.5 w-[18px] border-t border-fg-4" />

      {CONTENT_APPS.map((app) => (
        <button
          key={app.id}
          type="button"
          aria-label={app.label}
          onClick={() => openApp(app.id)}
          className={cn(
            "group relative grid h-8 w-8 place-items-center rounded-lg transition-colors",
            focusedAppId === app.id
              ? "bg-amber/15"
              : "hover:bg-fg-4/20",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local svg glyph */}
          <img src={app.icon} alt="" className="h-4 w-4 opacity-80" />
          <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {app.title}
          </span>
        </button>
      ))}

      <button
        type="button"
        aria-label="search"
        onClick={onOpenPalette}
        className="mt-1.5 grid h-8 w-8 place-items-center rounded-lg text-[13px] text-fg-3 transition-colors hover:bg-fg-4/20 hover:text-fg-1"
      >
        ›_
      </button>

      <span className="flex-1" />

      {armed && (
        <span className="text-[9px] uppercase tracking-[0.08em] text-amber">
          leader
        </span>
      )}
      <div
        aria-label="clock"
        className="my-1 text-center text-[11.5px] leading-[1.5] text-fg-1 tabular-nums"
      >
        <span className="block">{hh}</span>
        <span className="block">{mm}</span>
      </div>
      <span className="flex items-center gap-1 text-[9px] text-fg-3">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
        {portfolioContent.user.handle}
      </span>
    </nav>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/features/portfolio/components/wm/rail.test.tsx`
Expected: PASS (3 tests). Leave changes unstaged.

---

### Task 4: Quick menu component (built unmounted)

**Files:**
- Create: `src/features/portfolio/components/wm/quick-menu.tsx`
- Create: `src/features/portfolio/components/wm/quick-menu.test.tsx`

**Interfaces:**
- Consumes: `portfolioContent.contact.email`.
- Produces: `<QuickMenu open onClose onOpenKeymap />` — an absolutely-positioned right pull; Task 6 mounts it inside the viewport (which is `position: relative`).

- [ ] **Step 1: Write the failing test**

Create `src/features/portfolio/components/wm/quick-menu.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuickMenu } from "@/src/features/portfolio/components/wm/quick-menu";

describe("QuickMenu", () => {
  it("renders nothing while closed", () => {
    render(<QuickMenu open={false} onClose={vi.fn()} onOpenKeymap={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "keybinds" })).toBeNull();
  });

  it("opens the keymap panel and closes itself", async () => {
    const onClose = vi.fn();
    const onOpenKeymap = vi.fn();
    render(<QuickMenu open onClose={onClose} onOpenKeymap={onOpenKeymap} />);
    await userEvent.click(screen.getByRole("button", { name: "keybinds" }));
    expect(onOpenKeymap).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("links github, linkedin, and email", () => {
    render(<QuickMenu open onClose={vi.fn()} onOpenKeymap={vi.fn()} />);
    expect(screen.getByRole("link", { name: "github" })).toHaveAttribute(
      "href",
      "https://github.com/Dawaad",
    );
    expect(screen.getByRole("link", { name: "linkedin" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/ibuildshitgood",
    );
    expect(screen.getByRole("link", { name: "email" })).toHaveAttribute(
      "href",
      "mailto:jared@rmr.studio",
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/features/portfolio/components/wm/quick-menu.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the QuickMenu**

Create `src/features/portfolio/components/wm/quick-menu.tsx`. Shell material, attached flush to the right edge with rounded left corners. Button faces are plain mono text glyphs (`⌨`, `gh`, `in`, `@`) — no icon assets, no Nerd Font PUA codepoints; tooltips fly out to the left, mirroring the rail:

```tsx
"use client";

import type { FC, ReactNode } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenKeymap: () => void;
}

const itemClass =
  "group relative grid h-9 w-9 place-items-center rounded-lg text-[14px] text-fg-2 transition-colors hover:bg-fg-4/20 hover:text-fg-0";

const Tip: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="pointer-events-none absolute right-full top-1/2 z-50 mr-2.5 -translate-y-1/2 whitespace-nowrap rounded-md border border-fg-4 bg-bg-1 px-2.5 py-1 text-[10.5px] text-fg-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
);

export const QuickMenu: FC<Props> = ({ open, onClose, onOpenKeymap }) => {
  if (!open) return null;

  return (
    <section
      aria-label="quick menu"
      className="absolute right-0 top-1/2 z-40 flex w-[52px] -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-2xl border border-r-0 border-fg-4/60 bg-bg-1 py-3 shadow-[-18px_48px_-20px_rgba(0,0,0,0.75)]"
    >
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
    </section>
  );
};
```

`Tip` is a local helper of this file's single exported component (fine under the one-component-per-file rule: it is private and renders nothing on its own).

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/features/portfolio/components/wm/quick-menu.test.tsx`
Expected: PASS (3 tests). Leave changes unstaged.

---

### Task 5: Dashboard component (built unmounted)

**Files:**
- Create: `src/features/portfolio/components/wm/dashboard.tsx`
- Create: `src/features/portfolio/components/wm/dashboard.test.tsx`

**Interfaces:**
- Consumes: `useWorkspace()` state + `switchWorkspace`, `leafRects` from `mosaic-geometry`, `APP_BY_ID`, `portfolioContent`.
- Produces: `<Dashboard open onClose />` — top pull with two tabs: `dashboard` (identity + now cards) and `workspaces` (occupancy previews that switch on click). Mounted by Task 6.

- [ ] **Step 1: Write the failing test**

Create `src/features/portfolio/components/wm/dashboard.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dashboard } from "@/src/features/portfolio/components/wm/dashboard";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const seed: WorkspaceSeed = {
  workspace: 1,
  instances: [{ id: "about", appId: "about" }],
  layout: "about",
};

const renderDash = () =>
  render(
    <WorkspaceProvider seed={seed}>
      <Dashboard open onClose={vi.fn()} />
    </WorkspaceProvider>,
  );

describe("Dashboard", () => {
  it("shows the identity card on the default tab", () => {
    renderDash();
    expect(screen.getByText("jared tucker")).toBeInTheDocument();
    expect(screen.getByText(/melbourne/)).toBeInTheDocument();
  });

  it("workspaces tab lists occupancy and empty states", async () => {
    renderDash();
    await userEvent.click(screen.getByRole("tab", { name: "workspaces" }));
    // workspace 1 holds the seeded about window; 2–4 are empty
    expect(screen.getByText("about")).toBeInTheDocument();
    expect(screen.getAllByText("empty")).toHaveLength(3);
  });

  it("clicking a workspace preview switches and closes", async () => {
    const onClose = vi.fn();
    render(
      <WorkspaceProvider seed={seed}>
        <Dashboard open onClose={onClose} />
      </WorkspaceProvider>,
    );
    await userEvent.click(screen.getByRole("tab", { name: "workspaces" }));
    await userEvent.click(screen.getByRole("button", { name: "workspace 2" }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/features/portfolio/components/wm/dashboard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the Dashboard**

Create `src/features/portfolio/components/wm/dashboard.tsx`:

```tsx
"use client";

import type { FC } from "react";
import { useState } from "react";

import { APP_BY_ID, type AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { leafRects } from "@/src/features/portfolio/lib/wm/mosaic-geometry";
import {
  WORKSPACE_IDS,
  type WorkspaceId,
  type WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "dashboard" | "workspaces";

/** App labels for every window on a workspace, in tree order. */
const workspaceApps = (state: WorkspaceState, id: WorkspaceId): string[] => {
  const tree = state.layouts[id];
  if (!tree) return [];
  return [...leafRects(tree).keys()].map(
    (leaf) => APP_BY_ID[state.instances[leaf] as AppId]?.label ?? leaf,
  );
};

export const Dashboard: FC<Props> = ({ open, onClose }) => {
  const { state, switchWorkspace } = useWorkspace();
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, now } = portfolioContent;

  if (!open) return null;

  return (
    <section
      aria-label="dashboard"
      className="absolute left-1/2 top-0 z-40 w-[620px] max-w-[88%] -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-0 border-fg-4/60 bg-bg-1 shadow-[0_28px_70px_-28px_rgba(0,0,0,0.85)]"
    >
      <div role="tablist" className="flex justify-center gap-1 px-2 pt-2">
        {(["dashboard", "workspaces"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-[12px] transition-colors",
              tab === t
                ? "bg-amber/15 text-amber"
                : "text-fg-3 hover:text-fg-1",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "dashboard" ? (
        <div className="grid grid-cols-[1.2fr_1fr] gap-2.5 p-3">
          <div className="rounded-xl border border-fg-4/60 bg-bg-2/60 px-4 py-3">
            <div className="mb-2 text-[10px] tracking-[0.05em] text-amber">
              {user.handle}@fjell
            </div>
            <dl className="text-[11.5px] leading-[1.7]">
              <div className="flex gap-3">
                <dt className="w-14 flex-none text-fg-3">name</dt>
                <dd className="text-fg-1">{user.name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 flex-none text-fg-3">role</dt>
                <dd className="text-fg-1">{user.role}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 flex-none text-fg-3">based</dt>
                <dd className="text-fg-1">{user.based}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border border-fg-4/60 bg-bg-2/60 px-4 py-3">
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
      ) : (
        <div className="grid grid-cols-4 gap-2.5 p-3">
          {WORKSPACE_IDS.map((id) => {
            const apps = workspaceApps(state, id);
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
                  "relative flex aspect-[16/10] flex-col items-start gap-0.5 overflow-hidden rounded-xl border bg-bg-2/60 p-2 text-left text-[10px]",
                  current
                    ? "border-amber/60"
                    : "border-fg-4/60 hover:border-fg-3",
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
    </section>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/features/portfolio/components/wm/dashboard.test.tsx`
Expected: PASS (3 tests). Leave changes unstaged.

---

### Task 6: Mount the shell — rail, wall, handles, pulls; delete TopBar/ThemePanel

The big swap. After this task the desktop renders: shell frame (`bg-1`) → rail left → inset rounded wall (wallpaper + tiling field + grain) → three edge handles → dashboard/quick/palette pulls. CRT scanlines are gone. The seed drops the clock/fetch decor (the dashboard absorbed that content).

**Files:**
- Create: `src/features/portfolio/components/wm/edge-handle.tsx`
- Modify: `src/features/portfolio/components/wm/desktop-chrome.tsx` (full rewrite below)
- Modify: `src/features/portfolio/components/portfolio-shell.tsx:32-46`
- Delete: `src/features/portfolio/components/wm/top-bar.tsx`
- Delete: `src/features/portfolio/components/wm/theme-panel.tsx`
- Modify: `e2e/workspace-desktop.spec.ts`

**Interfaces:**
- Consumes: `Rail` (Task 3), `QuickMenu` (Task 4), `Dashboard` (Task 5), `Palette` (Task 2).
- Produces: `ShellOverlay` union type (local to desktop-chrome), `<EdgeHandle side label active onClick />`.

- [ ] **Step 1: Create the EdgeHandle**

Create `src/features/portfolio/components/wm/edge-handle.tsx`:

```tsx
"use client";

import type { FC } from "react";

import { cn } from "@/src/shared/lib/utils";

interface Props {
  side: "top" | "right" | "bottom";
  label: string;
  active: boolean;
  onClick: () => void;
}

const SIDE_CLASS: Record<Props["side"], string> = {
  top: "left-1/2 top-0 h-[15px] w-[72px] -translate-x-1/2 rounded-b-lg border-t-0",
  right:
    "right-0 top-1/2 h-[72px] w-[15px] -translate-y-1/2 rounded-l-lg border-r-0",
  bottom:
    "bottom-0 left-1/2 h-[15px] w-[72px] -translate-x-1/2 rounded-t-lg border-b-0",
};

const BAR_CLASS: Record<Props["side"], string> = {
  top: "h-1 w-8",
  right: "h-8 w-1",
  bottom: "h-1 w-8",
};

/** A pull-tab cut from the shell frame; toggles one edge overlay. */
export const EdgeHandle: FC<Props> = ({ side, label, active, onClick }) => (
  <button
    type="button"
    aria-label={label}
    aria-expanded={active}
    onClick={onClick}
    className={cn(
      "group absolute z-30 grid place-items-center border border-fg-4/60 bg-bg-1",
      SIDE_CLASS[side],
    )}
  >
    <span
      className={cn(
        "rounded-full transition-colors",
        BAR_CLASS[side],
        active ? "bg-amber" : "bg-fg-4 group-hover:bg-amber",
      )}
    />
  </button>
);
```

- [ ] **Step 2: Rewrite DesktopChrome as the shell**

Replace the full contents of `src/features/portfolio/components/wm/desktop-chrome.tsx`:

```tsx
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
    </AppearanceProvider>
  );
};
```

Note: the top/right handles sit at the wall's edge because the viewport wrapper has `py-2.5 pr-2.5` and the handles anchor to the wrapper's padding box — visually they read as tabs cut from the frame. The old CRT overlay and TopBar are gone; the pop-in/positioning of the field is unchanged (`Desktop` fills the wall).

- [ ] **Step 3: Delete TopBar and ThemePanel**

Delete `src/features/portfolio/components/wm/top-bar.tsx` and `src/features/portfolio/components/wm/theme-panel.tsx`. Run `pnpm lint` — fix any now-unused imports it reports (there should be none outside the deleted files; `useDeskStamp` is still consumed by the rail).

- [ ] **Step 4: Seed a single entry window**

In `src/features/portfolio/components/portfolio-shell.tsx`, replace `buildSeed` (lines 32-46) — the dashboard absorbed the clock/fetch decor, so the desktop opens with just the route's content window on a visible wallpaper:

```tsx
// Seed the workspace with just the route's content window — utility/decor
// content now lives in the dashboard pull, not in seeded windows.
const buildSeed = (entryAppId: string): WorkspaceSeed => ({
  workspace: 1,
  instances: [{ id: entryAppId, appId: entryAppId }],
  layout: entryAppId,
});
```

Also update the stale comment at `portfolio-shell.tsx:55` ("the TopBar only appears at lg") to reference the rail: `// react-dnd's HTML5 backend is desktop-only; the shell (rail + pulls) is lg-only.`

- [ ] **Step 5: Update the workspace e2e spec**

In `e2e/workspace-desktop.spec.ts`:

1. The "top-bar posts button opens a posts window" test (line 34): rename to `"rail posts button opens a posts window"`. The locator `page.getByRole("button", { name: "posts" })` still matches the rail's `aria-label="posts"` button — only the test name and its comment change.

2. The keybind-panel test (line 110-131): the `keys` button is gone; open via quick menu:

```ts
    // Open the panel from the quick menu (right edge pull).
    await page.getByRole("button", { name: "toggle quick menu" }).click();
    await page.getByRole("button", { name: "keybinds" }).click();
    await expect(page.getByText("keybinds", { exact: true })).toBeVisible();
```

The existing `getByText("keybinds", { exact: true })` assertion stays valid: the quick-menu button carries "keybinds" only as an `aria-label` (its text content is `⌨` + the tooltip's "keybinds — \` ?"), so the exact-text locator still uniquely matches the panel title.

3. The "leader → q twice" test counts close buttons relative to `initialCount`, and the workspace-switch tests target `~/about` — both unaffected by the seed change (fewer initial windows, same relative assertions).

- [ ] **Step 6: Verify everything**

Run: `pnpm vitest run`
Expected: all unit tests pass (rail/quick/dashboard/palette-items plus pre-existing suites).

Run: `pnpm test:e2e`
Expected: `workspace-desktop.spec.ts` and `wallpaper.spec.ts` pass.

Run: `pnpm lint && pnpm build`
Expected: pass.

Manual check: `pnpm dev`, open `http://localhost:3000` at ≥1024px width. Confirm: rail on the left with workspaces + 4 app icons; wallpaper inset with rounded corners; three handles; top pull shows dashboard tabs; right pull shows quick menu; bottom pull (and `/`) shows the palette; `>wallpaper` shows the thumbnail strip; leader chords still work (` then 2` switches workspace, ` then ?` opens keybinds). Leave changes unstaged.

---

### Task 7: Window chrome — rounding, gaps, dim-inactive

**Files:**
- Modify: `src/features/portfolio/components/wm/desktop.tsx:160-201`
- Modify: `src/features/portfolio/components/wm/window-frame.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: unified rounded window frame; the `data-leaf` wrapper, `wm-window` class, close-button `aria-label="close"`, and `span.truncate` title (all load-bearing for e2e and gestures) are preserved.

- [ ] **Step 1: Unify the window frame in desktop.tsx**

In `src/features/portfolio/components/wm/desktop.tsx`, replace the leaf JSX (the `return` inside the `leafRects` map, lines 160-201) with a version that wraps title bar + body in one rounded, clipped, focus-bordered frame. Padding on the leaf provides the Hyprland gap (`p-1.5` = 6px each side → 12px between windows):

```tsx
          return (
            <div
              key={id}
              data-leaf={id}
              onMouseEnter={handleLeafMouseEnter}
              onMouseDown={handleLeafMouseDown}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: `${r.w}%`,
                height: `${r.h}%`,
              }}
              className={cn(
                "wm-window absolute flex flex-col p-1.5",
                isPlaceholder && "opacity-40",
              )}
            >
              <div
                className={cn(
                  "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border shadow-[0_18px_44px_-20px_rgba(0,0,0,0.7)] transition-[filter,border-color] duration-200",
                  focused
                    ? "border-amber/70"
                    : "border-fg-4 brightness-[0.88] saturate-[0.9]",
                  isPlaceholder && "ring-2 ring-inset ring-amber",
                )}
              >
                <div
                  className={cn(
                    "wm-glass flex h-7 flex-none items-center gap-2 border-b border-fg-4/50 px-2.5 text-[11px]",
                    focused ? "bg-bg-2/75 text-fg-1" : "bg-bg-0/60 text-fg-2",
                  )}
                >
                  <button
                    type="button"
                    aria-label="close"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => closeApp(id)}
                    className="h-2.5 w-2.5 flex-none rounded-full bg-red-dim hover:bg-red"
                  />
                  <span className="truncate">{title}</span>
                </div>
                <div className="min-h-0 flex-1">
                  <WindowFrame focused={focused}>
                    {meta?.render({ instanceId: id })}
                  </WindowFrame>
                </div>
              </div>
            </div>
          );
```

(The old per-element borders and the separate placeholder ring div are folded into the unified frame; the drop-shadow moves from the leaf to the frame so it follows the rounded silhouette.)

- [ ] **Step 2: Strip the border from WindowFrame**

Replace the component body in `src/features/portfolio/components/wm/window-frame.tsx` — the frame's border now lives on the unified wrapper:

```tsx
export const WindowFrame: FC<Props> = ({ focused, children }) => (
  <div className="wm-window-body wm-glass h-full min-h-0 flex-1 overflow-auto bg-bg-1/85">
    <WindowFocusContext.Provider value={focused}>
      {children}
    </WindowFocusContext.Provider>
  </div>
);
```

(`focused` still feeds `WindowFocusContext` — the prop stays.)

- [ ] **Step 3: Verify**

Run: `pnpm vitest run && pnpm test:e2e`
Expected: all pass — the drag/resize e2e tests assert bounding-box deltas and the `[data-drag-overlay]` ghost, all preserved; the deep-link test's `.wm-window-body` class is preserved.

Manual check in `pnpm dev`: windows have 12px gaps with wallpaper showing through, 12px-rounded corners, amber border + full brightness on the focused window, slightly dimmed unfocused windows, smooth 0.22s re-tile tweens (unchanged from `.wm-window` CSS). Check `prefers-reduced-motion` still kills the tween (globals.css:358 — untouched). Leave changes unstaged.

---

### Task 8: Final verification sweep

**Files:** none (verification only).

- [ ] **Step 1: Full suites**

Run: `pnpm lint && pnpm build && pnpm vitest run && pnpm test:e2e`
Expected: all green.

- [ ] **Step 2: Manual desktop pass** (`pnpm dev`, ≥1024px)

- Every content section reachable mouse-only: rail icons (about/posts/experience/contact) and palette rows.
- `/` and bottom handle open the palette; `>scheme mono` recolors; `>wallpaper` strip switches wallpaper with thumbnails.
- Top handle: dashboard with identity/now; workspaces tab switches workspaces.
- Right handle: quick menu; keybinds opens the keymap panel; github/linkedin/email links resolve.
- Leader chords: `` ` ``+1–4 workspaces, `` ` ``+q terminal, `` ` ``+w close, `` ` ``+space palette, `` ` ``+? keybinds, `` ` ``+arrows directional focus; leader+drag move and leader+right-drag resize still work inside the wall.
- Empty workspace (switch to 2): wall shows bare wallpaper; rail and handles remain, so recovery is obvious.

- [ ] **Step 3: Manual mobile pass** (<1024px)

MobileNav + stacked sections render exactly as before — no shell, no rail, no handles. The seed change only affects the desktop WM.

- [ ] **Step 4: Report**

Summarize the diff for review. Everything stays unstaged per the user's git workflow.

---

## Self-Review Notes

- **Spec coverage:** rail (Task 3/6), dashboard pull with tabs + workspace previews (5/6), right quick menu (4/6), bottom rofi palette with results-above-input, `>scheme`, `>wallpaper` thumbnail strip (2), base-layer frame with inset wall + edge handles (6), grain replacing CRT (1/6), rounded/gapped/dimmed windows (7), sans font foundation used in shell prose (1/2/5). Deliberately out of scope, flagged for follow-up plans: content-section typography sweep (sans prose inside windows), workspace slide animation, cross-workspace window move, mobile-shell restyle.
- **Known risk — wallpaper.spec thumbnails:** palette thumbnails fetch `/bg/**` via the image loader, interacting with the spec's request-count assertions; Task 2 Step 8 handles it with the `-640.webp` filter. If Next's image optimizer rewrites URLs in the test env (loader is custom, so it should not), fall back to asserting only the `/bg/mono/` poll and moonlit re-fetch count.
- **Type consistency check:** `PaletteItem`/`PaletteDeps` (Task 2) match usage in `palette.tsx`; `ShellOverlay` local to desktop-chrome; `Rail`/`QuickMenu`/`Dashboard` prop interfaces match their Task 6 call sites; `WorkspaceSeed` leaf-layout form (`layout: entryAppId`) matches the reducer's `MosaicNode<string>` (a bare string is a leaf — same form the tests use).
