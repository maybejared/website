import { describe, expect, it } from "vitest";

import { workspaceAppIds } from "@/src/features/portfolio/lib/wm/workspace-apps";
import type { WorkspaceState } from "@/src/features/portfolio/lib/wm/workspace-reducer";

const state: WorkspaceState = {
  active: 1,
  layouts: {
    1: { direction: "row", first: "about-1", second: "terminal-1" },
    2: "posts-1",
    3: null,
    4: null,
  },
  instances: {
    "about-1": "about",
    "terminal-1": "terminal",
    "posts-1": "posts",
  },
  focused: "about-1",
};

describe("workspaceAppIds", () => {
  it("returns app ids in tree order", () => {
    expect(workspaceAppIds(state, 1)).toEqual(["about", "terminal"]);
  });

  it("returns empty for an empty workspace", () => {
    expect(workspaceAppIds(state, 3)).toEqual([]);
  });
});
