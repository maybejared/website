"use client";

import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KeymapPanel } from "./keymap-panel";
import { useKeymap } from "@/src/features/portfolio/hooks/use-keymap";
import { KEYMAP_ACTIONS } from "@/src/features/portfolio/lib/config/keymap.config";

afterEach(() => localStorage.clear());

// Drives the panel with the real keymap hook so capture/validation/persistence
// run end to end.
const Harness = () => {
  const keymap = useKeymap();
  return <KeymapPanel keymap={keymap} open onClose={() => {}} />;
};

const press = (opts: KeyboardEventInit) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { ...opts, bubbles: true }));
  });

const rebindButtons = () => screen.getAllByRole("button", { name: "rebind" });

describe("KeymapPanel", () => {
  it("renders a row for the leader and every action", () => {
    render(<Harness />);
    expect(screen.getByText("Leader")).toBeInTheDocument();
    for (const a of KEYMAP_ACTIONS) {
      expect(screen.getByText(a.label)).toBeInTheDocument();
    }
    // leader + 8 actions
    expect(rebindButtons()).toHaveLength(KEYMAP_ACTIONS.length + 1);
  });

  it("captures a new binding for an action", () => {
    render(<Harness />);
    // new-terminal is the 6th row (after leader + 4 workspaces).
    act(() => rebindButtons()[5].click());
    expect(screen.getByText("press a combo…")).toBeInTheDocument();
    press({ key: "t" });
    expect(screen.getByText("leader → T")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("portfolio:keymap")!)).toEqual({
      "new-terminal": { leader: true, key: "t" },
    });
  });

  it("rejects a browser-reserved combo and keeps the old binding", () => {
    render(<Harness />);
    act(() => rebindButtons()[5].click());
    press({ key: "w", metaKey: true });
    expect(screen.getByText(/reserved by the browser/i)).toBeInTheDocument();
    // still capturing, no override written
    expect(JSON.parse(localStorage.getItem("portfolio:keymap")!)).toEqual({});
  });

  it("rejects a duplicate combo", () => {
    render(<Harness />);
    act(() => rebindButtons()[5].click());
    // "1" is already bound to Workspace 1.
    press({ key: "1" });
    expect(screen.getByText(/already bound to Workspace 1/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("portfolio:keymap")!)).toEqual({});
  });

  it("reset restores defaults", () => {
    render(<Harness />);
    act(() => rebindButtons()[5].click());
    press({ key: "t" });
    expect(screen.getByText("leader → T")).toBeInTheDocument();
    act(() => screen.getByText("reset to defaults").click());
    expect(screen.getByText("leader → Q")).toBeInTheDocument();
  });
});
