"use client";
import type { FC, RefObject } from "react";
import { useRef, useState } from "react";

import { APP_BY_ID, type AppId } from "@/src/features/portfolio/lib/config/apps.config";
import { WindowFrame } from "@/src/features/portfolio/components/wm/window-frame";
import {
  leafAtPoint,
  leafRects,
  moveLeafToZone,
  resizeNearestSplit,
  zoneForPoint,
} from "@/src/features/portfolio/lib/wm/mosaic-geometry";
import { useWorkspace } from "@/src/features/portfolio/providers/workspace-provider";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  /** True while the leader key is physically held — gates leader+drag gestures. */
  leaderHeld: RefObject<boolean>;
}

/**
 * Custom BSP tiling field. Renders each leaf of the workspace's Mosaic tree as
 * an absolutely-positioned window from {@link leafRects}, and implements the
 * Hyprland-style gestures directly:
 *   - leader + left-drag: a floating ghost follows the cursor while the layout
 *     live-previews the drop — siblings reflow to open a slot on the nearest
 *     edge zone of the window under the pointer; release commits the re-tile.
 *   - leader + right-drag: resize by nudging the nearest row/column split.
 * No react-dnd, so no React 19 ref warning.
 */
export const Desktop: FC<Props> = ({ leaderHeld }) => {
  const { state, setLayout, closeApp, focusApp } = useWorkspace();
  const tree = state.layouts[state.active];
  const fieldRef = useRef<HTMLDivElement>(null);
  // Active gesture lives in a ref so pointer math never triggers re-renders.
  const gesture = useRef<{
    kind: "move" | "resize";
    id: string;
    startX: number;
    startY: number;
    snapshot: typeof tree;
    rect: DOMRect;
  } | null>(null);
  // Drag preview: the tree to render mid-drag, the leaf being moved (drawn as a
  // placeholder slot), and the floating ghost following the cursor.
  const [preview, setPreview] = useState<typeof tree>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [ghost, setGhost] = useState<{ x: number; y: number; title: string } | null>(null);

  const pointFraction = (ev: MouseEvent, rect: DOMRect) => ({
    x: ((ev.clientX - rect.left) / rect.width) * 100,
    y: ((ev.clientY - rect.top) / rect.height) * 100,
  });

  // The re-tiled layout for the current pointer position, or the snapshot when
  // the pointer isn't over a droppable target.
  const dropPreview = (
    snapshot: NonNullable<typeof tree>,
    id: string,
    x: number,
    y: number,
  ): NonNullable<typeof tree> => {
    const target = leafAtPoint(snapshot, x, y);
    if (!target || target === id) return snapshot;
    const targetRect = leafRects(snapshot).get(target);
    if (!targetRect) return snapshot;
    return moveLeafToZone(snapshot, id, target, zoneForPoint(targetRect, x, y));
  };

  // Focus follows the mouse, like a sloppy-focus WM — but never mid-gesture.
  const handleLeafMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = e.currentTarget.dataset.leaf;
    if (!id || gesture.current) return;
    if (state.focused !== id) focusApp(id);
  };

  const handleLeafMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = e.currentTarget.dataset.leaf;
    if (!id) return;
    focusApp(id);
    if (!leaderHeld.current || !tree || !fieldRef.current) return;
    if (e.button !== 0 && e.button !== 2) return;
    e.preventDefault();

    const rect = fieldRef.current.getBoundingClientRect();
    const kind = e.button === 2 ? "resize" : "move";
    const snapshot = tree;
    gesture.current = { kind, id, startX: e.clientX, startY: e.clientY, snapshot, rect };

    if (kind === "move") {
      const title = APP_BY_ID[state.instances[id] as AppId]?.title ?? id;
      setDraggingId(id);
      setPreview(snapshot);
      setGhost({ x: e.clientX, y: e.clientY, title });
    } else {
      setResizing(true);
    }

    const onMove = (ev: MouseEvent) => {
      const g = gesture.current;
      if (!g || !g.snapshot) return;
      if (g.kind === "move") {
        const title = APP_BY_ID[state.instances[g.id] as AppId]?.title ?? g.id;
        setGhost({ x: ev.clientX, y: ev.clientY, title });
        const { x, y } = pointFraction(ev, g.rect);
        setPreview(dropPreview(g.snapshot, g.id, x, y));
      } else {
        const dx = (ev.clientX - g.startX) / g.rect.width;
        const dy = (ev.clientY - g.startY) / g.rect.height;
        setLayout(
          resizeNearestSplit(
            resizeNearestSplit(g.snapshot, g.id, "x", dx),
            g.id,
            "y",
            dy,
          ),
        );
      }
    };

    const onUp = (ev: MouseEvent) => {
      const g = gesture.current;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      gesture.current = null;
      setPreview(null);
      setDraggingId(null);
      setGhost(null);
      setResizing(false);
      if (!g || !g.snapshot || g.kind !== "move") return;
      const { x, y } = pointFraction(ev, g.rect);
      const next = dropPreview(g.snapshot, g.id, x, y);
      if (next !== g.snapshot) setLayout(next);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const renderTree = preview ?? tree;

  return (
    <div
      ref={fieldRef}
      data-resizing={resizing}
      className="wm-field relative h-full w-full"
      // Suppress the native context menu so leader + right-drag can resize.
      onContextMenu={(e) => {
        if (leaderHeld.current) e.preventDefault();
      }}
    >
      {renderTree &&
        [...leafRects(renderTree)].map(([id, r]) => {
          const meta = APP_BY_ID[state.instances[id] as AppId];
          const title = meta?.title ?? id;
          const focused = state.focused === id;
          const isPlaceholder = draggingId === id;
          return (
            <div
              key={id}
              data-leaf={id}
              onMouseEnter={handleLeafMouseEnter}
              onMouseDown={handleLeafMouseDown}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: `${r.w}%`,
                height: `${r.h}%`,
              }}
              className={cn(
                "wm-window absolute flex flex-col p-[3px] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.55)]",
                isPlaceholder && "opacity-40",
              )}
            >
              <div
                className={cn(
                  "wm-glass flex h-5 flex-none items-center gap-2 border border-b-0 px-2 text-[11px]",
                  focused ? "border-amber/70 bg-bg-2/75 text-fg-1" : "border-fg-4 bg-bg-0/60 text-fg-2",
                )}
              >
                <button
                  type="button"
                  aria-label="close"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => closeApp(id)}
                  className="h-2 w-2 flex-none rounded-full bg-red-dim hover:bg-red"
                />
                <span className="truncate">{title}</span>
              </div>
              <div
                className={cn(
                  "min-h-0 flex-1",
                  isPlaceholder && "ring-2 ring-inset ring-amber",
                )}
              >
                <WindowFrame focused={focused}>{meta?.render({ instanceId: id })}</WindowFrame>
              </div>
            </div>
          );
        })}

      {ghost && (
        <div
          data-drag-overlay
          style={{
            position: "fixed",
            left: ghost.x,
            top: ghost.y,
            transform: "translate(-22px, -12px) rotate(-1.5deg)",
          }}
          className="pointer-events-none z-[70] w-[260px] origin-top-left opacity-90 shadow-2xl"
        >
          <div className="flex h-5 items-center gap-2 border border-b-0 border-amber/70 bg-bg-2 px-2 text-[11px] text-fg-1">
            <span className="h-2 w-2 flex-none rounded-full bg-amber" />
            <span className="truncate">{ghost.title}</span>
          </div>
          <div className="h-28 border border-amber/70 bg-bg-1/95" />
        </div>
      )}
    </div>
  );
};
