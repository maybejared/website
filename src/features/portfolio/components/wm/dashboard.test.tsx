import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dashboard } from "@/src/features/portfolio/components/wm/dashboard";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const seed: WorkspaceSeed = {
  workspace: 1,
  instances: [{ id: "about", appId: "about" }],
  layout: "about",
};

const renderDash = () =>
  render(
    <WorkspaceProvider seed={seed}>
      <Dashboard open onClose={vi.fn()} />
    </WorkspaceProvider>,
  );

describe("Dashboard", () => {
  it("shows the identity card on the default tab", () => {
    renderDash();
    expect(screen.getByText("jared tucker")).toBeInTheDocument();
    expect(screen.getByText(/melbourne/)).toBeInTheDocument();
  });

  it("workspaces tab lists occupancy and empty states", async () => {
    renderDash();
    await userEvent.click(screen.getByRole("tab", { name: "workspaces" }));
    // workspace 1 holds the seeded about window; 2–4 are empty
    expect(screen.getByText("about")).toBeInTheDocument();
    expect(screen.getAllByText("empty")).toHaveLength(3);
  });

  it("clicking a workspace preview switches and closes", async () => {
    const onClose = vi.fn();
    render(
      <WorkspaceProvider seed={seed}>
        <Dashboard open onClose={onClose} />
      </WorkspaceProvider>,
    );
    await userEvent.click(screen.getByRole("tab", { name: "workspaces" }));
    await userEvent.click(screen.getByRole("button", { name: "workspace 2" }));
    expect(onClose).toHaveBeenCalled();
  });
});
