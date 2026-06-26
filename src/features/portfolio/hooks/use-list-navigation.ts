import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useWindowFocus } from "@/src/features/portfolio/hooks/use-window-focus";
import {
  ITEM_PARAM,
  indexFromSlug,
} from "@/src/features/portfolio/lib/selection.util";
import type { Identifiable } from "@/src/shared/types/portfolio";

interface ListNavigation {
  /** Highlighted/active index — drives the desktop detail pane + list highlight. */
  selected: number;
  /** Move the highlight without touching the URL (transient ↑/↓ navigation). */
  setSelected: (index: number) => void;
  /** Commit a selection: highlight it and write `?item=<slug>` (opens detail on mobile). */
  open: (index: number) => void;
  /** True when a valid `?item=` is in the URL — mobile shows the detail pane. */
  opened: boolean;
  /** Clear `?item=` (back / Esc) — mobile returns to the list. */
  close: () => void;
}

/**
 * Owns the selected-row index for a list section and keeps it in sync with the
 * URL. `↑`/`↓` move a transient local highlight; clicking/`Enter` commits the
 * selection to `?item=<slug>` so it's shareable and survives reload. A valid
 * param opens the detail pane on mobile; `Esc`/back clears it. An unknown slug
 * falls back to the first entry and scrubs the stale param from the URL.
 */
export function useListNavigation(
  items: readonly Identifiable[],
): ListNavigation {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const focused = useWindowFocus();

  const slugs = useMemo(() => items.map((item) => item.slug), [items]);
  const slugParam = searchParams.get(ITEM_PARAM);
  const resolved = indexFromSlug(slugParam, slugs);
  const opened = resolved !== null;

  const [selected, setSelected] = useState(resolved ?? 0);

  // When the URL drives the selection (deep link, browser back/forward), snap
  // the highlight to it during render — the React-recommended alternative to a
  // sync effect. A closed/absent param leaves the highlight where it was so the
  // list doesn't jump.
  const [urlSelected, setUrlSelected] = useState(resolved);
  if (resolved !== null && resolved !== urlSelected) {
    setUrlSelected(resolved);
    setSelected(resolved);
  }

  const open = useCallback(
    (index: number) => {
      setSelected(index);
      const params = new URLSearchParams(searchParams.toString());
      params.set(ITEM_PARAM, slugs[index]);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, slugs],
  );

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(ITEM_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  // Self-heal a stale/invalid `?item=` slug by scrubbing it from the URL (8A).
  useEffect(() => {
    if (slugParam !== null && resolved === null) close();
  }, [slugParam, resolved, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!focused) return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        open(selected);
      } else if (e.key === "Escape" && opened) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, items.length, open, close, opened, selected]);

  return { selected, setSelected, open, opened, close };
}
