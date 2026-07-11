"use client";

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWmKeys } from "./use-wm-keys";
import {
  KEYMAP_ACTIONS,
  LEADER_DEFAULT,
} from "@/src/features/portfolio/lib/config/keymap.config";
import type {
  Binding,
  KeymapActionId,
} from "@/src/features/portfolio/lib/config/keymap.config";
import type { KeymapState } from "@/src/features/portfolio/hooks/use-keymap";

const switchWorkspace = vi.fn();
const openApp = vi.fn();
const closeApp = vi.fn();
const focusApp = vi.fn();
const focused = "terminal:1";
// Two windows side by side: terminal:1 (left, focused) | terminal:2 (right).
const activeLayout = {
  direction: "row" as const,
  first: "terminal:1",
  second: "terminal:2",
};

vi.mock("@/src/features/portfolio/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    state: {
      focused,
      active: 1,
      layouts: { 1: activeLayout, 2: null, 3: null, 4: null },
    },
    switchWorkspace,
    openApp,
    closeApp,
    focusApp,
  }),
}));

const defaultBindings = () => {
  const m = {} as Record<KeymapActionId, Binding>;
  for (const a of KEYMAP_ACTIONS) m[a.id] = a.default;
  return m;
};

// A minimal KeymapState stub — the state machine only reads `leader`/`bindings`.
const makeKeymap = (overrides?: Partial<KeymapState>): KeymapState =>
  ({
    leader: LEADER_DEFAULT,
    bindings: defaultBindings(),
    setBinding: vi.fn(),
    reset: vi.fn(),
    findConflict: vi.fn(),
    isReserved: vi.fn(),
    format: vi.fn(),
    ...overrides,
  }) as KeymapState;

const press = (target: EventTarget, opts: KeyboardEventInit) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keydown", { ...opts, bubbles: true }));
  });

const release = (target: EventTarget, opts: KeyboardEventInit) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent("keyup", { ...opts, bubbles: true }));
  });

// Tap = press and release the leader (sequential mode); hold keeps it down.
const tapLeader = () => {
  press(window, { key: "`" });
  release(window, { key: "`" });
};
const holdLeader = () => press(window, { key: "`" });
const releaseLeader = () => release(window, { key: "`" });

function Host({
  keymap,
  toggleLauncher,
  toggleKeymapPanel,
}: {
  keymap: KeymapState;
  toggleLauncher: () => void;
  toggleKeymapPanel: () => void;
}) {
  useWmKeys({ keymap, toggleLauncher, toggleKeymapPanel });
  return null;
}

const noop = () => {};
const renderHost = (keymap: KeymapState, cbs: Partial<{ toggleLauncher: () => void; toggleKeymapPanel: () => void }> = {}) =>
  render(
    <Host
      keymap={keymap}
      toggleLauncher={cbs.toggleLauncher ?? noop}
      toggleKeymapPanel={cbs.toggleKeymapPanel ?? noop}
    />,
  );

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useWmKeys leader machine — tap mode", () => {
  it("tap leader then 2 switches to workspace 2", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "2" });
    expect(switchWorkspace).toHaveBeenCalledWith(2);
  });

  it("tap leader then q opens a terminal", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "q" });
    expect(openApp).toHaveBeenCalledWith("terminal");
  });

  it("tap leader then w closes the focused window", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "w" });
    expect(closeApp).toHaveBeenCalledWith(focused);
  });

  it("tap leader then space toggles the launcher", () => {
    const toggleLauncher = vi.fn();
    renderHost(makeKeymap(), { toggleLauncher });
    tapLeader();
    press(window, { key: " " });
    expect(toggleLauncher).toHaveBeenCalledTimes(1);
  });

  it("tap leader then ? toggles the keymap panel", () => {
    const toggleKeymapPanel = vi.fn();
    renderHost(makeKeymap(), { toggleKeymapPanel });
    tapLeader();
    press(window, { key: "?" });
    expect(toggleKeymapPanel).toHaveBeenCalledTimes(1);
  });

  it("tap leader then a command disarms — a second key does nothing", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "2" });
    press(window, { key: "3" });
    expect(switchWorkspace).toHaveBeenCalledTimes(1);
    expect(switchWorkspace).toHaveBeenCalledWith(2);
  });

  it("a key without arming the leader does nothing", () => {
    renderHost(makeKeymap());
    press(window, { key: "2" });
    expect(switchWorkspace).not.toHaveBeenCalled();
  });

  it("an unmapped key after a tap cancels without acting", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "z" });
    expect(switchWorkspace).not.toHaveBeenCalled();
    press(window, { key: "2" });
    expect(switchWorkspace).not.toHaveBeenCalled();
  });

  it("the tap window times out", () => {
    renderHost(makeKeymap());
    tapLeader();
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    press(window, { key: "2" });
    expect(switchWorkspace).not.toHaveBeenCalled();
  });

  it("the leader pressed inside an INPUT does not arm", () => {
    renderHost(makeKeymap());
    const input = document.createElement("input");
    document.body.appendChild(input);
    press(input, { key: "`" });
    release(input, { key: "`" });
    press(window, { key: "2" });
    expect(switchWorkspace).not.toHaveBeenCalled();
    input.remove();
  });
});

describe("useWmKeys leader machine — hold mode", () => {
  it("holding the leader fires multiple command keys", () => {
    renderHost(makeKeymap());
    holdLeader();
    press(window, { key: "1" });
    press(window, { key: "2" });
    press(window, { key: "3" });
    releaseLeader();
    expect(switchWorkspace.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);
  });

  it("releasing the leader after a held command disarms", () => {
    renderHost(makeKeymap());
    holdLeader();
    press(window, { key: "1" });
    releaseLeader();
    // leader released — a bare key no longer fires
    press(window, { key: "2" });
    expect(switchWorkspace).toHaveBeenCalledTimes(1);
    expect(switchWorkspace).toHaveBeenCalledWith(1);
  });

  it("auto-repeat of a held command key fires only once", () => {
    renderHost(makeKeymap());
    holdLeader();
    press(window, { key: "q" });
    press(window, { key: "q", repeat: true });
    press(window, { key: "q", repeat: true });
    releaseLeader();
    expect(openApp).toHaveBeenCalledTimes(1);
  });

  it("a custom non-leader bind fires directly from idle", () => {
    const keymap = makeKeymap();
    keymap.bindings["new-terminal"] = {
      leader: false,
      key: "t",
      mods: ["ctrl", "alt"],
    };
    renderHost(keymap);
    press(window, { key: "t", ctrlKey: true, altKey: true });
    expect(openApp).toHaveBeenCalledWith("terminal");
  });
});

describe("useWmKeys leader machine — directional focus", () => {
  it("tap leader then ArrowRight focuses the window to the right", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "ArrowRight" });
    expect(focusApp).toHaveBeenCalledWith("terminal:2");
  });

  it("ArrowLeft from the leftmost window focuses nothing", () => {
    renderHost(makeKeymap());
    tapLeader();
    press(window, { key: "ArrowLeft" });
    expect(focusApp).not.toHaveBeenCalled();
  });

  it("holding the leader walks focus across keys", () => {
    renderHost(makeKeymap());
    holdLeader();
    press(window, { key: "ArrowRight" });
    releaseLeader();
    expect(focusApp).toHaveBeenCalledWith("terminal:2");
  });
});
