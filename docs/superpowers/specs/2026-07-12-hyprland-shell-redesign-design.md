# Hyprland Shell Redesign — Design Spec

Date: 2026-07-12
Branch: feat/hyprland-workspace-redesign

## Problem

The desktop shell reads flat and disconnected. Overlays (dashboard, palette, quick menu) float as bordered boxes over the wall instead of feeling extruded from one continuous outer shell. The beige scheme is a washed-out paper tone with little visual layering. The rail is a static icon strip with no live state. Target aesthetic: the referenced Hyprland rice screenshots — a warm rosy layered shell whose bars morph out of the frame with connected (inverse-radius) corners, animated tab transitions inside pull-outs, auto-resizing panels, and a rail that reflects open applications and media state.

## Approach (decided)

Restyle-in-place. Keep the existing `desktop-chrome.tsx` composition (rail + inset wall + three pull-out overlays). Achieve the "one continuous shell" illusion per-overlay with inverse corner caps, and all morph motion with framer-motion. No shell-frame re-architecture.

## Decisions log

- Beige scheme: reworked, not dropped. Moonlit stays default.
- Rail: all four enhancements (open-app indicators, hover preview popup, vertical status text, sectioned capsule layout).
- Vertical rail status source: playlist decor app's faux now-playing state via a new shared player state.
- Dashboard: four tabs — dashboard, media, performance, workspaces.
- Motion tech: add `motion` (framer-motion) dependency.
- Out of scope: mobile chrome changes, quick-menu feature growth (styling pass only), real audio playback.

## 1. Beige → "rosewater" palette rework

`app/globals.css`, `.scheme-beige` block (name/class stays `beige`; only values change — no migration of stored localStorage scheme ids).

- Surfaces move from flat paper to warm rosy-cream tiers matching the target screenshots: page/shell deepest (~`#e8d8d2` family), panel mid (~`#f3e6e0`), card light (~`#f9efe9`), inset lighter/glow (~`#fdf5f0`). Exact values tuned during implementation against the screenshots; the requirement is four visibly distinct warm tiers mapped onto the existing `--bg-0..3`/`--bg-glow` tokens.
- Accent: terracotta/brick (`--amber` ~`#a35142` family) as the single dominant accent, like the target's brown-red highlights. Other accent hues re-tuned to sit quietly in the warm range.
- Drop the `.scheme-beige .panel-chrome` navy override entirely (and the `panel-chrome` class usages remain, simply resolving to normal scheme tokens in beige). Layering now comes from surface tiers, not a contrast chrome color.
- `.scheme-beige .background-terminals` warm override stays (decor terminals keep their paper look).
- `--crest`, `--active-border`, glow RGB vars re-derived for the new palette.

No new token names. Depth comes from disciplined use of the existing `bg-0..3` ladder: shell strip = `bg-0`, overlay panels = `bg-1`, cards inside panels = `bg-2`, insets/hover = `bg-3` (all schemes, not just beige — this mapping is applied consistently during the overlay restyle).

## 2. Shell connection — inverse corner caps

New component: `src/features/portfolio/components/wm/shell-corner.tsx` — a small SVG concave quarter-circle (inverse radius) filled with the shell surface color (`bg-1`/`bg-0` token, matching the gutter). Props: `corner` (which orientation) and size.

Treatment per overlay:

- Overlay background becomes the shell surface color (`bg-bg-1`), border removed on the shell-facing edge, retained (softened) on free edges.
- A pair of `ShellCorner` caps sit at the junction where the panel meets the shell gutter — e.g. dashboard: caps at its top-left and top-right, flaring outward into the top gutter, so the panel appears to pour out of the shell skin.
- The wall inset (`desktop-chrome.tsx:71` gutter, currently `py-2.5 pr-2.5`) is normalized so every edge that hosts an overlay has a consistent gutter thickness for the caps to join (adds `pl` gutter symmetry where needed; rail side unchanged).
- Applies to: Dashboard (top), Palette (bottom), QuickMenu (right — styling pass only).

Shadows soften: replace hard drop-shadows with a lower, wider ambient shadow so panels read as raised shell material rather than floating cards.

## 3. Top dashboard — four tabs, animated

`dashboard.tsx` rework. Tabs: `dashboard | media | performance | workspaces`.

