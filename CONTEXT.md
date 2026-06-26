# Context / Glossary

Domain language for the portfolio site. Glossary only — no implementation details.

## Terms

### App
A launchable unit shown in a window. Two kinds:
- **Content app** — backed by a real route, carries the actual portfolio
  content (about, posts, experience, contact). Server-rendered for SEO.
- **Decor app** — pure eye-candy with no route (btop, cava, clock, fetch, vim,
  playlist, imv).

### Window
A single tiled pane on the desktop, wrapping one App in terminal-style chrome.

### Workspace
One of several independent desktops (1–4). Each holds its own arrangement of
Windows. Switching Workspaces swaps the whole arrangement.

### Window frame
The terminal-style chrome (title bar + body) around an App. Has two forms that
render the same App content: the **static window frame** (server-rendered,
non-draggable, pre-hydration / no-JS) and the **mosaic tile** (client, draggable
and resizable).

### Launcher
The rofi-style command palette that fuzzy-searches Apps and opens the chosen one
into the active Workspace. Lists every App (content + decor).

### Top bar
The sketchybar-style bar that is the site's primary navigation. Carries the
Workspace pills, the launcher button, the four Content apps as clickable
entries (the discoverable content nav), the theme control, and the clock/tray.
Replaces the old desktop dock, which is removed.

### Scheme
The colour theme (beige / mono / moonlit), applied as a body class. Independent
of the Wallpaper. Persisted across reloads.

### Wallpaper
The full-bleed desktop background, chosen from an independent list (including a
flat "none" option). Decoupled from Scheme. Persisted across reloads. The `imv`
decor app mirrors the currently-selected Wallpaper.

### Theme control panel
The top-bar popover holding both the Scheme selector and the Wallpaper picker —
the one surface for appearance settings. Distinct from the Launcher (apps only).

### Instance
One live occurrence of an App in a Workspace, identified by an instance id.
Singleton Apps (all content + most decor) reuse one stable instance; the
terminal App is multi-instance (each open spawns a new one). The App registry's
`render(ctx)` receives the instance id, the seam a future interactive terminal
uses to key its per-instance state.

### Render modes
The three ways content reaches the screen, all sharing one content component:
1. **Mobile** (`max-md`) — plain stacked page, no window manager.
2. **Desktop pre-hydration / no-JS** — content app in a static window frame.
3. **Desktop hydrated** — content app as a mosaic tile in the window manager.
