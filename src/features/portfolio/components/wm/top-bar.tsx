"use client";

import type { FC } from "react";

import { CONTENT_APPS } from "@/src/features/portfolio/lib/config/apps.config";
import { useDeskStamp } from "@/src/features/portfolio/hooks/use-desktop-clock";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import {
  WORKSPACE_IDS,
  type WorkspaceId,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { ThemePanel } from "@/src/features/portfolio/components/wm/theme-panel";
import type { SchemeName } from "@/src/shared/types/portfolio";

interface AppearanceProps {
  scheme: SchemeName;
  setScheme: (s: SchemeName) => void;
  wallpaperId: string;
  setWallpaperId: (id: string) => void;
}

interface Props {
  appearance: AppearanceProps;
  onOpenLauncher: () => void;
}

const Divider: FC = () => <span className="text-fg-4">│</span>;

export const TopBar: FC<Props> = ({ appearance, onOpenLauncher }) => {
  const { state, switchWorkspace, openApp } = useWorkspace();
  const stamp = useDeskStamp();
  const { handle } = portfolioContent.user;

  return (
    <div className="pointer-events-auto fixed inset-x-0 top-0 z-40 hidden h-7 items-center justify-between gap-3 border-b border-fg-4 bg-bg-0 px-3 text-[10.5px] tracking-[0.06em] whitespace-nowrap text-fg-2 lg:flex">
      {/* left: launcher + workspaces + content nav */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenLauncher}
          className="flex items-center gap-1.5 text-fg-1 hover:text-fg-0"
        >
          <span className="text-amber">◆</span>
          <span className="uppercase tracking-[0.12em]">apps</span>
        </button>
        <Divider />
        <div className="flex items-center gap-1.5 text-[9px]">
          {WORKSPACE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => switchWorkspace(id)}
              className={
                state.active === id ? "text-amber" : "text-fg-3 hover:text-fg-2"
              }
            >
              {state.active === id ? "●" : "○"}
            </button>
          ))}
        </div>
        <Divider />
        <div className="flex items-center gap-3">
          {CONTENT_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => openApp(app.id)}
              className="uppercase tracking-[0.06em] text-fg-3 hover:text-fg-1"
            >
              {app.label}
            </button>
          ))}
        </div>
      </div>

      {/* right: theme panel + clock + handle chip */}
      <div className="flex items-center gap-3">
        <ThemePanel {...appearance} />
        <Divider />
        <span className="text-fg-1">{stamp}</span>
        <Divider />
        <span className="flex items-center gap-1.5 bg-bg-2 px-1.5 py-[3px] text-fg-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          <span className="uppercase tracking-[0.08em]">{handle}</span>
        </span>
      </div>
    </div>
  );
};
