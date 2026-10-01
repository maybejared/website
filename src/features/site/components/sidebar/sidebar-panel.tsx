import { ArrowLink, Label } from "@/src/shared/ui";
import type { CSSProperties, FC, ReactNode } from "react";

import { cn } from "@/src/shared/lib/utils";

interface Props {
  title: string;
  index?: string;
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
}

const tick: CSSProperties = {
  position: "absolute",
  background: "var(--color-ink)",
  zIndex: 4,
};

/** Small ink ticks that mark where the panel rule meets the sidebar edges. */
const ticks: CSSProperties[] = [
  { ...tick, right: -1, bottom: -8.5, width: 1, height: 16 },
  { ...tick, right: 0, bottom: -1, width: 12, height: 1 },
  { ...tick, left: -1, bottom: -8.5, width: 1, height: 16 },
  { ...tick, left: 0, bottom: -1, width: 12, height: 1 },
];

export const SidebarPanel: FC<Props> = ({
  title,
  index,
  action,
  children,
  className,
}) => (
  <div
    className={cn(
      "relative flex flex-col gap-3 border-b border-border p-5",
      className,
    )}
  >
    {ticks.map((style, i) => (
      <span key={i} style={style} />
    ))}
    <div className="flex items-center justify-between">
      <Label tone="ink">{title}</Label>
      {index && <Label tone="accent">{index}</Label>}
      {action && <ArrowLink href={action.href}>{action.label}</ArrowLink>}
    </div>
    {children}
  </div>
);
