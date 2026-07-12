import { getLeaves, type MosaicNode, type MosaicBranch } from "react-mosaic-component";

export type Direction = "left" | "right" | "up" | "down";
export type Axis = "x" | "y";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const EPSILON = 0.01;

/**
 * Allocate a [0..100] × [0..100] rectangle to every leaf in a Mosaic tree by
 * walking the splits: `row` divides width left/right, `column` divides height
 * top/bottom, both at `splitPercentage` (defaulting to an even 50/50).
 */
export const leafRects = (
  node: MosaicNode<string> | null,
): Map<string, Rect> => {
  const out = new Map<string, Rect>();
  const walk = (n: MosaicNode<string>, r: Rect) => {
    if (typeof n === "string") {
      out.set(n, r);
      return;
    }
    const pct = (n.splitPercentage ?? 50) / 100;
    if (n.direction === "row") {
      const wFirst = r.w * pct;
      walk(n.first, { x: r.x, y: r.y, w: wFirst, h: r.h });
      walk(n.second, { x: r.x + wFirst, y: r.y, w: r.w - wFirst, h: r.h });
    } else {
      const hFirst = r.h * pct;
      walk(n.first, { x: r.x, y: r.y, w: r.w, h: hFirst });
      walk(n.second, { x: r.x, y: r.y + hFirst, w: r.w, h: r.h - hFirst });
    }
  };
  if (node != null) walk(node, { x: 0, y: 0, w: 100, h: 100 });
  return out;
};

/**
 * The leaf spatially adjacent to `from` in the given direction, or null when
 * there is none. A candidate must lie on the requested side and overlap the
 * source's perpendicular span; ties break toward the nearer perpendicular
 * center, so navigation tracks the window you're visually next to.
 */
export const neighborInDirection = (
  node: MosaicNode<string> | null,
  from: string,
  dir: Direction,
): string | null => {
  const rects = leafRects(node);
  const src = rects.get(from);
  if (!src) return null;

  const srcCx = src.x + src.w / 2;
  const srcCy = src.y + src.h / 2;
  const horizontal = dir === "left" || dir === "right";

  let best: string | null = null;
  let bestPrimary = Infinity;
  let bestPerp = Infinity;

  for (const [id, r] of rects) {
    if (id === from) continue;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;

    let onSide: boolean;
    let overlaps: boolean;
    let primary: number;
    let perp: number;

    if (horizontal) {
      onSide =
        dir === "right"
          ? r.x >= src.x + src.w - EPSILON
          : r.x + r.w <= src.x + EPSILON;
      overlaps = r.y < src.y + src.h - EPSILON && r.y + r.h > src.y + EPSILON;
      primary = Math.abs(cx - srcCx);
      perp = Math.abs(cy - srcCy);
    } else {
      onSide =
        dir === "down"
          ? r.y >= src.y + src.h - EPSILON
          : r.y + r.h <= src.y + EPSILON;
      overlaps = r.x < src.x + src.w - EPSILON && r.x + r.w > src.x + EPSILON;
      primary = Math.abs(cy - srcCy);
      perp = Math.abs(cx - srcCx);
    }

    if (!onSide || !overlaps) continue;
    if (
      primary < bestPrimary - EPSILON ||
      (Math.abs(primary - bestPrimary) <= EPSILON && perp < bestPerp)
    ) {
      best = id;
      bestPrimary = primary;
      bestPerp = perp;
    }
  }

  return best;
};

/** The leaf occupying a point given in canvas fractions (0..100). */
export const leafAtPoint = (
  node: MosaicNode<string> | null,
  x: number,
  y: number,
): string | null => {
  for (const [id, r] of leafRects(node)) {
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return id;
  }
  return null;
};

/**
 * The window to focus after `closedId` is removed: the remaining leaf nearest
 * it (the one that borders/fills the freed space). Null when it was the last
 * window. Call with the tree that still contains `closedId`.
 */
