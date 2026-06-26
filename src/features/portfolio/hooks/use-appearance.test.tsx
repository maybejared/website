import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAppearance } from "./use-appearance";

afterEach(() => localStorage.clear());

describe("useAppearance", () => {
  it("defaults then persists scheme + wallpaper", () => {
    const { result } = renderHook(() => useAppearance());
    act(() => result.current.setScheme("mono"));
    act(() => result.current.setWallpaperId("snowy-house"));
    expect(JSON.parse(localStorage.getItem("portfolio:appearance")!)).toEqual({
      scheme: "mono",
      wallpaperId: "snowy-house",
    });
  });

  it("rehydrates from localStorage", () => {
    localStorage.setItem(
      "portfolio:appearance",
      JSON.stringify({ scheme: "beige", wallpaperId: "none" }),
    );
    const { result } = renderHook(() => useAppearance());
    expect(result.current.scheme).toBe("beige");
    expect(result.current.wallpaperId).toBe("none");
  });

  it("applies the scheme body class", () => {
    const { result } = renderHook(() => useAppearance());
    act(() => result.current.setScheme("mono"));
    expect(document.body.classList.contains("scheme-mono")).toBe(true);
  });
});
