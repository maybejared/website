import { describe, expect, it } from "vitest";
import type { MosaicNode } from "react-mosaic-component";

import {
  insertDwindle,
  leafAtPoint,
  leafRects,
  moveLeafToZone,
  neighborInDirection,
  removeLeaf,
  resizeNearestSplit,
  swapLeaves,
  zoneForPoint,
} from "./mosaic-geometry";

describe("leafRects", () => {
  it("allocates the full canvas to a single leaf", () => {
    expect(leafRects("a").get("a")).toEqual({ x: 0, y: 0, w: 100, h: 100 });
  });

  it("splits a row left/right at the split percentage", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: "b",
      splitPercentage: 60,
    };
    const r = leafRects(tree);
    expect(r.get("a")).toEqual({ x: 0, y: 0, w: 60, h: 100 });
    expect(r.get("b")).toEqual({ x: 60, y: 0, w: 40, h: 100 });
  });

  it("splits a column top/bottom", () => {
    const tree: MosaicNode<string> = {
      direction: "column",
      first: "a",
      second: "b",
    };
    const r = leafRects(tree);
    expect(r.get("a")).toEqual({ x: 0, y: 0, w: 100, h: 50 });
    expect(r.get("b")).toEqual({ x: 0, y: 50, w: 100, h: 50 });
  });
});

describe("neighborInDirection", () => {
  // a | b   (left column split into a-top / c-bottom, b on the right)
  //  a
  // ---  | b
  //  c
  const tree: MosaicNode<string> = {
    direction: "row",
    first: { direction: "column", first: "a", second: "c", splitPercentage: 70 },
    second: "b",
  };

  it("finds the window to the right", () => {
    expect(neighborInDirection(tree, "a", "right")).toBe("b");
    expect(neighborInDirection(tree, "c", "right")).toBe("b");
  });

  it("finds the window below within the same column", () => {
    expect(neighborInDirection(tree, "a", "down")).toBe("c");
    expect(neighborInDirection(tree, "c", "up")).toBe("a");
  });

  it("returns null when there is no neighbor that way", () => {
    expect(neighborInDirection(tree, "a", "left")).toBeNull();
    expect(neighborInDirection(tree, "a", "up")).toBeNull();
    expect(neighborInDirection(tree, "b", "right")).toBeNull();
  });

  it("from the right pane, left picks the pane nearest b's center", () => {
    // b spans the full height and overlaps both a (top 70%) and c (bottom 30%).
    // a's center (y=35) is nearer b's center (y=50) than c's (y=85), so a wins.
    expect(neighborInDirection(tree, "b", "left")).toBe("a");
  });

  it("returns null for an unknown leaf or empty layout", () => {
    expect(neighborInDirection(tree, "zzz", "left")).toBeNull();
    expect(neighborInDirection(null, "a", "left")).toBeNull();
  });
});

describe("leafAtPoint", () => {
  const tree: MosaicNode<string> = {
    direction: "row",
    first: "a",
    second: "b",
    splitPercentage: 60,
  };

  it("returns the leaf under a point", () => {
    expect(leafAtPoint(tree, 30, 50)).toBe("a");
    expect(leafAtPoint(tree, 80, 50)).toBe("b");
  });

  it("returns null outside the canvas or for an empty tree", () => {
    expect(leafAtPoint(tree, 200, 50)).toBeNull();
    expect(leafAtPoint(null, 10, 10)).toBeNull();
  });
});

describe("swapLeaves", () => {
  it("swaps two leaves and preserves structure", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: { direction: "column", first: "b", second: "c" },
    };
    expect(swapLeaves(tree, "a", "c")).toEqual({
      direction: "row",
      first: "c",
      second: { direction: "column", first: "b", second: "a" },
    });
  });
});

describe("removeLeaf", () => {
  it("collapses the parent into the sibling", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: { direction: "column", first: "b", second: "c" },
    };
    expect(removeLeaf(tree, "b")).toEqual({
      direction: "row",
      first: "a",
      second: "c",
    });
  });

  it("returns null when the last leaf is removed", () => {
    expect(removeLeaf("a", "a")).toBeNull();
  });
});

