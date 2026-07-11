"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import type {
  WorkspaceId,
  WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";
import {
  neighborInDirection,
  type Direction,
} from "@/src/features/portfolio/lib/wm/mosaic-geometry";
import type { KeymapState } from "@/src/features/portfolio/hooks/use-keymap";
import type {
  Binding,
  KeymapActionId,
} from "@/src/features/portfolio/lib/config/keymap.config";

interface Options {
  keymap: KeymapState;
  toggleLauncher: () => void;
  toggleKeymapPanel: () => void;
}

const ARM_TIMEOUT_MS = 1500;
const BARE_MODIFIERS = ["Control", "Alt", "Shift", "Meta"];

/** A combo matches when its key and exact modifier set match the event. */
const matches = (e: KeyboardEvent, b: Binding): boolean => {
  if (e.key.toLowerCase() !== b.key.toLowerCase()) return false;
  const want = new Set(b.mods ?? []);
  return (
    e.ctrlKey === want.has("ctrl") &&
    e.altKey === want.has("alt") &&
    e.shiftKey === want.has("shift") &&
    e.metaKey === want.has("meta")
  );
};

/**
 * Leader-key state machine. Idle → press the leader to arm (tmux-style) → the
 * next key runs the matching `leader: true` action. Custom `leader: false`
 * binds fire directly from Idle. Returns `armed` for the rail's leader indicator and a
 * `leaderHeld` ref the desktop reads at mousedown to gate leader+drag gestures.
 * Honors the INPUT/TEXTAREA guard so typing never triggers actions.
 */
interface UseWmKeysResult {
  armed: boolean;
  leaderHeld: RefObject<boolean>;
}

const TAP_WINDOW_MS = 400;

export function useWmKeys(opts: Options): UseWmKeysResult {
  const { state, switchWorkspace, openApp, closeApp, focusApp } = useWorkspace();
  const [armed, setArmed] = useState(false);
  const leaderHeld = useRef(false);

  // The single keydown listener is installed once; it reads the latest props
  // and workspace API through this ref to avoid re-subscribing every render.
  const ctx = useRef<{
    keymap: KeymapState;
    toggleLauncher: () => void;
    toggleKeymapPanel: () => void;
    focused: string | null;
    activeLayout: WorkspaceState["layouts"][WorkspaceId];
    switchWorkspace: (id: WorkspaceId) => void;
    openApp: (id: string) => void;
    closeApp: (id: string) => void;
    focusApp: (id: string) => void;
  }>(null!);
  // Keep the latest props/workspace API in the ref so the listener reads fresh
  // values without re-subscribing on every render.
  useEffect(() => {
    ctx.current = {
      keymap: opts.keymap,
      toggleLauncher: opts.toggleLauncher,
      toggleKeymapPanel: opts.toggleKeymapPanel,
      focused: state.focused,
      activeLayout: state.layouts[state.active],
      switchWorkspace,
      openApp,
      closeApp,
      focusApp,
    };
  });

  useEffect(() => {
    let isArmed = false;
    // Whether the leader key is physically held, and whether a command fired
    // during that hold — the two flags that separate hold-mode from tap-mode.
    let held = false;
    let usedWhileHeld = false;
    let armedAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const disarm = () => {
      isArmed = false;
      held = false;
      leaderHeld.current = false;
      usedWhileHeld = false;
      if (timer) clearTimeout(timer);
      timer = undefined;
      setArmed(false);
    };

    const focusDir = (dir: Direction) => {
      const c = ctx.current;
      if (!c.focused) return;
      const next = neighborInDirection(c.activeLayout, c.focused, dir);
      if (next) c.focusApp(next);
    };

    const runAction = (id: KeymapActionId) => {
      const c = ctx.current;
      switch (id) {
        case "workspace-1":
        case "workspace-2":
        case "workspace-3":
        case "workspace-4":
          c.switchWorkspace(Number(id.slice(-1)) as WorkspaceId);
          break;
        case "new-terminal":
          c.openApp("terminal");
          break;
        case "close-window":
          if (c.focused) c.closeApp(c.focused);
          break;
        case "focus-left":
          focusDir("left");
          break;
        case "focus-right":
          focusDir("right");
          break;
        case "focus-up":
          focusDir("up");
          break;
        case "focus-down":
          focusDir("down");
          break;
        case "launcher":
          c.toggleLauncher();
          break;
        case "help":
          c.toggleKeymapPanel();
          break;
      }
    };

    const isLeaderKey = (e: KeyboardEvent) =>
      e.key.toLowerCase() === ctx.current.keymap.leader.key.toLowerCase();

    const onKey = (e: KeyboardEvent) => {
      // Ignore auto-repeat so a held key fires once, not continuously.
      if (e.repeat) return;

      const c = ctx.current;
      const t = e.target as HTMLElement | null;
      const inField = t?.tagName === "INPUT" || t?.tagName === "TEXTAREA";

      // Armed: a command key resolves the chord. While the leader is held we
      // stay armed so the next command key fires too (hold-mode); on a tap we
      // disarm after one command (sequential mode).
      if (isArmed) {
        if (BARE_MODIFIERS.includes(e.key)) return;
        if (isLeaderKey(e)) return; // leader re-press while armed — ignore
        const entry = Object.entries(c.keymap.bindings).find(
          ([, b]) => b.leader && e.key.toLowerCase() === b.key.toLowerCase(),
        );
        if (entry) {
          e.preventDefault();
          runAction(entry[0] as KeymapActionId);
        }
        if (held) {
          if (entry) usedWhileHeld = true;
          if (timer) clearTimeout(timer);
          timer = undefined;
          return; // keep armed until the leader is released
        }
        disarm();
        return;
      }

      if (inField) return;

      // Idle: the leader key arms the chord (held or tapped).
      if (matches(e, c.keymap.leader)) {
        e.preventDefault();
        isArmed = true;
        held = true;
        leaderHeld.current = true;
        usedWhileHeld = false;
        armedAt = Date.now();
        setArmed(true);
        if (timer) clearTimeout(timer);
        timer = undefined;
        return;
      }

      // Idle: custom non-leader binds fire directly.
      for (const [id, b] of Object.entries(c.keymap.bindings)) {
        if (!b.leader && matches(e, b)) {
          e.preventDefault();
          runAction(id as KeymapActionId);
          return;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isLeaderKey(e)) return;
      held = false;
      leaderHeld.current = false;
      // A held chord (used at least one command) ends on release.
      if (usedWhileHeld) {
        disarm();
        return;
      }
      // A quick tap opens the sequential window for the next command key; a
      // longer hold (e.g. a leader+mouse gesture) just disarms on release.
      if (isArmed && Date.now() - armedAt < TAP_WINDOW_MS) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(disarm, ARM_TIMEOUT_MS);
      } else {
        disarm();
      }
    };

    // Losing focus while holding the leader would otherwise strand us armed.
    const onBlur = () => disarm();

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { armed, leaderHeld };
}
