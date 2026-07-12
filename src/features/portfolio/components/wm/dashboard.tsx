"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { DashMedia } from "@/src/features/portfolio/components/wm/dash-media";
import { DashPerformance } from "@/src/features/portfolio/components/wm/dash-performance";
import { ShellCorner } from "@/src/features/portfolio/components/wm/shell-corner";
import { APP_BY_ID } from "@/src/features/portfolio/lib/config/apps.config";
import { workspaceAppIds } from "@/src/features/portfolio/lib/wm/workspace-apps";
import { WORKSPACE_IDS } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import { fadeShift, shellSpring } from "@/src/features/portfolio/lib/wm/transitions";
import { useMeasuredHeight } from "@/src/features/portfolio/hooks/use-measured-height";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  onClose: () => void;
}

type Tab = "dashboard" | "media" | "performance" | "workspaces";
const TABS: Tab[] = ["dashboard", "media", "performance", "workspaces"];

export const Dashboard: FC<Props> = ({ onClose }) => {
  const { state, switchWorkspace } = useWorkspace();
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, now } = portfolioContent;
  const reduced = useReducedMotion();
  const { ref: bodyRef, height } = useMeasuredHeight<HTMLDivElement>();
  const panelRef = useRef<HTMLElement>(null);

  const transition = reduced ? { duration: 0 } : shellSpring;

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if ((t as HTMLElement).closest?.('[aria-label="toggle dashboard"]')) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onClose]);

  const leaveTimer = useRef<number | null>(null);
  const cancelLeave = () => {
    if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
  };
  const scheduleLeave = () => {
    cancelLeave();
    leaveTimer.current = window.setTimeout(onClose, 300);
  };
  useEffect(() => cancelLeave, []);

  return (
    <motion.section
      ref={panelRef}
      aria-label="dashboard"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -24, opacity: 0 }}
      transition={transition}
      className="absolute inset-x-0 top-0 z-40 mx-auto w-[620px] max-w-[88%]"
      onMouseEnter={cancelLeave}
      onMouseLeave={scheduleLeave}
    >
      <ShellCorner notch="bl" className="absolute right-full top-0" />
      <ShellCorner notch="br" className="absolute left-full top-0" />
      <div className="overflow-hidden rounded-b-2xl bg-bg-1 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
        <div role="tablist" className="flex justify-center gap-1 px-2 pt-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "relative rounded-lg px-4 py-1.5 text-[12px] transition-colors",
                tab === t ? "text-amber" : "text-fg-3 hover:text-fg-1",
              )}
            >
              {tab === t && (
                <motion.span
                  layoutId="dash-tab-pill"
                  transition={transition}
                  className="absolute inset-0 rounded-lg bg-amber/15"
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        <motion.div
          animate={{ height }}
          transition={transition}
          className="overflow-hidden"
        >
          <div ref={bodyRef}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={tab}
                {...fadeShift}
                transition={reduced ? { duration: 0 } : fadeShift.transition}
              >
                {tab === "dashboard" && (
                  <div className="grid grid-cols-[1.2fr_1fr] gap-2.5 p-3">
                    <div className="min-w-0 rounded-xl bg-bg-2 px-4 py-3">
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
                    <div className="min-w-0 rounded-xl bg-bg-2 px-4 py-3">
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
                )}
                {tab === "media" && <DashMedia />}
                {tab === "performance" && <DashPerformance />}
                {tab === "workspaces" && (
                  <div className="grid grid-cols-4 gap-2.5 p-3">
                    {WORKSPACE_IDS.map((id) => {
                      const apps = workspaceAppIds(state, id).map(
                        (appId) => APP_BY_ID[appId]?.label ?? appId,
                      );
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
                            "relative flex aspect-[16/10] flex-col items-start gap-0.5 overflow-hidden rounded-xl bg-bg-2 p-2 text-left text-[10px]",
                            current
                              ? "ring-1 ring-amber/60"
                              : "hover:bg-bg-3",
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
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
