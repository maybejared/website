# Hyprland-style Workspace Redesign

## Goal

Replace the terminal-tab portfolio shell with a Hyprland/sketchybar-style
desktop: tiling windows, multiple workspaces, a rofi-style launcher, keyboard
shortcuts, and a top-bar that doubles as the primary navigation and the theme
control panel. Real content (about, posts, experience, contact) stays navigable
and crawlable; the window manager is a presentation layer over real routes.
Narrow screens drop the WM entirely for plain stacked pages.

Domain vocabulary lives in `/CONTEXT.md` — read it alongside this spec.

## Decisions (locked)

1. **WM is a skin over real routes.** `/`, `/posts`, `/posts/[slug]`,
   `/experience`, `/contact` stay real Next routes that server-render their
   content (SEO, no-JS, crawlable, deep-linkable). The WM hydrates on top.
2. **Drag/resize, no layout persistence.** Users tile/resize/open/close windows
   via react-mosaic. Layout lives in React state only; resets on reload. (Theme
   *is* persisted — see decision 9 — but layout is not.)
3. **Mobile = plain stacked pages.** Below `md` the WM never mounts. The route's
   content renders as a normal scrolling page with a simple top menu.
4. **Layout engine: react-mosaic-component 6.2.0.** Tiling binary-tree, drag to
   split/resize, never overlaps. Peer `>=16`, works with React 19. Pulls
   `react-dnd`.
5. **URL coupling = entry point only.** Server renders the route's content; on
   hydrate it becomes the first window. The WM then owns window state and does
   NOT push URL on open/close — EXCEPT canonical content navigation (opening a
   post pushes `/posts/[slug]`, which `PostsSection` already does via
   `router.push`). Decor windows never touch the URL.
6. **Master-detail stays one app.** `posts` and `experience` each render their
   existing `MasterDetail` component (list + detail internal panes) inside a
   single window. There is NO separate `reader` app — the reader is the detail
   pane, exactly as `/posts/[slug]` already renders it. Reuses the working
   selection / deep-link / keyboard code intact.
7. **Workspaces are free-form, not route-bound.** A route only seeds the initial
   window. Workspaces 1–4 are independent desktops the user fills via the top
   bar / launcher.
8. **Top bar is the navigation** (the desktop dock is removed). Carries:
   workspace pills `1 2 3 4` (clickable), a launcher button, the four content
   apps as clickable entries (the discoverable content nav), the theme control
   panel, and clock/tray. Decor apps appear only in the launcher.
9. **Theme is decoupled and persisted.** Scheme (colours) and Wallpaper become
   independent selections; `{ scheme, wallpaperId }` persists in localStorage.
   Wallpaper gains a flat "none" option. The theme control panel is a single
   top-bar popover holding both.
10. **Apps are singleton, except the terminal.** Content + most decor are
    singletons (re-open focuses the existing window, switching workspace if
    needed). The terminal app is multi-instance. This requires an instance-id
    layer (decision 11).
11. **Instance-id layer.** Mosaic leaves are instance ids, with a map
    `instanceId → appId`. Singletons use `instanceId === appId`; terminals use
    `terminal:1`, `terminal:2`, … The registry's `render(ctx)` receives the
    instance id (the seam a future interactive terminal uses for per-instance
    state).
12. **Deletions.** Crossfade/transition layer, boot/scramble intro, old shell
    chrome (TitleBar, TabBar, StatusBar, centered window), desktop dock, global
    SelectionProvider, and the orphaned projects code (see Deletions).

## Architecture

```
app/*/page.tsx           server-renders the route's content app
  └─ PortfolioShell      client; branches on breakpoint
       ├─ (max-md) stacked page + simple top menu      [render mode 1]
       └─ (md+) Desktop
            ├─ TopBar    nav + workspace pills + launcher btn + theme panel
            ├─ pre-hydration / no-JS: content app in a static window frame  [mode 2]
            └─ hydrated: WorkspaceProvider                                  [mode 3]
                 └─ react-mosaic tree per workspace
                      └─ WindowFrame (terminal chrome)
                           └─ app.render({ instanceId })
```

### Render modes (decision 5 + 3-mode model)

One shared content component reaches the screen three ways:
1. **Mobile** (`max-md`) — plain stacked page, no WM. SSR == client.
2. **Desktop pre-hydration / no-JS** — content app in a static (non-draggable)
   window frame. Full content, crawlable.
