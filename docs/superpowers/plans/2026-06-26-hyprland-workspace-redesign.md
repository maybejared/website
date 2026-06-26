# Hyprland Workspace Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the terminal-tab portfolio shell with a Hyprland/sketchybar-style tiling desktop — workspaces, draggable windows, a rofi launcher, a top-bar nav + theme control panel — while keeping real routes for SEO and a plain stacked page on mobile.

**Architecture:** Real Next routes server-render each content section (SEO/no-JS). On desktop hydrate, a `WorkspaceProvider` (reducer + instance-id layer) drives a `react-mosaic` tiling tree per workspace; each tile is a `WindowFrame` hosting an app from a central registry. The top bar is the primary nav. Below `md`, the WM never mounts and the route renders as a stacked page.

**Tech Stack:** Next 16, React 19, TypeScript, Tailwind 4, Vitest + Testing Library, Playwright, `react-mosaic-component@6.2.0` (+ `react-dnd`).

## Global Constraints

- Components: `const` arrow + local `Props` interface + `FC<Props>` (per AGENTS.md). Generic components stay bare arrows (see existing `MasterDetail`).
- One component per file; feature-module structure under `src/features/portfolio`.
- Layout is **never** persisted. Only `{ scheme, wallpaperId }` persists (localStorage key `portfolio:appearance`).
- WM is desktop-only (`md+`). `react-mosaic` / `WorkspaceProvider` must not mount below `md`.
- Singleton apps reuse `instanceId === appId`; the `terminal` app is multi-instance (`terminal:N`).
- Keymap: `Alt+1..4` switch workspace · `Alt+Q` new terminal · `Alt+W` close focused · `Alt+Space` toggle launcher.
- Content apps: `about` (`/`), `experience` (`/experience`), `posts` (`/posts`), `contact` (`/contact`). No `projects`, no `reader` app.
- Do not auto-commit beyond the per-task commits below; work stays on a feature branch. Commit messages: imperative, no plan/ticket numbers.
- Run `pnpm test` (Vitest) for unit tests, `pnpm test:e2e` for Playwright.

---

## File Structure

**Create:**
- `src/features/portfolio/lib/config/apps.config.ts` — app registry (content + decor), `AppId`, `AppMeta`.
- `src/features/portfolio/lib/wm/workspace-reducer.ts` — pure reducer + types + helpers.
- `src/features/portfolio/lib/wm/workspace-reducer.test.ts`
- `src/features/portfolio/providers/workspace-provider.tsx` — context over the reducer.
- `src/features/portfolio/components/wm/desktop.tsx` — renders react-mosaic for the active workspace.
- `src/features/portfolio/components/wm/window-frame.tsx` — terminal chrome + focus context bridge for a mosaic tile.
- `src/features/portfolio/components/wm/launcher.tsx` — rofi palette.
- `src/features/portfolio/components/wm/top-bar.tsx` — interactive sketchybar nav (replaces `desktop-top-bar.tsx`).
- `src/features/portfolio/components/wm/theme-panel.tsx` — scheme + wallpaper popover.
- `src/features/portfolio/components/apps/terminal/terminal-app.tsx` — decorative terminal body (expansion module).
- `src/features/portfolio/hooks/use-wm-keys.ts` (replaces `use-route-tab-keys.ts`).
- `src/features/portfolio/hooks/use-wm-keys.test.tsx`
- `src/features/portfolio/hooks/use-appearance.ts`
- `src/features/portfolio/hooks/use-appearance.test.tsx`
- `src/features/portfolio/hooks/use-window-focus.ts` — focus context hook for keyboard scoping.

**Modify:**
- `src/features/portfolio/components/portfolio-shell.tsx` — render-mode branching + seed.
- `src/features/portfolio/lib/config/wallpapers.ts` — per-scheme map → flat list + `"none"`.
- `src/features/portfolio/components/background/wallpaper-layer.tsx`, `image-viewer-panel.tsx`, `hooks/use-wallpaper-crossfade.ts`, `hooks/use-wallpaper-enabled.ts` — consume `wallpaperId` instead of scheme.
- `src/features/portfolio/components/sections/posts-section.tsx`, `experience-section.tsx` — focus-scope keyboard, drop `useReportSelection`.
- `src/features/portfolio/components/sections/about-section.tsx`, `contact-section.tsx`, `not-found-section.tsx` — drop `useReportSelection`.
- `src/features/portfolio/index.ts` — export updates.
- `src/shared/types/portfolio/index.ts` — remove `Project`, `projects` from `SectionKey`/`PortfolioContent`.
- `src/content/portfolio/portfolio-content.ts` — remove `projects` data.

**Delete:**
- `components/title-bar.tsx`, `components/tab-bar.tsx`, `components/status-bar.tsx`, `components/scheme-switcher.tsx`, `components/scheme-menu.tsx` (folded into theme-panel), `components/desktop-dock.tsx`, `components/desktop-dock.test.tsx`, `components/desktop-top-bar.tsx`, `components/background-terminals.tsx` (logic moves into decor apps + desktop).
- `providers/window-manager-provider.tsx`, `providers/selection-provider.tsx`.
- `hooks/use-route-tab-keys.ts`, `hooks/use-intro-sequence.ts`, `hooks/use-cover-top.ts`, `hooks/use-page-transition.ts`.
- `components/boot-overlay.tsx`, `lib/config/tabs.ts`, `lib/config/desktop-windows.ts`, `lib/config/desktop-windows.test.ts`.
- `components/sections/projects-section.tsx`, `components/sections/project-row.tsx`.
- `src/shared/ui/ascii-skeleton.tsx`, `src/shared/ui/strip-band.tsx` (transition-only — confirm no other consumers first).

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
pnpm add react-mosaic-component@6.2.0 react-dnd react-dnd-html5-backend
```

- [ ] **Step 2: Verify peer compatibility**

Run: `pnpm ls react-mosaic-component react-dnd`
Expected: both resolve; no React peer error (`react-mosaic-component` peer is `>=16`).

- [ ] **Step 3: Verify build still boots**

Run: `pnpm build`
Expected: build succeeds (nothing imports the new deps yet).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "add react-mosaic and react-dnd"
```

