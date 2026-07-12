import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QuickMenu } from "@/src/features/portfolio/components/wm/quick-menu";

describe("QuickMenu", () => {
  it("opens the keymap panel and closes itself", async () => {
    const onClose = vi.fn();
    const onOpenKeymap = vi.fn();
    render(<QuickMenu onClose={onClose} onOpenKeymap={onOpenKeymap} />);
    await userEvent.click(screen.getByRole("button", { name: "keybinds" }));
    expect(onOpenKeymap).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("links github, linkedin, and email", () => {
    render(<QuickMenu onClose={vi.fn()} onOpenKeymap={vi.fn()} />);
    expect(screen.getByRole("link", { name: "github" })).toHaveAttribute(
      "href",
      "https://github.com/Dawaad",
    );
    expect(screen.getByRole("link", { name: "linkedin" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/ibuildshitgood",
    );
    expect(screen.getByRole("link", { name: "email" })).toHaveAttribute(
      "href",
      "mailto:jared@rmr.studio",
    );
  });

  it("closes on pointerdown outside the panel", () => {
    const onClose = vi.fn();
    render(<QuickMenu onClose={onClose} onOpenKeymap={vi.fn()} />);
    fireEvent.pointerDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close on pointerdown inside the panel", () => {
    const onClose = vi.fn();
    render(<QuickMenu onClose={onClose} onOpenKeymap={vi.fn()} />);
    fireEvent.pointerDown(screen.getByRole("region", { name: "quick menu" }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
