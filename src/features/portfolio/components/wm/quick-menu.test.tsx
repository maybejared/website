import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
