"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext, useMemo, useReducer } from "react";
import { useRouter } from "next/navigation";

import { APP_BY_ID } from "@/src/features/portfolio/lib/config/apps.config";
import {
  initialWorkspaceState,
  workspaceReducer,
  type WorkspaceId,
  type WorkspaceSeed,
  type WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";

interface WorkspaceApi {
  state: WorkspaceState;
  switchWorkspace: (id: WorkspaceId) => void;
  openApp: (appId: string) => void;
  closeApp: (instanceId: string) => void;
  focusApp: (instanceId: string) => void;
  setLayout: (node: WorkspaceState["layouts"][WorkspaceId]) => void;
  moveApp: (instanceId: string, workspace: WorkspaceId) => void;
}

const Ctx = createContext<WorkspaceApi | undefined>(undefined);

interface Props {
  children: ReactNode;
  seed: WorkspaceSeed;
}

export const WorkspaceProvider: FC<Props> = ({ children, seed }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    workspaceReducer,
    seed,
    initialWorkspaceState,
  );

  const api = useMemo<WorkspaceApi>(
    () => ({
      state,
      switchWorkspace: (workspace) => dispatch({ type: "switch", workspace }),
      openApp: (appId) => {
        const meta = APP_BY_ID[appId as keyof typeof APP_BY_ID];
        // Live viewport aspect steers dwindle: tall/narrow fields stack new
        // windows vertically instead of splitting side-by-side.
        dispatch({
          type: "open",
          appId,
          multiInstance: meta?.multiInstance,
          aspect: window.innerWidth / window.innerHeight,
        });
        if (meta?.href) router.push(meta.href);
      },
      closeApp: (instanceId) => dispatch({ type: "close", instanceId }),
      focusApp: (instanceId) => dispatch({ type: "focus", instanceId }),
      setLayout: (node) => dispatch({ type: "setLayout", node }),
      moveApp: (instanceId, workspace) =>
        dispatch({ type: "move", instanceId, workspace }),
    }),
    [state, router],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export function useWorkspace(): WorkspaceApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
