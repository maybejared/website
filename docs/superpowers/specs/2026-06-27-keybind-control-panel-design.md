# Keybind Control Panel + Leader-Key Remapping

## Goal

Replace the WM's hardcoded `Alt+*` keymap — which collides with OS hotkey
daemons (skhd/yabai, Hammerspoon) — with a leader-key model, a single
remappable keymap registry, and a control-panel overlay that lists every
binding and lets the user rebind by pressing the desired combo. Defaults are
collision-free out of the box; everything is remappable and persisted.

Builds on the window-manager redesign (`docs/superpowers/specs/2026-06-26-hyprland-workspace-redesign-design.md`).
Domain vocabulary lives in `/CONTEXT.md`.

## Why not "full key absorption"

A web page cannot exclusively grab keys the way a real WM does. OS hotkey
daemons (skhd/yabai) tap the event stream above the browser process, so a key
they bind globally never reaches the page — no web API overrides that.
Fullscreen + Keyboard Lock only reclaims *browser*-reserved keys, is
Chromium-only, and still loses to OS daemons. The realistic fix is therefore
**collision avoidance + remapping**, not absorption. Immersive/Keyboard-Lock
mode is explicitly out of scope.

## Decisions (locked)

1. **Leader-key model, fully remappable.** Press a leader, then a command key
   (tmux-style); the chord only arms after the leader, so it does not collide
   with held-modifier OS binds. Every action is remappable.
2. **Press-the-combo capture** for rebinding, with validation (reject
   browser-reserved combos, block duplicates).
3. **Centered overlay** control panel, opened by `?` (desktop-focused) and a
   top-bar button. Desktop (lg+) only — mobile has no keys.
4. **No immersive mode** (no Fullscreen/Keyboard-Lock).
5. **Replaces** the current `Alt+*` keymap; the launcher trigger moves from
   `Alt+Space` to `leader → space`.

## Architecture

```
lib/config/keymap.config.ts   default keymap (actions + default bindings)
  └─ hooks/use-keymap.ts       active bindings (defaults ⊕ localStorage), edit API
       ├─ hooks/use-wm-keys.ts   leader state machine; dispatches workspace actions
       └─ components/wm/keymap-panel.tsx   overlay: list + press-to-capture rebind
```

### Keymap registry — `lib/config/keymap.config.ts`

