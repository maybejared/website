"use client";

import type { FC } from "react";
import { useState } from "react";

import { APP_BY_ID, type AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { leafRects } from "@/src/features/portfolio/lib/wm/mosaic-geometry";
import {
  WORKSPACE_IDS,
  type WorkspaceId,
  type WorkspaceState,
} from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "dashboard" | "workspaces";

/** App labels for every window on a workspace, in tree order. */
const workspaceApps = (state: WorkspaceState, id: WorkspaceId): string[] => {
  const tree = state.layouts[id];
  if (!tree) return [];
  return [...leafRects(tree).keys()].map(
    (leaf) => APP_BY_ID[state.instances[leaf] as AppId]?.label ?? leaf,
  );
};

export const Dashboard: FC<Props> = ({ open, onClose }) => {
  const { state, switchWorkspace } = useWorkspace();
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, now } = portfolioContent;

  if (!open) return null;

  return (
    <section
      aria-label="dashboard"
      className="absolute left-1/2 top-0 z-40 w-[620px] max-w-[88%] -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-0 border-fg-4/60 bg-bg-1 shadow-[0_28px_70px_-28px_rgba(0,0,0,0.85)]"
    >
      <div role="tablist" className="flex justify-center gap-1 px-2 pt-2">
        {(["dashboard", "workspaces"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-[12px] transition-colors",
              tab === t
                ? "bg-amber/15 text-amber"
                : "text-fg-3 hover:text-fg-1",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "dashboard" ? (
        <div className="grid grid-cols-[1.2fr_1fr] gap-2.5 p-3">
          <div className="min-w-0 rounded-xl border border-fg-4/60 bg-bg-2/60 px-4 py-3">
            <div className="mb-2 text-[10px] tracking-[0.05em] text-amber">
              {user.handle}@fjell
            </div>
            <dl className="text-[11.5px] leading-[1.7]">
              <div className="flex gap-3">
                <dt className="w-14 flex-none text-fg-3">name</dt>
                <dd className="min-w-0 break-words text-fg-1">{user.name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 flex-none text-fg-3">role</dt>
                <dd className="min-w-0 break-words text-fg-1">{user.role}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 flex-none text-fg-3">based</dt>
                <dd className="min-w-0 break-words text-fg-1">{user.based}</dd>
              </div>
            </dl>
          </div>
          <div className="min-w-0 rounded-xl border border-fg-4/60 bg-bg-2/60 px-4 py-3">
            <div className="mb-2 text-[10px] tracking-[0.05em] text-amber">
              ~/now
            </div>
            <ul className="flex flex-col gap-1 font-sans text-[12px] text-fg-2">
              {now.items.slice(0, 3).map((item) => (
                <li key={item} className="truncate">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5 p-3">
          {WORKSPACE_IDS.map((id) => {
            const apps = workspaceApps(state, id);
            const current = state.active === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={`workspace ${id}`}
                onClick={() => {
                  switchWorkspace(id);
                  onClose();
                }}
                className={cn(
                  "relative flex aspect-[16/10] flex-col items-start gap-0.5 overflow-hidden rounded-xl border bg-bg-2/60 p-2 text-left text-[10px]",
                  current
                    ? "border-amber/60"
                    : "border-fg-4/60 hover:border-fg-3",
                )}
              >
                {apps.length === 0 ? (
                  <span className="m-auto text-fg-4">empty</span>
                ) : (
                  apps.map((label, i) => (
                    <span key={`${label}-${i}`} className="truncate text-fg-2">
                      {label}
                    </span>
                  ))
                )}
                <span
                  className={cn(
                    "absolute bottom-1 right-2",
                    current ? "text-amber" : "text-fg-4",
                  )}
                >
                  {id}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
