import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";
import type { Identifiable } from "@/src/shared/types/portfolio";

import { useListNavigation } from "./use-list-navigation";

// Controllable next/navigation mock: `replace` rewrites the in-memory params so
// the hook reads the new value on the next render, mirroring soft navigation.
const nav = vi.hoisted(() => {
  let params = new URLSearchParams();
  return {
    replace: vi.fn((url: string) => {
      params = new URLSearchParams(
        url.includes("?") ? url.slice(url.indexOf("?") + 1) : "",
      );
    }),
    setParams: (qs: string) => {
      params = new URLSearchParams(qs);
    },
    getParams: () => params,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  usePathname: () => "/posts",
  useSearchParams: () => nav.getParams(),
}));

const ITEMS: Identifiable[] = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];
const wrapper = ({ children }: { children: ReactNode }) => (
  <WindowFocusContext.Provider value={true}>{children}</WindowFocusContext.Provider>
);
const press = (key: string) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });

beforeEach(() => {
  nav.setParams("");
  nav.replace.mockClear();
});
afterEach(() => {
  vi.clearAllMocks();
});

describe("useListNavigation", () => {
  it("defaults to index 0 and closed when no param is present", () => {
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    expect(result.current.selected).toBe(0);
    expect(result.current.opened).toBe(false);
  });

  it("seeds the selection from a valid ?item= slug and is opened", () => {
    nav.setParams("item=c");
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    expect(result.current.selected).toBe(2);
    expect(result.current.opened).toBe(true);
  });

  it("open() writes ?item=<slug> and selects that index", () => {
    const { result, rerender } = renderHook(() => useListNavigation(ITEMS), {
      wrapper,
    });
    act(() => result.current.open(1));
    expect(nav.replace).toHaveBeenCalledWith("/posts?item=b", {
      scroll: false,
    });
    rerender();
    expect(result.current.selected).toBe(1);
    expect(result.current.opened).toBe(true);
  });

  it("close() drops the param", () => {
    nav.setParams("item=b");
    const { result, rerender } = renderHook(() => useListNavigation(ITEMS), {
      wrapper,
    });
    act(() => result.current.close());
    expect(nav.replace).toHaveBeenCalledWith("/posts", { scroll: false });
    rerender();
    expect(result.current.opened).toBe(false);
  });

  it("self-heals an unknown slug: falls back to 0, closed, and scrubs the URL", () => {
    nav.setParams("item=does-not-exist");
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    expect(result.current.selected).toBe(0);
    expect(result.current.opened).toBe(false);
    expect(nav.replace).toHaveBeenCalledWith("/posts", { scroll: false });
  });

  it("↑/↓ move the highlight locally without touching the URL", () => {
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    press("ArrowDown");
    expect(result.current.selected).toBe(1);
    press("ArrowDown");
    expect(result.current.selected).toBe(2);
    press("ArrowDown"); // clamped at the end
    expect(result.current.selected).toBe(2);
    press("ArrowUp");
    expect(result.current.selected).toBe(1);
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("Enter commits the current highlight via open()", () => {
    renderHook(() => useListNavigation(ITEMS), { wrapper });
    press("ArrowDown");
    press("Enter");
    expect(nav.replace).toHaveBeenCalledWith("/posts?item=b", {
      scroll: false,
    });
  });

  it("Escape closes only when opened", () => {
    nav.setParams("item=b");
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    expect(result.current.opened).toBe(true);
    press("Escape");
    expect(nav.replace).toHaveBeenCalledWith("/posts", { scroll: false });
  });

  it("does not close on Escape when already closed", () => {
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    expect(result.current.opened).toBe(false);
    press("Escape");
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("ignores arrow keys while typing in an input", () => {
    const { result } = renderHook(() => useListNavigation(ITEMS), { wrapper });
    const input = document.createElement("input");
    document.body.appendChild(input);
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    });
    expect(result.current.selected).toBe(0);
    input.remove();
  });

  it("does not respond to arrow keys when the enclosing window is not focused", () => {
    const unfocusedWrapper = ({ children }: { children: ReactNode }) => (
      <WindowFocusContext.Provider value={false}>{children}</WindowFocusContext.Provider>
    );
    const { result } = renderHook(() => useListNavigation(ITEMS), {
      wrapper: unfocusedWrapper,
    });
    press("ArrowDown");
    expect(result.current.selected).toBe(0);
  });
});
