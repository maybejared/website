"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const GAUGES: { label: string; base: number; phase: number; tint: string }[] = [
  { label: "cpu", base: 34, phase: 0, tint: "bg-amber" },
  { label: "mem", base: 58, phase: 1.4, tint: "bg-cyan" },
  { label: "disk", base: 71, phase: 2.9, tint: "bg-magenta" },
  { label: "net", base: 22, phase: 4.1, tint: "bg-yellow" },
];

/** Deterministic wander so the gauges feel alive without real metrics. */
const gaugeValue = (base: number, phase: number, t: number): number =>
  Math.min(94, Math.max(6, base + Math.sin(t / 2.6 + phase) * 14));

export const DashPerformance: FC = () => {
  const [tick, setTick] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1200);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="flex flex-col gap-2.5 p-4 font-mono">
      {GAUGES.map(({ label, base, phase, tint }) => {
        const value = gaugeValue(base, phase, tick);
        return (
          <div key={label} className="flex items-center gap-3 text-[11px]">
            <span className="w-8 flex-none text-fg-3">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-2">
              <motion.span
                className={`block h-full rounded-full ${tint}`}
                animate={{ width: `${value}%` }}
                transition={{ duration: reduced ? 0 : 1.1, ease: "easeInOut" }}
              />
            </div>
            <span className="w-9 flex-none text-right text-fg-2 tabular-nums">
              {Math.round(value)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};
