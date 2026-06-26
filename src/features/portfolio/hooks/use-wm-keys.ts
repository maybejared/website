"use client";

import { useEffect } from "react";

import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceId } from "@/src/features/portfolio/lib/wm/workspace-reducer";

export function useWmKeys(opts: { toggleLauncher: () => void }): void {
  const { state, switchWorkspace, openApp, closeApp } = useWorkspace();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      // Alt+Space toggles the launcher even when the launcher's own input has
      // focus — handle it before the input guard so the user can close the
      // launcher by pressing Alt+Space again while typing in it.
      if (e.key === " ") {
        e.preventDefault();
        opts.toggleLauncher();
        return;
      }

      const t = e.target as HTMLElement | null;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA") return;

      if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        switchWorkspace(Number(e.key) as WorkspaceId);
      } else if (e.key.toLowerCase() === "q") {
        e.preventDefault();
        openApp("terminal");
      } else if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (state.focused) closeApp(state.focused);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.focused, switchWorkspace, openApp, closeApp, opts]);
}