---

## Task 2: Workspace reducer (pure logic)

The heart of the WM. No React, no DOM — a pure reducer + helpers, fully unit-tested.

**Files:**
- Create: `src/features/portfolio/lib/wm/workspace-reducer.ts`
- Test: `src/features/portfolio/lib/wm/workspace-reducer.test.ts`

**Interfaces:**
- Consumes: `MosaicNode` type from `react-mosaic-component`.
- Produces:
  - `type WorkspaceId = 1 | 2 | 3 | 4`
  - `interface WorkspaceState { active: WorkspaceId; layouts: Record<WorkspaceId, MosaicNode<string> | null>; instances: Record<string, string>; focused: string | null }` (instances maps `instanceId → appId`)
  - `type WorkspaceAction = { type: "switch"; workspace: WorkspaceId } | { type: "open"; appId: string; multiInstance?: boolean } | { type: "close"; instanceId: string } | { type: "focus"; instanceId: string } | { type: "setLayout"; node: MosaicNode<string> | null }`
  - `function workspaceReducer(state, action): WorkspaceState`
  - `function initialWorkspaceState(seed: { workspace: WorkspaceId; instances: { id: string; appId: string }[]; layout: MosaicNode<string> | null }): WorkspaceState`
  - `function findInstanceWorkspace(state, instanceId): WorkspaceId | null`

- [ ] **Step 1: Write the failing tests**

```ts
// workspace-reducer.test.ts
import { describe, expect, it } from "vitest";
import {
  initialWorkspaceState,
  workspaceReducer,
  type WorkspaceState,
} from "./workspace-reducer";

const base = (): WorkspaceState =>
  initialWorkspaceState({ workspace: 1, instances: [], layout: null });

describe("workspaceReducer", () => {
  it("opens a singleton app as instanceId === appId and focuses it", () => {
    const s = workspaceReducer(base(), { type: "open", appId: "posts" });
    expect(s.instances.posts).toBe("posts");
    expect(s.focused).toBe("posts");
    expect(s.layouts[1]).toBe("posts");
  });

  it("re-opening a singleton focuses the existing instance, no duplicate", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "btop" });
    s = workspaceReducer(s, { type: "switch", workspace: 2 });
    s = workspaceReducer(s, { type: "open", appId: "btop" });
    expect(Object.keys(s.instances)).toEqual(["btop"]);
    expect(s.active).toBe(1); // switched back to where btop lives
    expect(s.focused).toBe("btop");
  });

  it("mints a new id per multiInstance open and tiles both", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "terminal", multiInstance: true });
    s = workspaceReducer(s, { type: "open", appId: "terminal", multiInstance: true });
    const ids = Object.keys(s.instances);
    expect(ids).toEqual(["terminal:1", "terminal:2"]);
    expect(s.instances["terminal:2"]).toBe("terminal");
  });

  it("close removes the instance and clears focus if it was focused", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "posts" });
    s = workspaceReducer(s, { type: "close", instanceId: "posts" });
    expect(s.instances.posts).toBeUndefined();
    expect(s.layouts[1]).toBeNull();
    expect(s.focused).toBeNull();
  });

  it("switch changes the active workspace", () => {
    const s = workspaceReducer(base(), { type: "switch", workspace: 3 });
    expect(s.active).toBe(3);
  });

  it("setLayout replaces the active workspace tree", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "posts" });
    s = workspaceReducer(s, { type: "open", appId: "about" });
    const tree = { direction: "row", first: "posts", second: "about" } as const;
    s = workspaceReducer(s, { type: "setLayout", node: tree });
    expect(s.layouts[1]).toEqual(tree);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test workspace-reducer`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement the reducer**

