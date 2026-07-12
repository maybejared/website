import type { AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { leafRects } from "@/src/features/portfolio/lib/wm/mosaic-geometry";
import type {
  WorkspaceId,
  WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";

/** App ids for every window on a workspace, in tree order. */
export const workspaceAppIds = (
  state: WorkspaceState,
  id: WorkspaceId,
): AppId[] => {
  const tree = state.layouts[id];
  if (!tree) return [];
  return [...leafRects(tree).keys()]
    .map((leaf) => state.instances[leaf] as AppId | undefined)
    .filter((appId): appId is AppId => appId !== undefined);
};
