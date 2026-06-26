import { describe, expect, it } from "vitest";
import {
  initialWorkspaceState,
  workspaceReducer,
  type WorkspaceState,
} from "./workspace-reducer";

const base = (): WorkspaceState =>
  initialWorkspaceState({ workspace: 1, instances: [], layout: null });

describe("workspaceReducer", () => {
  it("opens a singleton app as instanceId === appId and focuses it", () => {
    const s = workspaceReducer(base(), { type: "open", appId: "posts" });
    expect(s.instances.posts).toBe("posts");
    expect(s.focused).toBe("posts");
    expect(s.layouts[1]).toBe("posts");
  });

  it("re-opening a singleton focuses the existing instance, no duplicate", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "btop" });
    s = workspaceReducer(s, { type: "switch", workspace: 2 });
    s = workspaceReducer(s, { type: "open", appId: "btop" });
    expect(Object.keys(s.instances)).toEqual(["btop"]);
    expect(s.active).toBe(1); // switched back to where btop lives
    expect(s.focused).toBe("btop");
  });

  it("mints a new id per multiInstance open and tiles both", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "terminal", multiInstance: true });
    s = workspaceReducer(s, { type: "open", appId: "terminal", multiInstance: true });
    const ids = Object.keys(s.instances);
    expect(ids).toEqual(["terminal:1", "terminal:2"]);
    expect(s.instances["terminal:2"]).toBe("terminal");
  });

  it("close removes the instance and clears focus if it was focused", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "posts" });
    s = workspaceReducer(s, { type: "close", instanceId: "posts" });
    expect(s.instances.posts).toBeUndefined();
    expect(s.layouts[1]).toBeNull();
    expect(s.focused).toBeNull();
  });

  it("switch changes the active workspace", () => {
    const s = workspaceReducer(base(), { type: "switch", workspace: 3 });
    expect(s.active).toBe(3);
  });

  it("setLayout replaces the active workspace tree", () => {
    let s = workspaceReducer(base(), { type: "open", appId: "posts" });
    s = workspaceReducer(s, { type: "open", appId: "about" });
    const tree = { direction: "row", first: "posts", second: "about" } as const;
    s = workspaceReducer(s, { type: "setLayout", node: tree });
    expect(s.layouts[1]).toEqual(tree);
  });
});