```ts
// workspace-reducer.ts
import {
  type MosaicNode,
  getLeaves,
  updateTree,
} from "react-mosaic-component";

export type WorkspaceId = 1 | 2 | 3 | 4;
export const WORKSPACE_IDS: WorkspaceId[] = [1, 2, 3, 4];

export interface WorkspaceState {
  active: WorkspaceId;
  layouts: Record<WorkspaceId, MosaicNode<string> | null>;
  instances: Record<string, string>; // instanceId -> appId
  focused: string | null; // instanceId
}

export type WorkspaceAction =
  | { type: "switch"; workspace: WorkspaceId }
  | { type: "open"; appId: string; multiInstance?: boolean }
  | { type: "close"; instanceId: string }
  | { type: "focus"; instanceId: string }
  | { type: "setLayout"; node: MosaicNode<string> | null };

const emptyLayouts = (): Record<WorkspaceId, MosaicNode<string> | null> => ({
  1: null,
  2: null,
  3: null,
  4: null,
});

export function initialWorkspaceState(seed: {
  workspace: WorkspaceId;
  instances: { id: string; appId: string }[];
  layout: MosaicNode<string> | null;
}): WorkspaceState {
  const layouts = emptyLayouts();
  layouts[seed.workspace] = seed.layout;
  const instances: Record<string, string> = {};
  for (const { id, appId } of seed.instances) instances[id] = appId;
  return {
    active: seed.workspace,
    layouts,
    instances,
    focused: seed.instances[0]?.id ?? null,
  };
}

export function findInstanceWorkspace(
  state: WorkspaceState,
  instanceId: string,
): WorkspaceId | null {
  for (const id of WORKSPACE_IDS) {
    const tree = state.layouts[id];
    if (tree && getLeaves(tree).includes(instanceId)) return id;
  }
  return null;
}

/** Add a leaf to a tree: null → leaf; existing → split row with the newcomer on the right. */
function addLeaf(
  tree: MosaicNode<string> | null,
  leaf: string,
): MosaicNode<string> {
  if (tree === null) return leaf;
  return { direction: "row", first: tree, second: leaf };
}

/** Remove a leaf, collapsing its parent. Returns the remaining tree or null. */
function removeLeaf(
  tree: MosaicNode<string> | null,
  leaf: string,
): MosaicNode<string> | null {
  if (tree === null) return null;
  if (typeof tree === "string") return tree === leaf ? null : tree;
  const first = removeLeaf(tree.first, leaf);
  const second = removeLeaf(tree.second, leaf);
  if (first === null) return second;
  if (second === null) return first;
  return { ...tree, first, second };
}

function nextInstanceId(state: WorkspaceState, appId: string): string {
  let n = 1;
  while (state.instances[`${appId}:${n}`]) n += 1;
  return `${appId}:${n}`;
}

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "switch":
      return { ...state, active: action.workspace };

    case "open": {
      if (!action.multiInstance) {
        // Singleton: focus the existing instance if it is already open.
        if (state.instances[action.appId]) {
          const ws = findInstanceWorkspace(state, action.appId) ?? state.active;
          return { ...state, active: ws, focused: action.appId };
        }
        const tree = addLeaf(state.layouts[state.active], action.appId);
        return {
          ...state,
          instances: { ...state.instances, [action.appId]: action.appId },
          layouts: { ...state.layouts, [state.active]: tree },
          focused: action.appId,
        };
      }
      const id = nextInstanceId(state, action.appId);
      const tree = addLeaf(state.layouts[state.active], id);
      return {
        ...state,
        instances: { ...state.instances, [id]: action.appId },
        layouts: { ...state.layouts, [state.active]: tree },
        focused: id,
      };
    }

    case "close": {
      const ws = findInstanceWorkspace(state, action.instanceId);
      const instances = { ...state.instances };
      delete instances[action.instanceId];
      const layouts = { ...state.layouts };
      if (ws) layouts[ws] = removeLeaf(layouts[ws], action.instanceId);
      return {
        ...state,
        instances,
        layouts,
        focused: state.focused === action.instanceId ? null : state.focused,
      };
    }

    case "focus":
      return { ...state, focused: action.instanceId };

    case "setLayout":
      return {
        ...state,
        layouts: { ...state.layouts, [state.active]: action.node },
      };

    default:
      return state;
  }
}
```

Note: `updateTree` import is unused here — drop it; kept the import list honest by only importing `getLeaves` and `MosaicNode`. Fix the import to `import { type MosaicNode, getLeaves } from "react-mosaic-component";`.

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test workspace-reducer`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/lib/wm/
git commit -m "add workspace reducer with instance-id layer"
```

---

## Task 3: App registry

**Files:**
- Create: `src/features/portfolio/lib/config/apps.config.ts`
- Test: `src/features/portfolio/lib/config/apps.config.test.ts`

**Interfaces:**
- Consumes: section components (`AboutSection`, etc.), decor panel components, `TerminalApp` (Task 12 — until then, decor `render` for `terminal` returns a placeholder `null`; wire in Task 12).
- Produces:
  - `type AppId = "about" | "experience" | "posts" | "contact" | "btop" | "cava" | "clock" | "fetch" | "vim" | "playlist" | "imv" | "terminal"`
  - `interface AppMeta { id: AppId; title: string; label: string; icon: string; tint: string; kind: "content" | "decor"; href?: string; multiInstance?: boolean; render: (ctx: { instanceId: string }) => ReactNode }`
  - `const APPS: AppMeta[]`
  - `const APP_BY_ID: Record<AppId, AppMeta>`
  - `const CONTENT_APPS: AppMeta[]` (kind === "content", in nav order)

- [ ] **Step 1: Write the failing test**

```ts
// apps.config.test.ts
import { describe, expect, it } from "vitest";
import { APPS, APP_BY_ID, CONTENT_APPS } from "./apps.config";

describe("app registry", () => {
  it("indexes every app by id", () => {
    for (const app of APPS) expect(APP_BY_ID[app.id]).toBe(app);
  });

  it("exposes the four content apps in nav order with hrefs", () => {
    expect(CONTENT_APPS.map((a) => a.id)).toEqual([
      "about",
      "posts",
      "experience",
      "contact",
    ]);
    for (const a of CONTENT_APPS) expect(a.href).toBeTruthy();
  });

  it("marks only the terminal as multiInstance", () => {
    const multi = APPS.filter((a) => a.multiInstance).map((a) => a.id);
    expect(multi).toEqual(["terminal"]);
  });

  it("every app renders a node", () => {
    for (const app of APPS)
      expect(app.render({ instanceId: app.id })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test apps.config`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the registry**

Reuse the existing section + panel components as window bodies. Pull `title`/`tint`/`icon` values from the deleted `desktop-windows.ts` where they exist (nvim→vim, spotify→playlist, etc.). Content sections are server data-fed; for the registry they render with their data props (about/contact take none; posts/experience are fed by the route in mode 2/3 — in the registry render they use the client data already available via their existing props or a data import). Keep the body wrappers thin.