describe("zoneForPoint", () => {
  const r = { x: 0, y: 0, w: 100, h: 100 };
  it("stacks only within the outer 15% vertical bands", () => {
    expect(zoneForPoint(r, 50, 5)).toBe("top");
    expect(zoneForPoint(r, 50, 95)).toBe("bottom");
  });

  it("splits left/right across the dominant middle band", () => {
    expect(zoneForPoint(r, 30, 50)).toBe("left");
    expect(zoneForPoint(r, 70, 50)).toBe("right");
    // Upper-middle (y=20%) is past the 15% band, so it stays horizontal.
    expect(zoneForPoint(r, 30, 20)).toBe("left");
    expect(zoneForPoint(r, 70, 80)).toBe("right");
  });
});

describe("moveLeafToZone", () => {
  it("re-tiles the dragged window onto a target's edge", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: "b",
    };
    // Drop a onto b's right edge → a leaves the left, b splits with a on right.
    expect(moveLeafToZone(tree, "a", "b", "right")).toEqual({
      direction: "row",
      first: "b",
      second: "a",
      splitPercentage: 50,
    });
  });

  it("inserts above when dropped on the top zone", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: "b",
    };
    expect(moveLeafToZone(tree, "a", "b", "top")).toEqual({
      direction: "column",
      first: "a",
      second: "b",
      splitPercentage: 50,
    });
  });

  it("is a no-op onto itself", () => {
    const tree: MosaicNode<string> = { direction: "row", first: "a", second: "b" };
    expect(moveLeafToZone(tree, "a", "a", "left")).toBe(tree);
  });
});

describe("insertDwindle", () => {
  it("splits a full-canvas window left/right", () => {
    expect(insertDwindle("a", "a", "b")).toEqual({
      direction: "row",
      first: "a",
      second: "b",
      splitPercentage: 50,
    });
  });

  it("splits a tall (half-width, full-height) window top/bottom", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: "b",
    };
    // b is 50w × 100h — visually taller than wide, so the newcomer stacks.
    expect(insertDwindle(tree, "b", "c")).toEqual({
      direction: "row",
      first: "a",
      second: {
        direction: "column",
        first: "b",
        second: "c",
        splitPercentage: 50,
      },
    });
  });
});

describe("resizeNearestSplit", () => {
  it("adjusts the top-level row split, rescaled to its subtree", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: "b",
    };
    // Split subtree spans the full width (subFraction 1), so a +0.1 canvas
    // delta moves the divider +10 percentage points: 50 → 60.
    const out = resizeNearestSplit(tree, "a", "x", 0.1);
    expect(typeof out === "string" ? null : out.splitPercentage).toBeCloseTo(60);
  });

  it("resizes a nested column split (full-height extent)", () => {
    // a | (b above c). The column split is narrowed in x but spans the full
    // canvas height, so a +0.1 canvas y-delta is +10 local points: 50 → 60.
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: { direction: "column", first: "b", second: "c" },
    };
    const out = resizeNearestSplit(tree, "b", "y", 0.1);
    const inner =
      typeof out === "string" ? null : (out.second as { splitPercentage?: number });
    expect(inner?.splitPercentage).toBeCloseTo(60);
  });

  it("rescales the delta to a horizontally-narrowed split", () => {
    // (a | b) stacked above c. The inner row split occupies only the top 50%
    // of height but full width — an x-resize there still uses full width.
    // Nest it inside a column whose first is the row split to narrow its width.
    const tree: MosaicNode<string> = {
      direction: "row",
      first: { direction: "row", first: "a", second: "b" },
      second: "c",
      splitPercentage: 50,
    };
    // Inner row split for "a" spans the left 50% width, so +0.1 canvas delta
    // is +20 local points: 50 → 70.
    const out = resizeNearestSplit(tree, "a", "x", 0.1);
    const inner =
      typeof out === "string" ? null : (out.first as { splitPercentage?: number });
    expect(inner?.splitPercentage).toBeCloseTo(70);
  });

  it("returns the tree unchanged when there is no split on that axis", () => {
    const tree: MosaicNode<string> = {
      direction: "row",
      first: "a",
      second: "b",
    };
    // No column split anywhere — a vertical resize is a no-op.
    expect(resizeNearestSplit(tree, "a", "y", 0.2)).toBe(tree);
  });
});