export const focusAfterClose = (
  node: MosaicNode<string> | null,
  closedId: string,
): string | null => {
  const rects = leafRects(node);
  const src = rects.get(closedId);
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [id, r] of rects) {
    if (id === closedId) continue;
    const dist = src
      ? Math.hypot(r.x + r.w / 2 - (src.x + src.w / 2), r.y + r.h / 2 - (src.y + src.h / 2))
      : 0;
    if (dist < bestDist) {
      bestDist = dist;
      best = id;
    }
  }
  return best;
};

/** Swap two leaves' positions in the tree, leaving structure untouched. */
export const swapLeaves = (
  node: MosaicNode<string>,
  a: string,
  b: string,
): MosaicNode<string> => {
  if (typeof node === "string") return node === a ? b : node === b ? a : node;
  return {
    ...node,
    first: swapLeaves(node.first, a, b),
    second: swapLeaves(node.second, a, b),
  };
};

/** The four insertion zones of a target window, i3/Hyprland style. */
export type Zone = "left" | "right" | "top" | "bottom";

/** Remove a leaf, collapsing its parent into the sibling. Null if it emptied. */
export const removeLeaf = (
  node: MosaicNode<string>,
  id: string,
): MosaicNode<string> | null => {
  if (typeof node === "string") return node === id ? null : node;
  const first = removeLeaf(node.first, id);
  const second = removeLeaf(node.second, id);
  if (first === null) return second;
  if (second === null) return first;
  return { ...node, first, second };
};

const ZONE_SPLIT: Record<
  Zone,
  { direction: "row" | "column"; newFirst: boolean }
> = {
  left: { direction: "row", newFirst: true },
  right: { direction: "row", newFirst: false },
  top: { direction: "column", newFirst: true },
  bottom: { direction: "column", newFirst: false },
};

/** Split `targetId` and place `newId` on the given side of it. */
export const insertLeaf = (
  node: MosaicNode<string>,
  targetId: string,
  zone: Zone,
  newId: string,
): MosaicNode<string> => {
  if (typeof node === "string") {
    if (node !== targetId) return node;
    const { direction, newFirst } = ZONE_SPLIT[zone];
    return {
      direction,
      first: newFirst ? newId : targetId,
      second: newFirst ? targetId : newId,
      splitPercentage: 50,
    };
  }
  return {
    ...node,
    first: insertLeaf(node.first, targetId, zone, newId),
    second: insertLeaf(node.second, targetId, zone, newId),
  };
};

// Vertical hit bands for the drop target: only the outer slivers stack the
// window; the dominant middle band always splits left/right. This biases
// re-tiling strongly toward horizontal placement over vertical stacking.
const STACK_BAND = 0.15;

/**
 * Which insertion zone of `rect` a canvas point falls in. Top/bottom only when
 * the pointer is within the outer 15% vertically; the middle 70% resolves to
 * left/right by which horizontal half the pointer is in.
 */
export const zoneForPoint = (rect: Rect, x: number, y: number): Zone => {
  const ly = (y - rect.y) / rect.h;
  if (ly < STACK_BAND) return "top";
  if (ly > 1 - STACK_BAND) return "bottom";
  return (x - rect.x) / rect.w < 0.5 ? "left" : "right";
};

// Fallback field aspect (width / height) when the caller can't supply one —
// the open action threads the live viewport aspect through, so narrow/tall
// fields stack new windows vertically instead of splitting side-by-side.
const DESKTOP_ASPECT = 16 / 9;

/**
 * Dwindle/Fibonacci insertion: split `targetId` along its longer visual axis so
 * the layout spirals — a wide window splits left/right, a tall one top/bottom.
 * `newId` takes the second (right/bottom) slot, as in Hyprland's dwindle.
 */
