"use client";
import type { FC, ReactNode } from "react";
import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  title: string;
  focused: boolean;
  onClose: () => void;
  onFocus: () => void;
  children: ReactNode;
}

export const WindowFrame: FC<Props> = ({ title, focused, onClose, onFocus, children }) => (
  <div
    onMouseDown={onFocus}
    className={cn(
      "flex h-full flex-col overflow-hidden rounded-xs border bg-bg-1",
      focused ? "border-amber/70" : "border-fg-4",
    )}
  >
    <div className="flex flex-none items-center gap-2 border-b border-fg-4 bg-bg-0 px-2 py-1 text-[11px] text-fg-2">
      <button type="button" aria-label="close" onClick={onClose}
        className="h-2 w-2 rounded-full bg-red-dim hover:bg-red" />
      <span className="truncate">{title}</span>
    </div>
    <div className="min-h-0 flex-1 overflow-auto">
      <WindowFocusContext.Provider value={focused}>{children}</WindowFocusContext.Provider>
    </div>
  </div>
);
