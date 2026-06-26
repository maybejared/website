"use client";

import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWmKeys } from "./use-wm-keys";

const switchWorkspace = vi.fn();
const openApp = vi.fn();
const closeApp = vi.fn();
const focused = "terminal:1";

vi.mock("@/src/features/portfolio/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    state: { focused },
    switchWorkspace,
    openApp,
    closeApp,
  }),
}));

const press = (opts: KeyboardEventInit) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { ...opts, bubbles: true }));
  });

beforeEach(() => {
  switchWorkspace.mockClear();
  openApp.mockClear();
  closeApp.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

function Host({ toggleLauncher }: { toggleLauncher: () => void }) {
  useWmKeys({ toggleLauncher });
  return null;
}

describe("useWmKeys", () => {
  it("Alt+2 calls switchWorkspace(2)", () => {
    const toggleLauncher = vi.fn();
    render(<Host toggleLauncher={toggleLauncher} />);
    press({ key: "2", altKey: true });
    expect(switchWorkspace).toHaveBeenCalledWith(2);
  });

  it("Alt+q calls openApp('terminal')", () => {
    const toggleLauncher = vi.fn();
    render(<Host toggleLauncher={toggleLauncher} />);
    press({ key: "q", altKey: true });
    expect(openApp).toHaveBeenCalledWith("terminal");
  });

  it("Alt+w calls closeApp with the focused instance", () => {
    const toggleLauncher = vi.fn();
    render(<Host toggleLauncher={toggleLauncher} />);
    press({ key: "w", altKey: true });
    expect(closeApp).toHaveBeenCalledWith(focused);
  });

  it("Alt+Space calls toggleLauncher", () => {
    const toggleLauncher = vi.fn();
    render(<Host toggleLauncher={toggleLauncher} />);
    press({ key: " ", altKey: true });
    expect(toggleLauncher).toHaveBeenCalledTimes(1);
  });

  it("Alt+2 dispatched from an INPUT does not call switchWorkspace", () => {
    const toggleLauncher = vi.fn();
    render(<Host toggleLauncher={toggleLauncher} />);
    const input = document.createElement("input");
    document.body.appendChild(input);
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "2", altKey: true, bubbles: true }),
      );
    });
    expect(switchWorkspace).not.toHaveBeenCalled();
    input.remove();
  });

  it("ignores events without altKey", () => {
    const toggleLauncher = vi.fn();
    render(<Host toggleLauncher={toggleLauncher} />);
    press({ key: "2" });
    expect(switchWorkspace).not.toHaveBeenCalled();
  });
});
