"use client";
import type { FC } from "react";
import { Fastfetch } from "@/src/features/portfolio/components/fastfetch";

interface Props {
  instanceId: string;
}

/**
 * Decorative terminal window. The instanceId is the seam a future interactive
 * shell will use to key per-instance state (history, cwd); unused for now.
 */
export const TerminalApp: FC<Props> = ({ instanceId }) => (
  <div data-instance={instanceId} className="p-3">
    <Fastfetch />
  </div>
);
