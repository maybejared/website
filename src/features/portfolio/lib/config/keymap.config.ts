export type KeymapMod = "ctrl" | "alt" | "shift" | "meta";

export type KeymapActionId =
  | "workspace-1"
  | "workspace-2"
  | "workspace-3"
  | "workspace-4"
  | "new-terminal"
  | "close-window"
  | "launcher"
  | "help"
  | "focus-left"
  | "focus-right"
  | "focus-up"
  | "focus-down";

export interface Binding {
  /** When true, the combo only fires after the leader key is armed. */
  leader: boolean;
  /** The KeyboardEvent.key value, lowercased (e.g. "1", "q", " "). */
  key: string;
  /** Held modifiers — only used by custom, non-leader rebinds. */
  mods?: KeymapMod[];
}

export interface KeymapAction {
  id: KeymapActionId;
  label: string;
  description: string;
  default: Binding;
}

/** The leader is itself a remappable binding — pressed directly, not armed. */
export const LEADER_DEFAULT: Binding = { leader: false, key: "`" };

export const KEYMAP_ACTIONS: KeymapAction[] = [
  {
    id: "workspace-1",
    label: "Workspace 1",
    description: "Switch to workspace 1",
    default: { leader: true, key: "1" },
  },
  {
    id: "workspace-2",
    label: "Workspace 2",
    description: "Switch to workspace 2",
    default: { leader: true, key: "2" },
  },
  {
    id: "workspace-3",
    label: "Workspace 3",
    description: "Switch to workspace 3",
    default: { leader: true, key: "3" },
  },
  {
    id: "workspace-4",
    label: "Workspace 4",
    description: "Switch to workspace 4",
    default: { leader: true, key: "4" },
  },
  {
    id: "new-terminal",
    label: "New terminal",
    description: "Open a terminal window",
    default: { leader: true, key: "q" },
  },
  {
    id: "close-window",
    label: "Close window",
    description: "Close the focused window",
    default: { leader: true, key: "w" },
  },
  {
    id: "launcher",
    label: "Search",
    description: "Open the search palette",
    default: { leader: true, key: " " },
  },
  {
    id: "help",
    label: "Keybinds",
    description: "Open this keybind panel",
    default: { leader: true, key: "?" },
  },
  {
    id: "focus-left",
    label: "Focus left",
    description: "Focus the window to the left",
    default: { leader: true, key: "arrowleft" },
  },
  {
    id: "focus-right",
    label: "Focus right",
    description: "Focus the window to the right",
    default: { leader: true, key: "arrowright" },
  },
  {
    id: "focus-up",
    label: "Focus up",
    description: "Focus the window above",
    default: { leader: true, key: "arrowup" },
  },
  {
    id: "focus-down",
    label: "Focus down",
    description: "Focus the window below",
    default: { leader: true, key: "arrowdown" },
  },
];

export const KEYMAP_ACTION_BY_ID: Record<KeymapActionId, KeymapAction> =
  Object.fromEntries(KEYMAP_ACTIONS.map((a) => [a.id, a])) as Record<
    KeymapActionId,
    KeymapAction
  >;