3. **Desktop hydrated** — react-mosaic mounts; the route's content app is the
   initial tile. Mode 2 → mode 3 is "single static window" → "mosaic single
   tile", visually near-identical, so no jarring flash.

### App registry — `lib/config/apps.config.ts`

Replaces both `tabs.ts` and `desktop-windows.ts`.

```ts
type AppKind = "content" | "decor";
interface AppMeta {
  id: AppId;
  title: string;        // terminal-style window title
  label: string;        // top-bar / launcher label
  icon: string;
  tint: string;
  kind: AppKind;
  href?: string;        // content apps with a canonical route
  multiInstance?: boolean;            // terminal only
  render: (ctx: { instanceId: string }) => ReactNode;
}
```

- **Content apps:** `about`, `experience`, `posts`, `contact` (wrap existing
  section components).
- **Decor apps:** `btop`, `cava`/scramble, `clock`, `fetch`, `vim`, `playlist`,
  `imv`, `terminal` — wrap existing background panels as window bodies.

### WorkspaceProvider — `providers/workspace-provider.tsx`

Replaces `WindowManagerProvider`. Reducer state:

```ts
interface WorkspaceState {
  active: WorkspaceId;                              // 1..4
  layouts: Record<WorkspaceId, MosaicNode<string> | null>;  // leaves = instanceId
  instances: Record<string, AppId>;                // instanceId → appId
  focused: string | null;                          // instanceId
}
```

Actions: `switchWorkspace`, `openApp(appId)` (singleton → focus existing across
workspaces, switching if needed; multiInstance → mint new instance id, insert,
focus; push URL if the app has `href` and is canonical content), `closeApp`,
`focusApp`, `setLayout` (mosaic drag/resize callback). In-memory only.

Workspace 1 seeded on load with the entry route's content app as the dominant
tile + 1–2 light decor tiles (clock, fetch). Workspaces 2–4 empty.

### WindowFrame — `components/window-frame.tsx`

Bridges react-mosaic's `MosaicWindow` to the `faux-terminal` look: terminal
title bar (title + close) as toolbar, app body below. Exposes per-window focus
state (consumed by master-detail keyboard scoping). CRT scanline overlay stays
once at the desktop root.

### Top bar (decision 8)

- **Left:** workspace pills `1 2 3 4` (clickable, active lit) · launcher button
  (`◆ apps`).
- **Center-left:** content apps `about · posts · experience · contact` —
  clickable entries that open/focus that window. The discoverable content nav.
- **Right:** theme control panel popover · clock · faux tray · user handle.

Extends the existing `DesktopTopBar` (currently `pointer-events-none`
decoration) into an interactive bar.

### Launcher — `components/launcher.tsx`

Rofi-style palette over the whole registry (content + decor). Trigger:
`Alt+Space` and the top-bar button. Fuzzy filter + keyboard nav via the existing
`use-list-navigation` hook. Enter opens into the active workspace.

### Keybindings — `hooks/use-wm-keys.ts` (replaces `use-route-tab-keys`)

| Key | Action |
|---|---|
| `Alt+1..4` | switch workspace |
| `Alt+Q` | new terminal instance |
| `Alt+W` | close focused window |
| `Alt+Space` | toggle launcher |

Theme panel is click-only. Single keydown listener dispatching reducer actions.

### Theme control panel (decision 9)

Top-bar popover with two parts: scheme selector (reuse `useScheme` /
`scheme-menu`) + wallpaper picker. Wallpaper data is reshaped from per-scheme map
→ flat selectable list with a "none" option. A `useAppearance` hook owns
`{ scheme, wallpaperId }`, hydrated from + written to localStorage. The `imv`
decor app mirrors the selected wallpaper.

### Terminal expansion seam (built decorative, not interactive)

Build now: a decorative faux-terminal body (fastfetch output), multi-instance.
Seams for a future interactive shell, no REPL code now:
1. Instance-id layer (decision 11) gives each terminal window its own identity.
2. `render({ instanceId })` lets a future shell key per-instance state.
3. Terminal lives in its own module (`apps/terminal/`) for the future command
   registry + parser + shell body.
Out of scope now: command parser, registry, history, interactive body.

