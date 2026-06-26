"use client";
import type { FC, ReactNode } from "react";
import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  focused: boolean;
  onFocus: () => void;
  children: ReactNode;
}

// Body wrapper only — the title bar lives in the Mosaic toolbar (see
// window-toolbar.tsx) so it can double as the drag handle. This supplies the
// focused border and the scrollable content region.
export const WindowFrame: FC<Props> = ({ focused, onFocus, children }) => (
  <div
    onMouseDown={onFocus}
    className={cn(
      "h-full min-h-0 flex-1 overflow-auto border bg-bg-1",
      focused ? "border-amber/70" : "border-fg-4",
    )}
  >
    <WindowFocusContext.Provider value={focused}>{children}</WindowFocusContext.Provider>
  </div>
);
