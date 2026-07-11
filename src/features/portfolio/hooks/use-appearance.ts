import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_SCHEME,
  SCHEMES,
} from "@/src/features/portfolio/lib/config/schemes";
import { DEFAULT_WALLPAPER_ID } from "@/src/features/portfolio/lib/config/wallpapers";
import type { SchemeName } from "@/src/shared/types/portfolio";

const KEY = "portfolio:appearance";
interface Appearance { scheme: SchemeName; wallpaperId: string }

const DEFAULTS: Appearance = {
  scheme: DEFAULT_SCHEME,
  wallpaperId: DEFAULT_WALLPAPER_ID,
};

// A tiny external store over localStorage. useSyncExternalStore renders the
// server snapshot (defaults) during hydration and swaps to the client snapshot
// without a mismatch — the SSR-safe way to surface persisted appearance.
let cache: Appearance = DEFAULTS;
let cacheRaw: string | null = null;

const getSnapshot = (): Appearance => {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {}
  if (raw === cacheRaw) return cache; // stable reference while unchanged
  cacheRaw = raw;
  try {
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    cache = DEFAULTS;
  }
  return cache;
};

const getServerSnapshot = (): Appearance => DEFAULTS;

const listeners = new Set<() => void>();

const subscribe = (cb: () => void): (() => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb); // sync across tabs
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

const write = (next: Appearance): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  cacheRaw = null; // force re-parse on the next snapshot
  listeners.forEach((l) => l());
};

export function useAppearance() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const body = document.body;
    SCHEMES.forEach((s) => body.classList.remove("scheme-" + s));
    body.classList.add("scheme-" + state.scheme);
  }, [state.scheme]);

  const setScheme = useCallback(
    (scheme: SchemeName) => write({ ...getSnapshot(), scheme }),
    [],
  );
  const setWallpaperId = useCallback(
    (wallpaperId: string) => write({ ...getSnapshot(), wallpaperId }),
    [],
  );

  return {
    scheme: state.scheme,
    setScheme,
    wallpaperId: state.wallpaperId,
    setWallpaperId,
  };
}

export type AppearanceState = ReturnType<typeof useAppearance>;
