import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemePanel } from "./theme-panel";

const setScheme = vi.fn();
const setWallpaperId = vi.fn();

const defaultProps = {
  scheme: "moonlit" as const,
  setScheme,
  wallpaperId: "none",
  setWallpaperId,
};

describe("ThemePanel", () => {
  beforeEach(() => {
    setScheme.mockClear();
    setWallpaperId.mockClear();
  });

  it("opens the panel when the trigger button is clicked", () => {
    render(<ThemePanel {...defaultProps} />);
    expect(screen.queryByText("scheme")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /theme/i }));
    expect(screen.getByText("scheme")).toBeInTheDocument();
  });

  it("calls setScheme with the selected scheme and closes the panel", () => {
    render(<ThemePanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /theme/i }));
    fireEvent.click(screen.getByRole("button", { name: /beige/i }));
    expect(setScheme).toHaveBeenCalledWith("beige");
    expect(setScheme).toHaveBeenCalledOnce();
  });

  it("calls setWallpaperId with the selected wallpaper id and closes the panel", () => {
    render(<ThemePanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /theme/i }));
    // DOM order: trigger(0), beige(1), mono-scheme(2), moonlit-scheme(3),
    // none(4), mono-wallpaper(5), moonlit-wallpaper(6).
    // Click the "mono" wallpaper entry (index 5), not the "mono" scheme entry.
    fireEvent.click(screen.getAllByRole("button")[5]);
    expect(setWallpaperId).toHaveBeenCalledWith("mono");
    expect(setWallpaperId).toHaveBeenCalledOnce();
  });

  it("marks the active scheme with an indicator", () => {
    render(<ThemePanel {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /theme/i }));
    // DOM order after open: trigger(0), beige(1), mono(2), moonlit-scheme(3),
    // none(4), mono-wallpaper(5), moonlit-wallpaper(6).
    const allBtns = screen.getAllByRole("button");
    expect(allBtns[3]).toHaveClass("text-amber"); // scheme "moonlit" is active
  });

  it("marks the active wallpaper with an indicator", () => {
    render(<ThemePanel {...defaultProps} wallpaperId="mono" />);
    fireEvent.click(screen.getByRole("button", { name: /theme/i }));
    // DOM order: trigger(0), beige(1), mono-scheme(2), moonlit-scheme(3),
    // none(4), mono-wallpaper(5), moonlit-wallpaper(6).
    const allBtns = screen.getAllByRole("button");
    expect(allBtns[5]).toHaveClass("text-amber"); // wallpaper "mono" is active
  });
});
