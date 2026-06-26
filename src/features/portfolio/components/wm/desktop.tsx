"use client";
import type { FC } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import { APP_BY_ID, type AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { WindowFrame } from "@/src/features/portfolio/components/wm/window-frame";
import { WindowToolbar } from "@/src/features/portfolio/components/wm/window-toolbar";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";

export const Desktop: FC = () => {
  const { state, setLayout, closeApp, focusApp } = useWorkspace();
  const tree = state.layouts[state.active];

  return (
    <Mosaic<string>
      value={tree}
      onChange={(node) => setLayout(node)}
      className="mosaic"
      renderTile={(instanceId, path) => {
        const meta = APP_BY_ID[state.instances[instanceId] as AppId];
        const title = meta?.title ?? instanceId;
        return (
          <MosaicWindow<string>
            path={path}
            title={title}
            // Mosaic wraps the toolbar element as the window's drag source, so
            // our terminal title bar is both the chrome and the drag handle.
            renderToolbar={() => (
              <WindowToolbar title={title} onClose={() => closeApp(instanceId)} />
            )}
          >
            <WindowFrame
              focused={state.focused === instanceId}
              onFocus={() => focusApp(instanceId)}
            >
              {meta?.render({ instanceId })}
            </WindowFrame>
          </MosaicWindow>
        );
      }}
    />
  );
};