- Tab row: active pill indicator animated between tabs via framer-motion `layoutId`.
- Tab content: `AnimatePresence` cross-fade + slight y-shift; panel height animates to measured content height (motion `animate={{ height }}` on a measured wrapper) so the panel auto-resizes per tab.
- Open/close: panel slides down from the top shell strip with spring + fade (`AnimatePresence` on `open` instead of `if (!open) return null`).
- **dashboard tab**: existing identity + ~/now cards, restyled to the new surface ladder.
- **media tab**: album-art block (tinted placeholder tile — per-track tint + large initial glyph, no image assets), track title, artist, prev/play-pause/next buttons. Backed by PlayerProvider (below).
- **performance tab**: faux btop-style gauges — 3–4 labeled bars (cpu, mem, disk, net) with gently animating widths from a deterministic pseudo-random walk (no real metrics; seeded/ticked so it feels alive).
- **workspaces tab**: existing grid, restyled.

### PlayerProvider (shared faux player state)

New: `src/features/portfolio/providers/player-context.tsx` + track list data in `src/content/portfolio/portfolio-content.ts` (title, artist, album, length; ~5 static tracks). State: `trackIndex`, `playing`; actions: `toggle`, `next`, `prev`. Elapsed-time feel optional/simple (not a real clock requirement). Consumers: dashboard media tab, rail vertical status + hover popup, playlist background panel (its hardcoded now-playing footer reads from context when available, falls back to static for SSR/background render). Mounted inside `DesktopChrome` (desktop only).

## 4. Bottom palette — internal menus, auto-resize morph

`palette.tsx` rework.

- Stays command-driven. `>wallpaper` thumbnail strip exists; add `>theme` scheme-selector strip: one swatch card per scheme showing a mini palette preview (stacked bg-tier chips + accent dot), scheme name, current scheme ringed. Selecting applies scheme, closes palette. Built in `palette-items.ts` as a new item kind `scheme` alongside `wallpaper`; strip mode generalizes from "all wallpaper" to "all wallpaper or all scheme".
- Panel geometry: flush with the bottom shell strip (no bottom border, shell surface color) + inverse corner caps at its bottom-left/bottom-right junctions.
- Morph: framer-motion animates panel height (and width if modes differ) as content switches between search rows / wallpaper strip / theme strip / no-matches, so it visibly auto-resizes rather than jumping.
- Open/close: rises from the bottom strip with spring + fade.
- Row list restyled to the surface ladder (highlight = `bg-3` inset, kind chips as small capsules).

## 5. Rail — sectioned tray

`rail.tsx` rework; width 52px → ~56px.

- **Capsule clusters**: grouped sub-backgrounds (`rounded-full bg-bg-2` vertical capsules with inner padding) like the target rice:
  - Top capsule: ✦ logo + workspace numbers 1–4.
  - App capsule: content-app launchers + search trigger.
  - Bottom capsule: clock (hh/mm), user chip, leader indicator.
- **Open-app indicators**: small dot beneath each app icon when that app is open on the active workspace (`workspaceApps`-style lookup from workspace state); amber dot + tinted icon when focused. Click keeps current openApp behavior (opens or focuses).
- **Vertical status text**: between app capsule and bottom capsule, `writing-mode: vertical-rl` truncated line from PlayerProvider — `(paused) Track — Artist` — rendered only when the player has state worth showing (playlist app open on any workspace, or user has interacted with player). Subtle `fg-2` tone.
- **Hover preview popup**: hovering the vertical status (or the playlist app icon) shows a richer popup panel to the right: album block, track/artist lines, prev/play/next controls wired to PlayerProvider. Replaces plain tooltip for that item; other app icons keep simple tooltips. Implemented as one `RailPreview` sub-file if it doesn't fit cleanly inline (respecting one-component-per-file convention: `rail-preview.tsx`).

## 6. Motion foundation

- Add `motion` dependency (framer-motion, latest v11+ `motion` package).
- New `src/features/portfolio/lib/wm/transitions.ts`: shared spring/easing tokens (e.g. `shellSpring`, `fadeShift`) so dashboard, palette, rail popup, and tab morphs share one motion character.
- All animated components respect reduced motion via `useReducedMotion` (fall back to instant/opacity-only).

## Testing

- Unit: player context reducer behavior (toggle/next/prev wraparound); `buildPaletteItems` `>theme` items + generalized strip-mode detection; rail open-app indicator derivation (pure helper).
- Existing tests touching palette/dashboard/rail updated for new markup.
- Visual: manual pass on dev server across all three schemes, reduced-motion check.

## Risks / notes

- framer-motion + React 19 / Next 16: verify compatibility at install; if the `motion` package misbehaves with this Next version, fall back is CSS-based morphs (explicitly a fallback, not the plan).
- `AnimatePresence` replaces several `if (!open) return null` mounts and keyed remounts (`palette-${...}` key in `desktop-chrome.tsx:111`); focus-on-mount logic in Palette must be preserved through the new mount lifecycle.
- Corner caps must track the shell surface token per scheme (SVG `fill: var(--bg-1)` style, not hardcoded).
