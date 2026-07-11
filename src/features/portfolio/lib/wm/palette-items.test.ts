import { describe, expect, it, vi } from "vitest";

import {
  buildPaletteItems,
  type PaletteDeps,
} from "@/src/features/portfolio/lib/wm/palette-items";

const deps = (): PaletteDeps => ({
  openApp: vi.fn(),
  openPost: vi.fn(),
  setScheme: vi.fn(),
  setWallpaperId: vi.fn(),
});

describe("buildPaletteItems", () => {
  it("empty query lists every app and no posts", () => {
    const items = buildPaletteItems("", deps());
    expect(items.every((i) => i.kind === "app")).toBe(true);
    expect(items.map((i) => i.label)).toContain("about");
    expect(items).toHaveLength(12);
  });

  it("a text query matches apps and post titles", () => {
    const items = buildPaletteItems("keyboards", deps());
    expect(items.some((i) => i.kind === "post")).toBe(true);
    expect(items.map((i) => i.label)).toContain(
      "Designing for keyboards first",
    );
  });

  it("running a post item opens the posts app at the post route", () => {
    const d = deps();
    const post = buildPaletteItems("keyboards", d).find(
      (i) => i.kind === "post",
    )!;
    post.run();
    expect(d.openPost).toHaveBeenCalledWith("designing-for-keyboards-first");
  });

  it("'>' lists scheme and wallpaper actions", () => {
    const items = buildPaletteItems(">", deps());
    expect(items.some((i) => i.kind === "scheme")).toBe(true);
    expect(items.some((i) => i.kind === "wallpaper")).toBe(true);
  });

  it("'>wallpaper' narrows to wallpapers and carries thumbnails", () => {
    const items = buildPaletteItems(">wallpaper", deps());
    expect(items.every((i) => i.kind === "wallpaper")).toBe(true);
    const mono = items.find((i) => i.label === "mono")!;
    expect(mono.thumbSrc).toBe("bg/mono/original-640.webp");
  });

  it("'>scheme mo' filters schemes and running one applies it", () => {
    const d = deps();
    const items = buildPaletteItems(">scheme mo", d);
    expect(items.map((i) => i.label)).toEqual(["mono", "moonlit"]);
    items[0].run();
    expect(d.setScheme).toHaveBeenCalledWith("mono");
  });
});