```ts
export type KeymapMod = "ctrl" | "alt" | "shift" | "meta";
export interface Binding {
  /** When true, the combo only fires after the leader key is armed. */
  leader: boolean;
  /** The KeyboardEvent.key value, lowercased (e.g. "1", "q", " "). */
  key: string;
  /** Held modifiers (used by custom non-leader rebinds). */
  mods?: KeymapMod[];
}
export interface KeymapAction {
  id: KeymapActionId;          // "workspace-1".."workspace-4", "new-terminal", "close-window", "launcher", "help"
  label: string;               // e.g. "Workspace 2"
  description: string;
  default: Binding;
}
export const LEADER_DEFAULT: Binding;      // backtick "`"
export const KEYMAP_ACTIONS: KeymapAction[];
```

Default bindings (all `leader: true`): workspace 1–4 → `1`/`2`/`3`/`4`,
new-terminal → `q`, close-window → `w`, launcher → `space`, help → `?`. The
**leader itself** is a binding (`LEADER_DEFAULT` = backtick) and is remappable.

### `use-keymap.ts`

Owns the active keymap = defaults overlaid with a `portfolio:keymap`
localStorage map (`actionId → Binding`, plus a `leader` entry). Mirrors
`useAppearance`'s persistence shape. Exposes:

```ts
{
  leader: Binding;
  bindings: Record<KeymapActionId, Binding>;
  setBinding(id: KeymapActionId | "leader", combo: Binding): void;
  reset(): void;
  findConflict(combo: Binding, exceptId?: string): KeymapActionId | "leader" | null;
  isReserved(combo: Binding): boolean;   // browser/OS-reserved, uncapturable
  format(combo: Binding): string;        // human label, e.g. "leader → 2", "`"
}
```

`isReserved` flags combos the browser/OS will eat (e.g. `meta`+`w/t/n/q`,
`meta`+space, lone `meta`/`ctrl`+`tab`) so the panel can refuse them.

### `use-wm-keys.ts` (rewritten) — leader state machine

A single keydown listener with a small state machine:

- Idle → on a keydown matching `leader` (and not in an INPUT/TEXTAREA, desktop
  focused): `preventDefault`, enter **Armed**, start a ~1500ms timer, surface
  an "armed" signal (for the indicator).
- Armed → next keydown: if it matches a `leader: true` action binding, run that
  action and return to Idle; any other key (or timeout) cancels to Idle.
- Custom non-leader bindings (`leader: false`, with `mods`) are matched directly
  in Idle, honoring the INPUT guard (no action fires while typing in an
  INPUT/TEXTAREA). The launcher and panel close via Escape, so no from-input
  toggle carve-out is needed under the leader defaults.

`useWmKeys` consumes `use-keymap` for the active bindings and `useWorkspace`
for the actions (`switchWorkspace`, `openApp("terminal")`, `closeApp(focused)`),
plus `toggleLauncher` and `toggleKeymapPanel` callbacks passed in. It returns an
`armed: boolean` (or invokes an `onArmedChange`) so the top bar can render the
indicator.

### Leader indicator

While armed, the top bar shows a subtle `leader…` chip. Minimal — a single
conditional element, cleared on resolve/cancel.

### Control panel — `components/wm/keymap-panel.tsx`

`KeymapPanel: FC<{ open; onClose }>`. Centered terminal-styled modal:

- One row per `KEYMAP_ACTIONS` entry + the leader row: label, description,
  current binding (`format`), and a **Rebind** affordance.
- **Press-to-capture:** clicking Rebind enters capture mode for that row; the
  next key/combo is read from a scoped keydown. On capture:
  - `isReserved` → show "that combo is reserved by the browser/OS" and keep the
    old binding.
  - `findConflict` (excluding the row itself) → show "already bound to <action>"
    and block until changed.
  - otherwise → `setBinding`.
- **Reset to defaults** button → `reset()`.
- Opened via `?` (desktop-focused, through the keymap) and a top-bar button.
  Escape / outside-click closes. Reuse the existing overlay/`use-list-navigation`
  and outside-click idioms where they fit.

### Top bar + shell wiring

- Add a keymap-panel button to `TopBar` (next to the launcher/theme controls).
- `DesktopChrome` holds the panel open-state alongside the launcher state, wires
  `useWmKeys({ toggleLauncher, toggleKeymapPanel })`, renders `<KeymapPanel>`,
  and passes the `armed` flag to `TopBar` for the indicator.
- Desktop (lg+) only — consistent with the rest of the WM. No mobile surface.

## Data flow

1. Load → `use-keymap` reads defaults ⊕ `portfolio:keymap`.
2. User presses backtick on the desktop → `useWmKeys` arms; top bar shows
   `leader…`.
3. User presses `2` within the window → `switchWorkspace(2)`; disarm.
4. User opens the panel (`?` or button), Rebind "new terminal", presses `t` →
   capture validates (not reserved, no conflict) → `setBinding("new-terminal",
   { leader: true, key: "t" })` → persisted. `leader → t` now spawns a terminal.
5. Reset → clears overrides, back to defaults.

## Testing

- `keymap.config` + `use-keymap`: defaults resolve; override merge; `reset`
  restores; `findConflict` detects duplicates; `isReserved` flags known
  combos — unit.
- `use-wm-keys` leader machine: leader→mapped key fires the action;
  timeout cancels; unmapped key cancels; INPUT guard honored; launcher
  carve-out preserved — unit (fake timers for the timeout).
- `KeymapPanel`: renders every action + leader row; capture sets a binding;
  reserved combo rejected; duplicate rejected; reset works — render test.
- e2e (desktop viewport): `` ` `` then `2` switches workspace; `?` opens the
  panel; rebind an action and confirm the new combo triggers it.

## Deletions / migrations

- The hardcoded `Alt+*` logic in `use-wm-keys.ts` is replaced by the keymap +
  state machine.
- `Alt+Space` launcher trigger → `leader → space`. Update the launcher e2e/any
  reference and the keymap defaults accordingly.

## Out of scope (YAGNI)

Immersive/Keyboard-Lock mode, per-workspace keymaps, multi-key chord sequences
beyond one leader+key, import/export of keymaps, a mobile keybind surface.