```tsx
// apps.config.ts
import type { ReactNode } from "react";

import { AboutSection } from "@/src/features/portfolio/components/sections/about-section";
import { ContactSection } from "@/src/features/portfolio/components/sections/contact-section";
// posts/experience need server data; see note below.
import { BtopPanel } from "@/src/features/portfolio/components/background/btop-panel";
import { FetchPanel } from "@/src/features/portfolio/components/background/fetch-panel";
import { ImageViewerPanel } from "@/src/features/portfolio/components/background/image-viewer-panel";
import { PlaylistPanel } from "@/src/features/portfolio/components/background/playlist-panel";
import { ScramblePanel } from "@/src/features/portfolio/components/background/scramble-panel";
import { VimPanel } from "@/src/features/portfolio/components/background/vim-panel";
import { ZfsPanel } from "@/src/features/portfolio/components/background/zfs-panel";

export type AppId =
  | "about" | "experience" | "posts" | "contact"
  | "btop" | "cava" | "clock" | "fetch" | "vim" | "playlist" | "imv" | "terminal";

export interface AppMeta {
  id: AppId;
  title: string;
  label: string;
  icon: string;
  tint: string;
  kind: "content" | "decor";
  href?: string;
  multiInstance?: boolean;
  render: (ctx: { instanceId: string }) => ReactNode;
}
```

**Data note for `posts`/`experience`:** their bodies need server data. Two options — pick the simpler that the executor confirms compiles:
- (a) These two apps are registered with a `render` that reads a client-side data module (e.g. `getAllPostsClient()` from a `"use client"` data file) — preferred so the registry is self-contained.
- (b) If posts data is only available server-side, the registry omits a default body and `PortfolioShell` injects the route-provided section as the initial tile (Task 11), while the launcher entry for `posts` triggers a client fetch.

Implement (a): add `src/content/portfolio/posts-client.ts` exporting the already-static post metadata array (posts are static via `generateStaticParams`), and feed `PostsSection`/`ExperienceSection`. Then:

```tsx
const render = {
  about: () => <AboutSection />,
  contact: () => <ContactSection />,
  // posts / experience wired to client data module:
  // posts: () => <PostsSection posts={POSTS} />,
  // experience: () => <ExperienceSection />,  // already self-fed
  btop: () => <BtopPanel />,
  fetch: () => <FetchPanel />,
  imv: () => <ImageViewerPanel />,
  playlist: () => <PlaylistPanel />,
  vim: () => <VimPanel />,
  cava: () => <ScramblePanel><BtopPanel /></ScramblePanel>, // placeholder: cava = audio bars; reuse scramble for now
  clock: () => <ClockApp />, // small new component, see below
  terminal: () => null, // wired in Task 12
};
```

Add a tiny `ClockApp` (reuse `useDeskStamp` from `use-desktop-clock`) inline or as `components/apps/clock-app.tsx`. Build `APPS`, `APP_BY_ID`, `CONTENT_APPS` (order: about, posts, experience, contact).

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test apps.config`
Expected: PASS (4 tests). Adjust the `render` for `terminal` to satisfy "renders a node" — return a placeholder element `<></>` instead of `null` so the test passes until Task 12.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/lib/config/apps.config.ts src/features/portfolio/lib/config/apps.config.test.ts src/content/portfolio/posts-client.ts src/features/portfolio/components/apps/clock-app.tsx
git commit -m "add app registry for workspace windows"
```

---

## Task 4: useAppearance hook (scheme + wallpaper, persisted)

**Files:**
- Create: `src/features/portfolio/hooks/use-appearance.ts`
- Test: `src/features/portfolio/hooks/use-appearance.test.tsx`

**Interfaces:**
- Produces: `function useAppearance(): { scheme: SchemeName; setScheme: (s: SchemeName) => void; wallpaperId: string; setWallpaperId: (id: string) => void }`. Persists `{ scheme, wallpaperId }` to localStorage key `portfolio:appearance`; applies `scheme-*` body class (folding in `useScheme`'s effect).

- [ ] **Step 1: Write the failing test**

```tsx
// use-appearance.test.tsx
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAppearance } from "./use-appearance";

afterEach(() => localStorage.clear());

describe("useAppearance", () => {
  it("defaults then persists scheme + wallpaper", () => {
    const { result } = renderHook(() => useAppearance());
    act(() => result.current.setScheme("mono"));
    act(() => result.current.setWallpaperId("snowy-house"));
    expect(JSON.parse(localStorage.getItem("portfolio:appearance")!)).toEqual({
      scheme: "mono",
      wallpaperId: "snowy-house",
    });
  });

  it("rehydrates from localStorage", () => {
    localStorage.setItem(
      "portfolio:appearance",
      JSON.stringify({ scheme: "beige", wallpaperId: "none" }),
    );
    const { result } = renderHook(() => useAppearance());
    expect(result.current.scheme).toBe("beige");
    expect(result.current.wallpaperId).toBe("none");
  });

  it("applies the scheme body class", () => {
    const { result } = renderHook(() => useAppearance());
    act(() => result.current.setScheme("mono"));
    expect(document.body.classList.contains("scheme-mono")).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test use-appearance`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// use-appearance.ts
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SCHEME,
  SCHEMES,
} from "@/src/features/portfolio/lib/config/schemes";
import { DEFAULT_WALLPAPER_ID } from "@/src/features/portfolio/lib/config/wallpapers";
import type { SchemeName } from "@/src/shared/types/portfolio";

const KEY = "portfolio:appearance";
interface Appearance { scheme: SchemeName; wallpaperId: string }

const read = (): Appearance => {
  if (typeof window === "undefined")
    return { scheme: DEFAULT_SCHEME, wallpaperId: DEFAULT_WALLPAPER_ID };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...JSON.parse(raw) };
  } catch {}
  return { scheme: DEFAULT_SCHEME, wallpaperId: DEFAULT_WALLPAPER_ID };
};

