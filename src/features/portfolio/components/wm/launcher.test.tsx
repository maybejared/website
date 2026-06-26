import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Launcher } from "./launcher";

const openApp = vi.fn();
const onClose = vi.fn();

vi.mock("@/src/features/portfolio/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    openApp,
    closeApp: vi.fn(),
    focusApp: vi.fn(),
    switchWorkspace: vi.fn(),
    setLayout: vi.fn(),
    state: {
      active: "ws-1",
      instances: {},
      layouts: { "ws-1": null },
      focused: null,
    },
  }),
}));

describe("Launcher", () => {
  beforeEach(() => {
    openApp.mockClear();
    onClose.mockClear();
  });

  it("filters the app list to entries matching the query", () => {
    render(<Launcher open onClose={onClose} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "post" } });
    // Only one row — the posts entry — should be present.
    const rows = screen.getAllByRole("button");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("posts");
    expect(screen.queryByText("about")).not.toBeInTheDocument();
  });

  it("calls openApp and onClose when Enter is pressed on the filtered posts entry", () => {
    render(<Launcher open onClose={onClose} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "post" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(openApp).toHaveBeenCalledWith("posts");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
