import { APPS, type AppMeta } from "@/src/features/portfolio/lib/config/apps.config";
import { SCHEMES } from "@/src/features/portfolio/lib/config/schemes";
import { WALLPAPERS } from "@/src/features/portfolio/lib/config/wallpapers";
import { POSTS } from "@/src/content/portfolio/posts-client";
import type { SchemeName } from "@/src/shared/types/portfolio";

export interface PaletteDeps {
  openApp: (appId: string) => void;
  openPost: (slug: string) => void;
  setScheme: (s: SchemeName) => void;
  setWallpaperId: (id: string) => void;
}

export interface PaletteItem {
  key: string;
  kind: "app" | "post" | "scheme" | "wallpaper";
  label: string;
  hint: string;
  /** CDN-relative preview path for wallpaper items (null → flat swatch). */
  thumbSrc?: string | null;
  run: () => void;
}

const matches = (needle: string, ...hay: string[]): boolean =>
  hay.join(" ").toLowerCase().includes(needle);

/**
 * Rofi-style item model. Plain queries search apps and posts (empty query =
 * apps only, so the default view is the launcher). A leading ">" enters
 * action mode: schemes and wallpapers, narrowed by the rest of the query —
 * ">wallpaper" shows the thumbnail strip, ">scheme mo" filters schemes.
 */
export const buildPaletteItems = (
  query: string,
  deps: PaletteDeps,
  // The mobile sheet passes CONTENT_APPS — decor windows mean nothing there.
  appList: AppMeta[] = APPS,
): PaletteItem[] => {
  const q = query.trim().toLowerCase();

  if (q.startsWith(">")) {
    const cmd = q.slice(1).trim();
    const schemes: PaletteItem[] = SCHEMES.map((s) => ({
      key: `scheme-${s}`,
      kind: "scheme",
      label: s,
      hint: "scheme",
      run: () => deps.setScheme(s),
    }));
    const walls: PaletteItem[] = WALLPAPERS.map((w) => ({
      key: `wallpaper-${w.id}`,
      kind: "wallpaper",
      label: w.label,
      hint: "wallpaper",
      thumbSrc: w.image ? w.image.webp[0].src : null,
      run: () => deps.setWallpaperId(w.id),
    }));
    return [...schemes, ...walls].filter((i) =>
      matches(cmd, i.hint, i.label),
    );
  }

  const apps: PaletteItem[] = appList.map((a) => ({
    key: `app-${a.id}`,
    kind: "app",
    label: a.label,
    hint: a.id,
    run: () => deps.openApp(a.id),
  }));
  if (q === "") return apps;

  const posts: PaletteItem[] = POSTS.map((p) => ({
    key: `post-${p.slug}`,
    kind: "post",
    label: p.title,
    hint: p.tag,
    run: () => deps.openPost(p.slug),
  }));
  return [
    ...apps.filter((i) => matches(q, i.label, i.hint)),
    ...posts.filter((i) => matches(q, i.label, i.hint)),
  ];
};