export function useAppearance() {
  const [state, setState] = useState<Appearance>(read);

  useEffect(() => {
    const body = document.body;
    SCHEMES.forEach((s) => body.classList.remove("scheme-" + s));
    body.classList.add("scheme-" + state.scheme);
  }, [state.scheme]);

  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setScheme = useCallback(
    (scheme: SchemeName) => setState((s) => ({ ...s, scheme })), []);
  const setWallpaperId = useCallback(
    (wallpaperId: string) => setState((s) => ({ ...s, wallpaperId })), []);

  return { scheme: state.scheme, setScheme, wallpaperId: state.wallpaperId, setWallpaperId };
}
```

(`useCallback` import is from `react` — fix to `import { useCallback, useEffect, useState } from "react";`.)

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test use-appearance`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/hooks/use-appearance.*
git commit -m "add persisted appearance hook"
```

---

## Task 5: Reshape wallpapers to a flat decoupled list

**Files:**
- Modify: `src/features/portfolio/lib/config/wallpapers.ts`
- Modify: `components/background/wallpaper-layer.tsx`, `image-viewer-panel.tsx`, `hooks/use-wallpaper-crossfade.ts`
- Test: existing `wallpaper-layer.test.tsx`, `image-viewer-panel.test.tsx`, `use-wallpaper-crossfade.test.tsx` (update)

**Interfaces:**
- Produces: `interface WallpaperOption { id: string; label: string; image: ResponsiveImage | null }`, `const WALLPAPERS: WallpaperOption[]` (includes `{ id: "none", label: "none", image: null }`), `const DEFAULT_WALLPAPER_ID: string`, `function wallpaperById(id: string): WallpaperOption`.

- [ ] **Step 1: Update the wallpaper test**

Add to `wallpaper-layer.test.tsx` a case that passing `wallpaperId="none"` renders no `<img>`, and a known id renders the ladder. (Mirror the existing assertions, swapping the `scheme` prop for `wallpaperId`.)

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test wallpaper`
Expected: FAIL (prop/type mismatch).

- [ ] **Step 3: Reshape config + consumers**

Convert the per-scheme map into a flat `WALLPAPERS` array (keep the existing `ResponsiveImage`/`IMAGE_WIDTHS` machinery; just re-key by a wallpaper `id` instead of `SchemeName`). Add the `"none"` option. Change `WallpaperLayer`, `ImageViewerPanel`, and `use-wallpaper-crossfade` to take `wallpaperId: string` and resolve via `wallpaperById`. `null` image → render flat (same branch the old `beige`/`null` path used).

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test wallpaper image-viewer`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/lib/config/wallpapers.ts src/features/portfolio/components/background/ src/features/portfolio/hooks/use-wallpaper-crossfade.ts
git commit -m "decouple wallpaper from scheme into a flat selectable list"
```

---

## Task 6: WorkspaceProvider

**Files:**
- Create: `src/features/portfolio/providers/workspace-provider.tsx`

**Interfaces:**
- Consumes: `workspaceReducer`, `initialWorkspaceState`, `APP_BY_ID`.
- Produces: `WorkspaceProvider` (props: `children`, `seed`); `useWorkspace()` returning `{ state, switchWorkspace, openApp, closeApp, focusApp, setLayout }`. `openApp(appId)` reads `APP_BY_ID[appId].multiInstance` to dispatch correctly and, for content apps with `href`, calls `router.push(href)` (shallow) — except `about`/`experience`/`contact` whose href is their list route; pushing it is harmless and keeps deep links honest.

- [ ] **Step 1: Implement the provider**

```tsx
// workspace-provider.tsx
"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";
import { useRouter } from "next/navigation";

import { APP_BY_ID } from "@/src/features/portfolio/lib/config/apps.config";
import {
  initialWorkspaceState,
  workspaceReducer,
  type WorkspaceId,
  type WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";

interface WorkspaceApi {
  state: WorkspaceState;
  switchWorkspace: (id: WorkspaceId) => void;
  openApp: (appId: string) => void;
  closeApp: (instanceId: string) => void;
  focusApp: (instanceId: string) => void;
  setLayout: (node: WorkspaceState["layouts"][WorkspaceId]) => void;
}

const Ctx = createContext<WorkspaceApi | undefined>(undefined);

interface Props {
  children: ReactNode;
  seed: Parameters<typeof initialWorkspaceState>[0];
}

export const WorkspaceProvider: FC<Props> = ({ children, seed }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    workspaceReducer,
    seed,
    initialWorkspaceState,
  );

  const api = useMemo<WorkspaceApi>(
    () => ({
      state,
      switchWorkspace: (workspace) => dispatch({ type: "switch", workspace }),
      openApp: (appId) => {
        const meta = APP_BY_ID[appId as keyof typeof APP_BY_ID];
        dispatch({ type: "open", appId, multiInstance: meta?.multiInstance });
        if (meta?.href) router.push(meta.href);
      },
      closeApp: (instanceId) => dispatch({ type: "close", instanceId }),
      focusApp: (instanceId) => dispatch({ type: "focus", instanceId }),
      setLayout: (node) => dispatch({ type: "setLayout", node }),
    }),
    [state, router],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export function useWorkspace(): WorkspaceApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm build` (or `pnpm tsc --noEmit` if available)
Expected: no type errors in this file (consumers come later).

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/providers/workspace-provider.tsx
git commit -m "add workspace provider over the reducer"
```

---

## Task 7: WindowFrame + focus context

**Files:**
- Create: `src/features/portfolio/components/wm/window-frame.tsx`
- Create: `src/features/portfolio/hooks/use-window-focus.ts`

**Interfaces:**
- Produces:
  - `WindowFocusContext` + `useWindowFocus(): boolean` (true when the enclosing window is the focused instance).
  - `WindowFrame` — props: `{ title: string; focused: boolean; onClose: () => void; onFocus: () => void; children: ReactNode }`. Renders the terminal chrome (reuse `FauxTerminal`'s title-bar look; do NOT reuse `FauxTerminal`'s open/close animation — react-mosaic owns mount/unmount). Provides focus via context to children.

- [ ] **Step 1: Implement focus context + frame**

```tsx
// use-window-focus.ts
"use client";
import { createContext, useContext } from "react";
export const WindowFocusContext = createContext(false);
export const useWindowFocus = (): boolean => useContext(WindowFocusContext);
```

```tsx
// window-frame.tsx
"use client";
import type { FC, ReactNode } from "react";
import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  title: string;
  focused: boolean;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}

