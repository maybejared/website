import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ResponsiveImage } from "@/src/features/portfolio/lib/config/wallpapers";

import { preloadResponsiveImage, preloadScheme } from "./preload-image";

const img: ResponsiveImage = {
  webp: [
    { src: "bg/moonlit/original-1280.webp", width: 1280 },
    { src: "bg/moonlit/original-1920.webp", width: 1920 },
  ],
};

// Capture every constructed Image so we can assert on what got warmed.
const constructed: FakeImage[] = [];
class FakeImage {
  src = "";
  srcset = "";
  sizes = "";
  decode = vi.fn().mockResolvedValue(undefined);
  constructor() {
    constructed.push(this);
  }
}

beforeEach(() => {
  constructed.length = 0;
  vi.stubEnv("NEXT_PUBLIC_CDN_URL", "https://cdn.jtucker.io");
  vi.stubGlobal("Image", FakeImage as unknown as typeof Image);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("preloadResponsiveImage", () => {
  it("warms an off-screen Image with the resolved srcset, sizes and fallback src", () => {
    preloadResponsiveImage(img, "100vw");
    expect(constructed).toHaveLength(1);
    const el = constructed[0];
    expect(el.sizes).toBe("100vw");
    expect(el.srcset).toBe(
      "https://cdn.jtucker.io/bg/moonlit/original-1280.webp 1280w, " +
        "https://cdn.jtucker.io/bg/moonlit/original-1920.webp 1920w",
    );
    expect(el.src).toBe(
      "https://cdn.jtucker.io/bg/moonlit/original-1280.webp",
    );
    expect(el.decode).toHaveBeenCalledOnce();
  });

  it("is a no-op for a null image (flat scheme)", () => {
    preloadResponsiveImage(null, "100vw");
    expect(constructed).toHaveLength(0);
  });

  it("swallows decode rejection (best-effort warm, never throws)", async () => {
    constructed.length = 0;
    class RejectingImage extends FakeImage {
      decode = vi.fn().mockRejectedValue(new Error("aborted"));
    }
    vi.stubGlobal("Image", RejectingImage as unknown as typeof Image);
    expect(() => preloadResponsiveImage(img, "100vw")).not.toThrow();
    await Promise.resolve();
  });
});

describe("preloadScheme", () => {
  it("warms both the wallpaper and the viewer tiers for a photo wallpaper", () => {
    preloadScheme("mono");
    expect(constructed).toHaveLength(2);
  });

  it("warms nothing for the none/unknown wallpaper", () => {
    preloadScheme("none");
    expect(constructed).toHaveLength(0);
  });
});