### Mobile (decision 3)

`PortfolioShell` branches on a media query. Below `md`: render the route's
content app as a plain stacked page + a simple top menu linking the four routes
+ a minimal theme toggle. react-mosaic / WorkspaceProvider not mounted. Builds
on the existing `max-md` fallback styles.

## Data flow

1. `/posts` → server renders `PostsSection` HTML (mode 2 / SEO).
2. Hydrate (md+) → `WorkspaceProvider` mounts; posts becomes the focused tile in
   workspace 1 alongside seeded decor.
3. Click a post → `PostsSection` `router.push('/posts/[slug]')`; the detail pane
   shows the article. Back button returns to `/posts`. (No new window — same app.)
4. `Alt+Space` → pick `btop` → singleton decor window tiles in; no URL change.
5. `Alt+Q` → new `terminal:N` window. `Alt+2` → workspace 2's tree renders.

## Keyboard scoping (refactor)

Master-detail sections (`posts`, `experience`) attach window-level keydown
listeners today. In a multi-window desktop, arrow/Enter must fire only for the
focused window. Each section gates its listener on `WindowFrame` focus state.
Mechanical but touches every master-detail section. Selection state is already
local to each section (`highlight`), so removing the global `SelectionProvider`
needs no replacement.

## Deletions

- `usePageTransition`, `AsciiSkeleton` crossfade usage, `StripBand` transition
  layer.
- Boot/scramble intro: `BootOverlay`, `use-intro-sequence`, `use-cover-top`.
- Old shell chrome: `TitleBar`, `TabBar` (`use-route-tab-keys`), `StatusBar`,
  the centered bordered terminal-shell wrapper.
- `DesktopDock` (+ test).
- `SelectionProvider` + all `useReportSelection` calls.
- `desktop-windows.ts` (folded into `apps.config.ts`).
- `tabs.ts` (folded into `apps.config.ts` / top bar).
- `WindowManagerProvider` (replaced by `WorkspaceProvider`).
- Orphaned projects code (authorized): `projects-section.tsx`,
  `project-row.tsx`, the `Project` type in `shared/types/portfolio`, the
  projects data in `portfolio-content.ts`, and any `index.ts` exports. Verify no
  live consumers before each removal.

Background panel components themselves are reused as decor app bodies — only the
old wrappers/orchestration are deleted.

## Additions

- `lib/config/apps.config.ts`, `providers/workspace-provider.tsx`,
  `components/window-frame.tsx`, `components/launcher.tsx`,
  `hooks/use-wm-keys.ts`, `hooks/use-appearance.ts`, interactive top bar +
  theme control panel popover, `apps/terminal/` module.
- deps: `react-mosaic-component@6.2.0`, `react-dnd` (transitive).
- Reshaped `wallpapers.ts` (per-scheme map → flat list + "none").

## Testing

Only real logic:
- Workspace reducer: switch / openApp (singleton focus-vs-mint, cross-workspace
  focus) / closeApp / focusApp / setLayout — unit.
- App registry: resolves and renders every app id; `multiInstance` honored — unit.
- Launcher: fuzzy filter + keyboard nav — unit (reuse `use-list-navigation`).
- `use-wm-keys`: each binding dispatches the right action — unit.
- `useAppearance`: persists + rehydrates `{ scheme, wallpaperId }` — unit.
- Keyboard scoping: a master-detail window ignores arrow keys when unfocused — unit.
- Playwright e2e: deep-link `/posts/[slug]` renders the article; top-bar `posts`
  opens the window; `Alt+2` switches workspace; `Alt+Q` spawns a second terminal.

Do NOT test react-mosaic internals.

## Risks

- react-mosaic theming to match the terminal aesthetic is real CSS work.
- The wallpaper decouple touches files already in the working diff
  (`wallpapers.ts`, `wallpaper-layer`, `use-wallpaper-crossfade`,
  `use-wallpaper-enabled`, `image-viewer-panel`) — expect conflicts.
- `react-dnd` HTML5 backend is desktop-only; fine since the WM is md+ only.

## Out of scope (YAGNI)

Layout persistence, layout export/import, per-window URL for every app, window
minimise/maximise animations, a help/keymap overlay, touch drag on mobile, the
interactive terminal REPL (seam provided), a `projects` content app.
