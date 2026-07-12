"use client";

import type { ComponentType, ReactNode } from "react";

import { Panel } from "@/src/shared/ui/panel";
import { cn } from "@/src/shared/lib/utils";

export interface RowProps<T> {
  item: T;
  active: boolean;
  onClick: () => void;
}

interface MasterDetailProps<T> {
  detailLabel: string;
  listLabel: string;
  listCmd: string;
  items: T[];
  selected: number;
  open: (index: number) => void;
  opened: boolean;
  close: () => void;
  RowComponent: ComponentType<RowProps<T>>;
  renderDetail: (item: T) => ReactNode;
}

/**
 * Two-panel master/detail layout shared by experience, projects, and posts.
 * Desktop shows both panes side by side; mobile shows the list until an entry
 * is opened (`?item=`), then swaps to a full-width detail with a back control.
 */
// A generic component cannot be typed with `FC<Props>` (the helper has no slot
// for the type parameter), so it stays a generic arrow `const` per rule 1.
export const MasterDetail = <T,>({
  detailLabel,
  listLabel,
  listCmd,
  items,
  selected,
  open,
  opened,
  close,
  RowComponent,
  renderDetail,
}: MasterDetailProps<T>) => {
  const sel = items[selected] ?? items[0];
  const count = (
    <>
      {(selected + 1).toString().padStart(2, "0")}/
      {items.length.toString().padStart(2, "0")}
    </>
  );

  return (
    // Desktop (md+): fixed proportional split so the pane heights never track
    // the selected entry's content — 2/5 detail while browsing, 3/5 once a
    // detail/reader is opened. Each pane scrolls internally. Mobile keeps the
    // one-pane-at-a-time flow with natural heights.
    <div className="flex h-full flex-col max-md:block">
      <Panel
        label={detailLabel}
        accent={<span>&nbsp;{count}</span>}
        className={cn(
          opened ? "md:flex-[3]" : "max-md:hidden md:flex-[2]",
          "md:min-h-0",
        )}
      >
        {/* Back control — mobile only; desktop always shows both panes. */}
        <button
          type="button"
          onClick={close}
          className="mb-4 hidden w-full select-none items-center gap-2 border-b border-dashed border-fg-4 pb-3 text-left text-[11px] uppercase tracking-[0.12em] text-fg-2 hover:text-amber max-md:flex"
        >
          <span className="text-amber">←</span>
          <span>back</span>
          <span className="text-fg-4">·</span>
          <span className="text-fg-3">cd ..</span>
          <span className="text-fg-4">/</span>
          <span className="text-fg-3">{listLabel}</span>
        </button>
        {sel ? (
          renderDetail(sel)
        ) : (
          <div className="py-6 text-center text-[12px] text-fg-3 before:text-fg-4 before:content-['~_']">
            no selection
          </div>
        )}
      </Panel>
      <Panel
        label={listLabel}
        meta={<span>{items.length} entries</span>}
        className={cn(
          opened ? "max-md:hidden md:flex-[2]" : "md:flex-[3]",
          "md:min-h-0",
        )}
      >
        <div className="mb-2 flex items-center gap-2.5 overflow-hidden whitespace-nowrap border-b border-fg-4 pb-2.5 text-[12px] text-fg-2">
          <span className="text-amber">&gt;</span>
          <span className="min-w-0 truncate text-fg-0">{listCmd}</span>
        </div>
        <div className="flex flex-col">
          {items.map((item, i) => (
            <RowComponent
              key={i}
              item={item}
              active={i === selected}
              onClick={() => open(i)}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
};