export const insertDwindle = (
  tree: MosaicNode<string>,
  targetId: string,
  newId: string,
  aspect: number = DESKTOP_ASPECT,
): MosaicNode<string> => {
  const rect = leafRects(tree).get(targetId);
  // Visually wider than tall? rect.w * fieldW >= rect.h * fieldH.
  const wide = !rect || rect.w * aspect >= rect.h;
  return insertLeaf(tree, targetId, wide ? "right" : "bottom", newId);
};

/** Pull `draggedId` out and re-insert it on a zone of `targetId`. */
export const moveLeafToZone = (
  tree: MosaicNode<string>,
  draggedId: string,
  targetId: string,
  zone: Zone,
): MosaicNode<string> => {
  if (draggedId === targetId) return tree;
  const without = removeLeaf(tree, draggedId);
  if (without === null) return tree;
  return insertLeaf(without, targetId, zone, draggedId);
};

const pathToLeaf = (
  node: MosaicNode<string>,
  id: string,
  acc: MosaicBranch[] = [],
): MosaicBranch[] | null => {
  if (typeof node === "string") return node === id ? acc : null;
  return (
    pathToLeaf(node.first, id, [...acc, "first"]) ??
    pathToLeaf(node.second, id, [...acc, "second"])
  );
};

const nodeAtPath = (
  node: MosaicNode<string>,
  path: MosaicBranch[],
): MosaicNode<string> =>
  path.reduce<MosaicNode<string>>(
    (n, b) => (typeof n === "string" ? n : n[b]),
    node,
  );

/** Path to the deepest split ancestor of `id` with the given split direction. */
const splitPathForAxis = (
  tree: MosaicNode<string>,
  id: string,
  direction: "row" | "column",
): MosaicBranch[] | null => {
  const path = pathToLeaf(tree, id);
  if (!path) return null;
  for (let k = path.length - 1; k >= 0; k--) {
    const parent = nodeAtPath(tree, path.slice(0, k));
    if (typeof parent !== "string" && parent.direction === direction)
      return path.slice(0, k);
  }
  return null;
};

const setSplitPercentage = (
  node: MosaicNode<string>,
  path: MosaicBranch[],
  pct: number,
): MosaicNode<string> => {
  if (typeof node === "string") return node;
  if (path.length === 0) return { ...node, splitPercentage: pct };
  const [branch, ...rest] = path;
  return { ...node, [branch]: setSplitPercentage(node[branch], rest, pct) };
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

/**
 * Move the divider of the nearest ancestor split on the given axis by a delta
 * expressed as a fraction of the whole canvas (e.g. dragPx / canvasPx). The
 * delta is rescaled to that split's local subtree so dragging tracks the
 * pointer regardless of nesting depth. Returns the tree unchanged when the leaf
 * has no split on that axis.
 */
export const resizeNearestSplit = (
  tree: MosaicNode<string>,
  id: string,
  axis: Axis,
  deltaFraction: number,
): MosaicNode<string> => {
  const direction = axis === "x" ? "row" : "column";
  const splitPath = splitPathForAxis(tree, id, direction);
  if (!splitPath) return tree;

  const split = nodeAtPath(tree, splitPath);
  if (typeof split === "string") return tree;

  // Bounding extent of this split's subtree on the axis, as a canvas fraction.
  const rects = leafRects(tree);
  const ids = getLeaves(split);
  let lo = Infinity;
  let hi = -Infinity;
  for (const leaf of ids) {
    const r = rects.get(leaf);
    if (!r) continue;
    lo = Math.min(lo, axis === "x" ? r.x : r.y);
    hi = Math.max(hi, axis === "x" ? r.x + r.w : r.y + r.h);
  }
  const subFraction = (hi - lo) / 100;
  if (subFraction <= 0) return tree;

  const current = split.splitPercentage ?? 50;
  const localDelta = (deltaFraction / subFraction) * 100;
  return setSplitPercentage(tree, splitPath, clamp(current + localDelta, 8, 92));
};
