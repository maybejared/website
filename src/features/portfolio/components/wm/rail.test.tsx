import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Rail } from "@/src/features/portfolio/components/wm/rail";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const seed: WorkspaceSeed = {
  workspace: 1,
  instances: [{ id: "about", appId: "about" }],
  layout: "about",
};

const renderRail = () =>
  render(
    <WorkspaceProvider seed={seed}>
      <Rail armed={false} onOpenPalette={vi.fn()} />
    </WorkspaceProvider>,
  );

describe("Rail", () => {
  it("renders a button per workspace and per content app", () => {
    renderRail();
    for (const id of [1, 2, 3, 4]) {
      expect(
        screen.getByRole("button", { name: `workspace ${id}` }),
      ).toBeInTheDocument();
    }
    for (const label of ["about", "posts", "experience", "contact"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("clicking a content app opens it (navigates to its route)", async () => {
    renderRail();
    await userEvent.click(screen.getByRole("button", { name: "posts" }));
    expect(push).toHaveBeenCalledWith("/posts");
  });

  it("shows the leader chip only when armed", () => {
    const { rerender } = renderRail();
    expect(screen.queryByText("ldr")).not.toBeInTheDocument();
    rerender(
      <WorkspaceProvider seed={seed}>
        <Rail armed onOpenPalette={vi.fn()} />
      </WorkspaceProvider>,
    );
    expect(screen.getByText("ldr")).toBeInTheDocument();
  });
});
