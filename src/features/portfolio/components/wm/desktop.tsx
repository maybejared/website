"use client";
import type { FC } from "react";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import { APP_BY_ID, type AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { WindowFrame } from "@/src/features/portfolio/components/wm/window-frame";
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
        return (
          <MosaicWindow<string>
            path={path}
            title={meta?.title ?? instanceId}
            renderToolbar={null}
          >
            <WindowFrame
              title={meta?.title ?? instanceId}
              focused={state.focused === instanceId}
              onFocus={() => focusApp(instanceId)}
              onClose={() => closeApp(instanceId)}
            >
              {meta?.render({ instanceId })}
            </WindowFrame>
          </MosaicWindow>
        );
      }}
    />
  );
};