export const WindowFrame: FC<Props> = ({ title, focused, onClose, onFocus, children }) => (
  <div
    onMouseDown={onFocus}
    className={cn(
      "flex h-full flex-col overflow-hidden rounded-xs border bg-bg-1",
      focused ? "border-amber/70" : "border-fg-4",
    )}
  >
    <div className="flex flex-none items-center gap-2 border-b border-fg-4 bg-bg-0 px-2 py-1 text-[11px] text-fg-2">
      <button type="button" aria-label="close" onClick={onClose}
        className="h-2 w-2 rounded-full bg-red-dim hover:bg-red" />
      <span className="truncate">{title}</span>
    </div>
    <div className="min-h-0 flex-1 overflow-auto">
      <WindowFocusContext.Provider value={focused}>{children}</WindowFocusContext.Provider>
    </div>
  </div>
);
```

- [ ] **Step 2: Type-check**

Run: `pnpm build`
Expected: no errors in these files.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/wm/window-frame.tsx src/features/portfolio/hooks/use-window-focus.ts
git commit -m "add window frame with focus context"
```

---

## Task 8: Desktop (react-mosaic host)

**Files:**
- Create: `src/features/portfolio/components/wm/desktop.tsx`

**Interfaces:**
- Consumes: `useWorkspace`, `APP_BY_ID`, `WindowFrame`, `Mosaic` from `react-mosaic-component`, `DndProvider` + `HTML5Backend`.
- Produces: `Desktop` (no props) — renders `<Mosaic<string>>` for `state.layouts[state.active]`, mapping each leaf `instanceId` → `APP_BY_ID[instances[instanceId]]`, wrapped in `WindowFrame`. `onChange` → `setLayout`. Import `react-mosaic-component/react-mosaic-component.css` once here (or in `globals.css`).

- [ ] **Step 1: Implement**

```tsx
// desktop.tsx
"use client";
import type { FC } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Mosaic, MosaicWindow } from "react-mosaic-component";

import { APP_BY_ID, type AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { WindowFrame } from "@/src/features/portfolio/components/wm/window-frame";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";

export const Desktop: FC = () => {
  const { state, setLayout, closeApp, focusApp } = useWorkspace();
  const tree = state.layouts[state.active];

  return (
    <DndProvider backend={HTML5Backend}>
      <Mosaic<string>
        value={tree}
        onChange={(node) => setLayout(node)}
        renderTile={(instanceId, path) => {
          const meta = APP_BY_ID[state.instances[instanceId] as AppId];
          return (
            <MosaicWindow<string> path={path} title={meta?.title ?? instanceId}
              renderToolbar={() => <></>}>
              <WindowFrame
                title={meta?.title ?? instanceId}
                focused={state.focused === instanceId}
                onFocus={() => focusApp(instanceId)}
                onClose={() => closeApp(instanceId)}
              >
                {meta?.render({ instanceId })}
              </WindowFrame>
            </MosaicWindow>
          );
        }}
      />
    </DndProvider>
  );
};
```

(Use `renderToolbar={() => <></>}` so `WindowFrame` supplies the chrome, not the default mosaic toolbar. If empty content renders awkwardly, render `WindowFrame` directly without `MosaicWindow` — confirm drag still works; `MosaicWindow` provides the drag source, so keep it but hide its toolbar via CSS in Task 13's styling pass.)

- [ ] **Step 2: Type-check**

Run: `pnpm build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/wm/desktop.tsx
git commit -m "add mosaic desktop host"
```

---

## Task 9: Launcher (rofi)

**Files:**
- Create: `src/features/portfolio/components/wm/launcher.tsx`

**Interfaces:**
- Consumes: `APPS`, `useWorkspace`.
- Produces: `Launcher` — props `{ open: boolean; onClose: () => void }`. Fuzzy-filters `APPS` by `label`/`id`; arrow + enter selects; Enter calls `openApp` then `onClose`. Reuse the keyboard-list pattern from `use-list-navigation` (highlight index + ↑/↓/Enter/Esc) but local to the launcher (it is not a route list).

- [ ] **Step 1: Write the failing test**

```tsx
// launcher.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
// Wrap with a fake WorkspaceProvider stub or mock useWorkspace.
```

Mock `useWorkspace` to capture `openApp`. Test: typing "post" filters to the posts entry; pressing Enter calls `openApp("posts")` and `onClose`.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test launcher`
Expected: FAIL.

- [ ] **Step 3: Implement** the palette: an input + filtered list, `filter = APPS.filter(a => (a.label + a.id).toLowerCase().includes(q.toLowerCase()))`, highlight state, key handling. Style as a centered terminal panel.

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm test launcher`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/components/wm/launcher.tsx src/features/portfolio/components/wm/launcher.test.tsx
git commit -m "add rofi-style app launcher"
```

---

## Task 10: use-wm-keys

**Files:**
- Create: `src/features/portfolio/hooks/use-wm-keys.ts`
- Test: `src/features/portfolio/hooks/use-wm-keys.test.tsx`
- Delete: `src/features/portfolio/hooks/use-route-tab-keys.ts`

**Interfaces:**
- Consumes: `useWorkspace`.
- Produces: `function useWmKeys(opts: { toggleLauncher: () => void }): void`. Binds the keymap; ignores events when target is INPUT/TEXTAREA.

- [ ] **Step 1: Write the failing test**

```tsx
// use-wm-keys.test.tsx — mock useWorkspace, render a host component calling useWmKeys,
// dispatch KeyboardEvent and assert the right api method fired.
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
```

Cases: `Alt+2` → `switchWorkspace(2)`; `Alt+q` → `openApp("terminal")`; `Alt+w` with a focused instance → `closeApp(focused)`; `Alt+ ` (space) → `toggleLauncher`.

- [ ] **Step 2: Run to verify failure** — `pnpm test use-wm-keys` → FAIL.

- [ ] **Step 3: Implement**

```ts
// use-wm-keys.ts
"use client";
import { useEffect } from "react";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceId } from "@/src/features/portfolio/lib/wm/workspace-reducer";

