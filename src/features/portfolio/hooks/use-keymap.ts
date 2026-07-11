import { useCallback, useEffect, useMemo, useState } from "react";

import {
  KEYMAP_ACTION_BY_ID,
  KEYMAP_ACTIONS,
  LEADER_DEFAULT,
} from "@/src/features/portfolio/lib/config/keymap.config";
import type {
  Binding,
  KeymapActionId,
  KeymapMod,
} from "@/src/features/portfolio/lib/config/keymap.config";

const KEY = "portfolio:keymap";

/** localStorage shape: per-action overrides plus an optional leader override. */
type StoredKeymap = Partial<Record<KeymapActionId | "leader", Binding>>;

const read = (): StoredKeymap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoredKeymap;
  } catch {}
  return {};
};

const MOD_ORDER: KeymapMod[] = ["ctrl", "alt", "shift", "meta"];
const MOD_LABEL: Record<KeymapMod, string> = {
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  meta: "Cmd",
};

const sameMods = (a?: KeymapMod[], b?: KeymapMod[]): boolean => {
  const sa = new Set(a ?? []);
  const sb = new Set(b ?? []);
  return sa.size === sb.size && [...sa].every((m) => sb.has(m));
};

export const bindingEquals = (a: Binding, b: Binding): boolean =>
  a.leader === b.leader &&
  a.key.toLowerCase() === b.key.toLowerCase() &&
  sameMods(a.mods, b.mods);

const KEY_LABELS: Record<string, string> = {
  " ": "Space",
  escape: "Esc",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  arrowdown: "↓",
};

const keyLabel = (key: string): string => {
  const named = KEY_LABELS[key.toLowerCase()];
  if (named) return named;
  return key.length === 1 ? key.toUpperCase() : key;
};

export const formatBinding = (c: Binding): string => {
  const combo = [
    ...(c.mods ?? [])
      .slice()
      .sort((a, b) => MOD_ORDER.indexOf(a) - MOD_ORDER.indexOf(b))
      .map((m) => MOD_LABEL[m]),
    keyLabel(c.key),
  ].join("+");
  return c.leader ? `leader → ${keyLabel(c.key)}` : combo;
};

/** Combos the browser or an OS hotkey daemon will eat — uncapturable. */
export const isReserved = (c: Binding): boolean => {
  const mods = new Set(c.mods ?? []);
  const k = c.key.toLowerCase();
  // A bare modifier press is not a usable binding.
  if (["control", "shift", "alt", "meta"].includes(k)) return true;
  // Tab cycles browser focus / windows.
  if (k === "tab") return true;
  // Cmd/Win combos the browser reserves for tabs, windows, address bar, etc.
  if (mods.has("meta") && ["w", "t", "n", "q", "l", " "].includes(k)) return true;
  return false;
};

export function useKeymap() {
  const [overrides, setOverrides] = useState<StoredKeymap>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(overrides));
    } catch {}
  }, [overrides]);

  const leader = overrides.leader ?? LEADER_DEFAULT;

  const bindings = useMemo(() => {
    const m = {} as Record<KeymapActionId, Binding>;
    for (const a of KEYMAP_ACTIONS) m[a.id] = overrides[a.id] ?? a.default;
    return m;
  }, [overrides]);

  const setBinding = useCallback(
    (id: KeymapActionId | "leader", combo: Binding) =>
      setOverrides((o) => ({ ...o, [id]: combo })),
    [],
  );

  const reset = useCallback(() => setOverrides({}), []);

  const findConflict = useCallback(
    (combo: Binding, exceptId?: string): KeymapActionId | "leader" | null => {
      const all: [KeymapActionId | "leader", Binding][] = [
        ["leader", leader],
        ...(Object.entries(bindings) as [KeymapActionId, Binding][]),
      ];
      for (const [id, b] of all) {
        if (id === exceptId) continue;
        if (bindingEquals(b, combo)) return id;
      }
      return null;
    },
    [leader, bindings],
  );

  return {
    leader,
    bindings,
    setBinding,
    reset,
    findConflict,
    isReserved,
    format: formatBinding,
  };
}

export type KeymapState = ReturnType<typeof useKeymap>;

/** Human label for a conflict target id, for panel messaging. */
export const conflictLabel = (id: KeymapActionId | "leader"): string =>
  id === "leader" ? "Leader" : KEYMAP_ACTION_BY_ID[id].label;
