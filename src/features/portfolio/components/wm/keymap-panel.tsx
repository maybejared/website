"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { KEYMAP_ACTIONS } from "@/src/features/portfolio/lib/config/keymap.config";
import type {
  Binding,
  KeymapActionId,
  KeymapMod,
} from "@/src/features/portfolio/lib/config/keymap.config";
import {
  conflictLabel,
  type KeymapState,
} from "@/src/features/portfolio/hooks/use-keymap";
import { cn } from "@/src/shared/lib/utils";

interface Props {
  keymap: KeymapState;
  open: boolean;
  onClose: () => void;
}

type RowId = KeymapActionId | "leader";

const BARE_MODIFIERS = ["Control", "Alt", "Shift", "Meta"];

/**
 * Translate a captured keydown into a Binding. The leader row always produces a
 * direct (non-leader) bind. Action rows stay in the leader model unless a hard
 * modifier (ctrl/alt/meta) is held — then they become a custom direct bind.
 */
const toBinding = (e: KeyboardEvent, row: RowId): Binding => {
  const key = e.key.toLowerCase();
  const mods: KeymapMod[] = [];
  if (e.ctrlKey) mods.push("ctrl");
  if (e.altKey) mods.push("alt");
  if (e.metaKey) mods.push("meta");
  if (e.shiftKey) mods.push("shift");

  if (row === "leader") {
    return { leader: false, key, mods: mods.length ? mods : undefined };
  }
  const hardMods = mods.filter((m) => m !== "shift");
  return hardMods.length ? { leader: false, key, mods } : { leader: true, key };
};

export const KeymapPanel: FC<Props> = ({ keymap, open, onClose }) => {
  const [capturing, setCapturing] = useState<RowId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Outside-click closes the panel, but not mid-capture.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (capturing) return;
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open, capturing, onClose]);

  // Scoped capture listener — reads the next combo for the row being rebound.
  useEffect(() => {
    if (!capturing) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setCapturing(null);
        setError(null);
        return;
      }
      if (BARE_MODIFIERS.includes(e.key)) return; // wait for the real key

      const combo = toBinding(e, capturing);
      if (keymap.isReserved(combo)) {
        setError("That combo is reserved by the browser/OS.");
        return;
      }
      const conflict = keymap.findConflict(combo, capturing);
      if (conflict) {
        setError(`Already bound to ${conflictLabel(conflict)}.`);
        return;
      }
      keymap.setBinding(capturing, combo);
      setCapturing(null);
      setError(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [capturing, keymap]);

  // Escape closes the panel when not mid-capture.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !capturing) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, capturing, onClose]);

  if (!open) return null;

  const rows: { id: RowId; label: string; description: string; binding: Binding }[] =
    [
      {
        id: "leader",
        label: "Leader",
        description: "Arms the chord; press, then a command key",
        binding: keymap.leader,
      },
      ...KEYMAP_ACTIONS.map((a) => ({
        id: a.id,
        label: a.label,
        description: a.description,
        binding: keymap.bindings[a.id],
      })),
    ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-0/80">
      <div
        ref={boxRef}
        className="w-[560px] border border-fg-4 bg-bg-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-fg-4 px-3 py-1.5 text-[11px] uppercase tracking-[0.06em] text-fg-3">
          <span>keybinds</span>
          <button
            type="button"
            onClick={onClose}
            className="text-fg-4 hover:text-fg-1"
          >
            esc
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {rows.map((row) => {
            const isCapturing = capturing === row.id;
            return (
              <div
                key={row.id}
                className="flex items-center gap-3 border-b border-fg-4/50 px-3 py-2 text-[12px]"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-fg-1">{row.label}</div>
                  <div className="truncate text-[10.5px] text-fg-4">
                    {row.description}
                  </div>
                </div>
                <span
                  className={cn(
                    "min-w-[120px] text-right tracking-[0.04em]",
                    isCapturing ? "text-amber" : "text-fg-2",
                  )}
                >
                  {isCapturing ? "press a combo…" : keymap.format(row.binding)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCapturing((c) => (c === row.id ? null : row.id));
                  }}
                  className={cn(
                    "w-[64px] border border-fg-4 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]",
                    isCapturing
                      ? "border-amber text-amber"
                      : "text-fg-3 hover:text-fg-1",
                  )}
                >
                  {isCapturing ? "cancel" : "rebind"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 px-3 py-2 text-[10.5px]">
          <span className="text-red">{error ?? ""}</span>
          <button
            type="button"
            onClick={() => {
              keymap.reset();
              setError(null);
            }}
            className="uppercase tracking-[0.08em] text-fg-3 hover:text-fg-1"
          >
            reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
};