export function useWmKeys(opts: { toggleLauncher: () => void }): void {
  const { state, switchWorkspace, openApp, closeApp } = useWorkspace();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA") return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        switchWorkspace(Number(e.key) as WorkspaceId);
      } else if (e.key.toLowerCase() === "q") {
        e.preventDefault();
        openApp("terminal");
      } else if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (state.focused) closeApp(state.focused);
      } else if (e.key === " ") {
        e.preventDefault();
        opts.toggleLauncher();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.focused, switchWorkspace, openApp, closeApp, opts]);
}
```

- [ ] **Step 4: Run tests to verify pass** — `pnpm test use-wm-keys` → PASS.

- [ ] **Step 5: Commit**

```bash
git rm src/features/portfolio/hooks/use-route-tab-keys.ts
git add src/features/portfolio/hooks/use-wm-keys.*
git commit -m "add wm keybindings hook, drop route tab keys"
```

---

## Task 11: Top bar + theme panel

**Files:**
- Create: `src/features/portfolio/components/wm/top-bar.tsx`, `theme-panel.tsx`
- Delete: `components/desktop-top-bar.tsx`, `components/scheme-switcher.tsx`, `components/scheme-menu.tsx`

**Interfaces:**
- Consumes: `useWorkspace`, `CONTENT_APPS`, `useAppearance` (passed down as props from shell), `WALLPAPERS`, `SCHEMES`, `useDeskStamp`.
- Produces: `TopBar` — props `{ appearance; onOpenLauncher: () => void }`. Renders workspace pills (active from `state.active`, click → `switchWorkspace`), launcher button, `CONTENT_APPS` entries (click → `openApp(id)`), and the `ThemePanel` popover + clock/handle. `ThemePanel` — props `{ scheme; setScheme; wallpaperId; setWallpaperId }` — popover listing `SCHEMES` and `WALLPAPERS`.

- [ ] **Step 1: Implement `ThemePanel`** (port `scheme-menu`'s outside-click + list pattern; add a wallpaper list section).

- [ ] **Step 2: Implement `TopBar`** (extend the markup from the deleted `desktop-top-bar.tsx`, but `pointer-events-auto` and wired).

- [ ] **Step 3: Type-check** — `pnpm build` → no errors.

- [ ] **Step 4: Commit**

```bash
git rm src/features/portfolio/components/desktop-top-bar.tsx src/features/portfolio/components/scheme-switcher.tsx src/features/portfolio/components/scheme-menu.tsx
git add src/features/portfolio/components/wm/top-bar.tsx src/features/portfolio/components/wm/theme-panel.tsx
git commit -m "add interactive top bar and theme control panel"
```

---

## Task 12: Terminal app module (decorative, multi-instance)

**Files:**
- Create: `src/features/portfolio/components/apps/terminal/terminal-app.tsx`
- Modify: `apps.config.ts` (`terminal.render` → `<TerminalApp instanceId={ctx.instanceId} />`)

**Interfaces:**
- Produces: `TerminalApp` — props `{ instanceId: string }`. Decorative body showing fastfetch output (reuse `Fastfetch`). The `instanceId` prop is the documented seam for a future interactive shell; currently unused beyond a `data-instance` attribute.

- [ ] **Step 1: Implement**

```tsx
// terminal-app.tsx
"use client";
import type { FC } from "react";
import { Fastfetch } from "@/src/features/portfolio/components/fastfetch";

interface Props { instanceId: string }

/**
 * Decorative terminal window. The instanceId is the seam a future interactive
 * shell will use to key per-instance state (history, cwd); unused for now.
 */
export const TerminalApp: FC<Props> = ({ instanceId }) => (
  <div data-instance={instanceId} className="p-3">
    <Fastfetch />
  </div>
);
```

- [ ] **Step 2: Wire into the registry** and update the registry test if the `terminal` render placeholder changed.

Run: `pnpm test apps.config` → PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/apps/terminal/ src/features/portfolio/lib/config/apps.config.ts
git commit -m "add decorative terminal app module with expansion seam"
```

---

## Task 13: Keyboard focus-scoping for master-detail sections

**Files:**
- Modify: `components/sections/posts-section.tsx`, `experience-section.tsx`
- Modify: `about-section.tsx`, `contact-section.tsx`, `not-found-section.tsx` (drop `useReportSelection`)

**Interfaces:**
- Consumes: `useWindowFocus`.

- [ ] **Step 1: Write the failing test**

In `posts-section` test (create `posts-section.test.tsx` if absent), render the section inside a `WindowFocusContext.Provider value={false}`, fire `ArrowDown`, assert the highlight does NOT move; with `value={true}`, it moves.

- [ ] **Step 2: Run to verify failure** — `pnpm test posts-section` → FAIL.

- [ ] **Step 3: Implement** — gate the keydown handler: at the top of the effect callback, `if (!focused) return;` where `const focused = useWindowFocus();`. Add `focused` to the effect deps. Remove `useReportSelection` calls from all five sections (provider is deleted in Task 14).

