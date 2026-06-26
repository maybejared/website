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
        const title = meta?.title ?? instanceId;
        return (
          <MosaicWindow<string>
            path={path}
            title={title}
            // react-dnd v16 requires a native element from renderToolbar — it
            // rejects composite components. Render the toolbar as a plain <div>
            // so the drag connector receives a DOM node.
            renderToolbar={() => (
              <div className="flex h-full flex-1 items-center gap-2 px-2 py-1 text-[11px] text-fg-2">
                <button
                  type="button"
                  aria-label="close"
                  onClick={() => closeApp(instanceId)}
                  className="h-2 w-2 flex-none rounded-full bg-red-dim hover:bg-red"
                />
                <span className="truncate">{title}</span>
              </div>
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
