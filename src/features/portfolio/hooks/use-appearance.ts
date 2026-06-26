import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SCHEME,
  SCHEMES,
} from "@/src/features/portfolio/lib/config/schemes";
import { DEFAULT_WALLPAPER_ID } from "@/src/features/portfolio/lib/config/wallpapers";
import type { SchemeName } from "@/src/shared/types/portfolio";

const KEY = "portfolio:appearance";
interface Appearance { scheme: SchemeName; wallpaperId: string }

const read = (): Appearance => {
  if (typeof window === "undefined")
    return { scheme: DEFAULT_SCHEME, wallpaperId: DEFAULT_WALLPAPER_ID };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw)
      return {
        scheme: DEFAULT_SCHEME,
        wallpaperId: DEFAULT_WALLPAPER_ID,
        ...JSON.parse(raw),
      };
  } catch {}
  return { scheme: DEFAULT_SCHEME, wallpaperId: DEFAULT_WALLPAPER_ID };
};

export function useAppearance() {
  const [state, setState] = useState<Appearance>(read);

  useEffect(() => {
    const body = document.body;
    SCHEMES.forEach((s) => body.classList.remove("scheme-" + s));
    body.classList.add("scheme-" + state.scheme);
  }, [state.scheme]);

  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setScheme = useCallback(
    (scheme: SchemeName) => setState((s) => ({ ...s, scheme })), []);
  const setWallpaperId = useCallback(
    (wallpaperId: string) => setState((s) => ({ ...s, wallpaperId })), []);

  return { scheme: state.scheme, setScheme, wallpaperId: state.wallpaperId, setWallpaperId };
}
