import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  bindingEquals,
  formatBinding,
  isReserved,
  useKeymap,
} from "./use-keymap";

afterEach(() => localStorage.clear());

describe("keymap helpers", () => {
  it("bindingEquals compares leader, key (case-insensitive), and mod set", () => {
    expect(
      bindingEquals({ leader: true, key: "q" }, { leader: true, key: "Q" }),
    ).toBe(true);
    expect(
      bindingEquals({ leader: true, key: "q" }, { leader: false, key: "q" }),
    ).toBe(false);
    expect(
      bindingEquals(
        { leader: false, key: "t", mods: ["ctrl", "alt"] },
        { leader: false, key: "t", mods: ["alt", "ctrl"] },
      ),
    ).toBe(true);
    expect(
      bindingEquals(
        { leader: false, key: "t", mods: ["ctrl"] },
        { leader: false, key: "t", mods: ["ctrl", "alt"] },
      ),
    ).toBe(false);
  });

  it("formatBinding renders leader chords and direct combos", () => {
    expect(formatBinding({ leader: true, key: "2" })).toBe("leader → 2");
    expect(formatBinding({ leader: true, key: " " })).toBe("leader → Space");
    expect(formatBinding({ leader: false, key: "`" })).toBe("`");
    expect(
      formatBinding({ leader: false, key: "t", mods: ["alt", "ctrl"] }),
    ).toBe("Ctrl+Alt+T");
  });

  it("isReserved flags browser/OS-reserved combos", () => {
    expect(isReserved({ leader: false, key: "w", mods: ["meta"] })).toBe(true);
    expect(isReserved({ leader: false, key: "t", mods: ["meta"] })).toBe(true);
    expect(isReserved({ leader: false, key: "tab" })).toBe(true);
    expect(isReserved({ leader: false, key: "Meta" })).toBe(true);
    expect(isReserved({ leader: true, key: "q" })).toBe(false);
  });
});

describe("useKeymap", () => {
  it("resolves defaults when nothing is stored", () => {
    const { result } = renderHook(() => useKeymap());
    expect(result.current.leader).toEqual({ leader: false, key: "`" });
    expect(result.current.bindings["workspace-2"]).toEqual({
      leader: true,
      key: "2",
    });
  });

  it("persists an override and merges it over defaults", () => {
    const { result } = renderHook(() => useKeymap());
    act(() => {
      result.current.setBinding("new-terminal", { leader: true, key: "t" });
    });
    expect(result.current.bindings["new-terminal"]).toEqual({
      leader: true,
      key: "t",
    });
    expect(JSON.parse(localStorage.getItem("portfolio:keymap")!)).toEqual({
      "new-terminal": { leader: true, key: "t" },
    });
    // untouched actions keep their defaults
    expect(result.current.bindings["close-window"]).toEqual({
      leader: true,
      key: "w",
    });
  });

  it("reset clears all overrides", () => {
    const { result } = renderHook(() => useKeymap());
    act(() => {
      result.current.setBinding("new-terminal", { leader: true, key: "t" });
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.bindings["new-terminal"]).toEqual({
      leader: true,
      key: "q",
    });
  });

  it("findConflict detects a duplicate and respects exceptId", () => {
    const { result } = renderHook(() => useKeymap());
    // "1" is already bound to workspace-1.
    expect(
      result.current.findConflict({ leader: true, key: "1" }),
    ).toBe("workspace-1");
    // Excluding the owner clears the conflict.
    expect(
      result.current.findConflict({ leader: true, key: "1" }, "workspace-1"),
    ).toBeNull();
    // A free key has no conflict.
    expect(result.current.findConflict({ leader: true, key: "z" })).toBeNull();
  });
});
