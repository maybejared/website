import { type MosaicNode, getLeaves } from "react-mosaic-component";

import {
  focusAfterClose,
  insertDwindle,
} from "@/src/features/portfolio/lib/wm/mosaic-geometry";

export type WorkspaceId = 1 | 2 | 3 | 4;
export const WORKSPACE_IDS: WorkspaceId[] = [1, 2, 3, 4];

export interface WorkspaceState {
  active: WorkspaceId;
  layouts: Record<WorkspaceId, MosaicNode<string> | null>;
  instances: Record<string, string>; // instanceId -> appId
  focused: string | null; // instanceId
}

export type WorkspaceAction =
  | { type: "switch"; workspace: WorkspaceId }
  | { type: "open"; appId: string; multiInstance?: boolean }
  | { type: "close"; instanceId: string }
  | { type: "focus"; instanceId: string }
  | { type: "setLayout"; node: MosaicNode<string> | null };

const emptyLayouts = (): Record<WorkspaceId, MosaicNode<string> | null> => ({
  1: null,
  2: null,
  3: null,
  4: null,
});

export function initialWorkspaceState(seed: {
  workspace: WorkspaceId;
  instances: { id: string; appId: string }[];
  layout: MosaicNode<string> | null;
}): WorkspaceState {
  const layouts = emptyLayouts();
  layouts[seed.workspace] = seed.layout;
  const instances: Record<string, string> = {};
  for (const { id, appId } of seed.instances) instances[id] = appId;
  return {
    active: seed.workspace,
    layouts,
    instances,
    focused: seed.instances[0]?.id ?? null,
  };
}

export type WorkspaceSeed = Parameters<typeof initialWorkspaceState>[0];

export function findInstanceWorkspace(
  state: WorkspaceState,
  instanceId: string,
): WorkspaceId | null {
  for (const id of WORKSPACE_IDS) {
    const tree = state.layouts[id];
    if (tree && getLeaves(tree).includes(instanceId)) return id;
  }
  return null;
}

/**
 * Add a leaf via dwindle: an empty workspace becomes the leaf; otherwise split
 * the focused window (or the last leaf when focus is elsewhere) along its longer
 * axis, so windows tile in a Fibonacci spiral.
 */
function addLeaf(
  tree: MosaicNode<string> | null,
  leaf: string,
  focused: string | null,
): MosaicNode<string> {
  if (tree === null) return leaf;
  const leaves = getLeaves(tree);
  const target =
    focused && leaves.includes(focused) ? focused : leaves[leaves.length - 1];
  return insertDwindle(tree, target, leaf);
}

/** Remove a leaf, collapsing its parent. Returns the remaining tree or null. */
function removeLeaf(
  tree: MosaicNode<string> | null,
  leaf: string,
): MosaicNode<string> | null {
  if (tree === null) return null;
  if (typeof tree === "string") return tree === leaf ? null : tree;
  const first = removeLeaf(tree.first, leaf);
  const second = removeLeaf(tree.second, leaf);
  if (first === null) return second;
  if (second === null) return first;
  return { ...tree, first, second };
}

function nextInstanceId(state: WorkspaceState, appId: string): string {
  let n = 1;
  while (state.instances[`${appId}:${n}`]) n += 1;
  return `${appId}:${n}`;
}

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    case "switch":
      return { ...state, active: action.workspace };

    case "open": {
      if (!action.multiInstance) {
        // Singleton: focus the existing instance if it is already open.
        if (state.instances[action.appId]) {
          const ws = findInstanceWorkspace(state, action.appId) ?? state.active;
          return { ...state, active: ws, focused: action.appId };
        }
        const tree = addLeaf(
          state.layouts[state.active],
          action.appId,
          state.focused,
        );
        return {
          ...state,
          instances: { ...state.instances, [action.appId]: action.appId },
          layouts: { ...state.layouts, [state.active]: tree },
          focused: action.appId,
        };
      }
      const id = nextInstanceId(state, action.appId);
      const tree = addLeaf(state.layouts[state.active], id, state.focused);
      return {
        ...state,
        instances: { ...state.instances, [id]: action.appId },
        layouts: { ...state.layouts, [state.active]: tree },
        focused: id,
      };
    }

    case "close": {
      const ws = findInstanceWorkspace(state, action.instanceId);
      const instances = { ...state.instances };
      delete instances[action.instanceId];
      const layouts = { ...state.layouts };
      const oldTree = ws ? state.layouts[ws] : null;
      if (ws) layouts[ws] = removeLeaf(layouts[ws], action.instanceId);
      // Closing the focused window hands focus to the nearest surviving window
      // rather than leaving the desktop with nothing focused.
      const focused =
        state.focused === action.instanceId
          ? focusAfterClose(oldTree, action.instanceId)
          : state.focused;
      return { ...state, instances, layouts, focused };
    }

    case "focus":
      return { ...state, focused: action.instanceId };

    case "setLayout":
      return {
        ...state,
        layouts: { ...state.layouts, [state.active]: action.node },
      };

    default:
      return state;
  }
}
