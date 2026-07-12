import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MobileTabBar } from "@/src/features/portfolio/components/wm/mobile-tab-bar";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/posts",
}));

const appearance = {
  scheme: "moonlit",
  setScheme: vi.fn(),
  wallpaperId: "none",
  setWallpaperId: vi.fn(),
} as unknown as AppearanceState;

const seed: WorkspaceSeed = {
  workspace: 1,
  instances: [{ id: "about", appId: "about" }],
  layout: "about",
};

const renderBar = () =>
  render(
    <WorkspaceProvider seed={seed}>
      <MobileTabBar appearance={appearance} />
    </WorkspaceProvider>,
  );

describe("MobileTabBar", () => {
  it("renders a tab per content section with the current one active", () => {
    renderBar();
    for (const label of ["about", "posts", "experience", "contact"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "posts" })).toHaveClass(
      "text-amber",
    );
    expect(screen.getByRole("link", { name: "about" })).not.toHaveClass(
      "text-amber",
    );
  });

  it("search tab opens the palette sheet listing content apps only", async () => {
    renderBar();
    await userEvent.click(screen.getByRole("button", { name: "search" }));
    expect(screen.getByRole("textbox", { name: "search" })).toBeInTheDocument();
    // Content apps present, decor apps filtered out on mobile.
    expect(screen.getByRole("button", { name: /experience/ })).toBeInTheDocument();
    expect(screen.queryByText("monitor")).not.toBeInTheDocument();
  });

  it("running a palette item navigates and closes the sheet", async () => {
    renderBar();
    await userEvent.click(screen.getByRole("button", { name: "search" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "search" }),
      "keyboards{Enter}",
    );
    expect(push).toHaveBeenCalledWith("/posts/designing-for-keyboards-first");
    expect(
      screen.queryByRole("textbox", { name: "search" }),
    ).not.toBeInTheDocument();
  });
});