- [ ] **Step 4: Run tests to verify pass** — `pnpm test sections` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/components/sections/
git commit -m "focus-scope section keyboard nav, drop global selection"
```

---

## Task 14: PortfolioShell render modes + seed + deletions

**Files:**
- Modify: `components/portfolio-shell.tsx`
- Delete: `providers/window-manager-provider.tsx`, `providers/selection-provider.tsx`, `components/title-bar.tsx`, `components/tab-bar.tsx`, `components/status-bar.tsx`, `components/desktop-dock.tsx`, `components/desktop-dock.test.tsx`, `components/background-terminals.tsx`, `components/boot-overlay.tsx`, `hooks/use-intro-sequence.ts`, `hooks/use-cover-top.ts`, `hooks/use-page-transition.ts`, `lib/config/tabs.ts`, `lib/config/desktop-windows.ts`, `lib/config/desktop-windows.test.ts`, `shared/ui/ascii-skeleton.tsx`, `shared/ui/strip-band.tsx`.

**Interfaces:**
- Consumes: `WorkspaceProvider`, `Desktop`, `TopBar`, `Launcher`, `useWmKeys`, `useAppearance`, `WallpaperLayer`.

- [ ] **Step 1: Rewrite `PortfolioShell`**

Structure:
- Always render the route `children` in a `max-md:` stacked container (mode 1) and as the no-JS/pre-hydration static frame on desktop (mode 2). Gate the WM behind a `mounted` flag (set true in `useEffect`) AND `md+` so it only takes over client-side on desktop.
- When mounted+desktop: render `WorkspaceProvider` (seed = the current route's content app id + light decor `clock`,`fetch`; build the seed `layout` as a mosaic tree of those instance ids), `TopBar`, `Desktop`, `Launcher`, wallpaper layer; call `useWmKeys`. Hide the mode-2 static frame.
- Map the current route → entry app id via `usePathname` (`/`→about, `/posts`→posts, `/experience`→experience, `/contact`→contact).

```tsx
// portfolio-shell.tsx (shape — fill in JSX)
"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
// ...imports

const ROUTE_APP: Record<string, string> = {
  "/": "about", "/posts": "posts", "/experience": "experience", "/contact": "contact",
};

export const PortfolioShell: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const appearance = useAppearance();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const entryAppId = ROUTE_APP[pathname?.startsWith("/posts") ? "/posts" : pathname] ?? "about";
  const seed = useMemo(() => buildSeed(entryAppId), [entryAppId]);

  return (
    <>
      {/* Mobile (always) + desktop pre-hydration static frame */}
      <div className={mounted ? "md:hidden" : undefined}>{children}</div>

      {mounted && (
        <div className="hidden md:block">
          <WorkspaceProvider seed={seed}>
            <DesktopChrome appearance={appearance} />
          </WorkspaceProvider>
        </div>
      )}
    </>
  );
};
```

`buildSeed(entryAppId)` returns `{ workspace: 1, instances: [{id: entryAppId, appId: entryAppId}, {id:"clock",appId:"clock"}, {id:"fetch",appId:"fetch"}], layout: { direction:"row", first: entryAppId, second: { direction:"column", first:"clock", second:"fetch" } } }`.

`DesktopChrome` is a small inline component that holds launcher open-state, calls `useWmKeys({ toggleLauncher })`, and renders `WallpaperLayer` (with `appearance.wallpaperId`), `TopBar`, `Desktop`, `Launcher`, and the CRT overlay.

- [ ] **Step 2: Delete the dead files** (listed above). After each batch, run the build to catch stragglers.

- [ ] **Step 3: Run the full unit suite**

Run: `pnpm test`
Expected: PASS (no references to deleted providers; fix any import stragglers).

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "rewrite shell into render-mode desktop, remove old shell chrome"
```

---

## Task 15: Remove projects (orphaned code)

**Files:**
- Delete: `components/sections/projects-section.tsx`, `components/sections/project-row.tsx`
- Modify: `shared/types/portfolio/index.ts` (remove `Project`, `"projects"` from `SectionKey`), `content/portfolio/portfolio-content.ts` (remove `projects`), `src/features/portfolio/index.ts` (remove exports).

- [ ] **Step 1: Confirm no live consumers**

Run: `grep -rn "projects\|Project\b\|ProjectRow\|ProjectsSection" src app`
Expected: only the files above. If anything else references it, stop and report.

- [ ] **Step 2: Delete + prune types/data/exports.**

- [ ] **Step 3: Build + test**

Run: `pnpm build && pnpm test`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "remove orphaned projects section"
```

---

## Task 16: E2E

**Files:**
- Create/modify: `e2e/` (match existing Playwright layout — check `playwright.config`).

- [ ] **Step 1: Write the e2e specs**

- Deep link: visit `/posts/<known-slug>` → article text visible (mode 2 SSR, before/after hydrate).
- Top-bar nav: on desktop viewport, click the `posts` entry → a posts window appears.
- Workspace switch: press `Alt+2` → the posts window is gone; `Alt+1` → it returns.
- Terminal: press `Alt+Q` twice → two terminal windows.

- [ ] **Step 2: Run**

Run: `pnpm test:e2e`
Expected: PASS. Use a `md+` viewport for WM specs; a narrow viewport to assert the stacked page shows no mosaic.

- [ ] **Step 3: Commit**

```bash
git add e2e/
git commit -m "add workspace desktop e2e coverage"
```

---

## Self-Review Notes (carry into execution)

- **react-mosaic CSS/theming** (Task 8/13): the default mosaic theme will clash; a styling pass (hide default toolbar, restyle split handles to the terminal palette) may be needed. Budget time; it is presentational, covered by manual/e2e check, not unit tests.
- **posts/experience data in the registry** (Task 3): resolve the client-data approach early — it unblocks the launcher opening those apps. If server-only data forces option (b), the launcher entry must trigger navigation rather than an in-place window for those two; note the deviation.
- **Mode 2 ↔ Mode 3 swap** (Task 14): the `md:hidden` / `hidden md:block` split avoids a desktop flash; verify on a real desktop load that content does not pop.
