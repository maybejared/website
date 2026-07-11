import { expect, test } from "@playwright/test";

// The wallpaper desktop is `max-md:hidden`, so force a desktop viewport.
// CDN assets are intercepted to keep the test deterministic and to let us
// assert exactly which paths are fetched — the proof of "lazy per switch".
test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

// 1×1 transparent gif — valid image body so onLoad (not onError) fires.
const STUB_IMAGE = Buffer.from(
  "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
  "base64",
);

test.describe("background wallpaper", () => {
  test("loads the active wallpaper and swaps lazily on wallpaper switch", async ({
    page,
  }) => {
    const requested: string[] = [];
    await page.route("**/bg/**", async (route) => {
      requested.push(new URL(route.request().url()).pathname);
      await route.fulfill({ status: 200, contentType: "image/gif", body: STUB_IMAGE });
    });
    // Wallpaper thumbnails in the palette's action strip always request the
    // 640-wide ladder entry through the image loader; the full-bleed backdrop
    // picks larger widths at this viewport. Filter those out so opening the
    // palette (which renders thumbnails for every wallpaper) doesn't look like
    // a new full-bleed fetch.
    const nonThumb = () => requested.filter((p) => !p.includes("-640.webp")).length;

    const crashes: string[] = [];
    page.on("pageerror", (err) => crashes.push(err.message));

    await page.goto("/");

    // Default wallpaper is moonlit — its /bg/moonlit/ assets should load on
    // first paint. (The old spec asserted "nothing loads for beige"; that scheme
    // is gone and the new default has a real image.)
    await expect
      .poll(() => requested.some((p) => p.startsWith("/bg/moonlit/")), {
        timeout: 5_000,
      })
      .toBe(true);

    const moonlitCount = requested.filter((p) => p.startsWith("/bg/moonlit/")).length;

    // Snapshot non-thumbnail fetches before opening the palette — the palette's
    // wallpaper strip requests a 640px thumbnail for every wallpaper, which is
    // not the "no new fetches" regression this assertion cares about.
    const before = nonThumb();

    // Open the search palette and pick the 'none' wallpaper (no image).
    await page.keyboard.press("/");
    await page.getByRole("textbox", { name: "search" }).fill(">wallpaper");
    await page.getByRole("button", { name: "none" }).click();

    // Allow a tick for any lazy loads that should NOT fire.
    await page.waitForTimeout(600);
    expect(
      nonThumb(),
      "switching to none must not fetch any new bg assets",
    ).toBe(before);

    // Reopen and pick the 'mono' wallpaper — action mode lists wallpapers only,
    // so the label is unambiguous (no scheme buttons in the strip).
    await page.keyboard.press("/");
    await page.getByRole("textbox", { name: "search" }).fill(">wallpaper");
    await page.getByRole("button", { name: "mono" }).click();

    await expect
      .poll(() => requested.some((p) => p.startsWith("/bg/mono/")), {
        timeout: 5_000,
      })
      .toBe(true);

    // Laziness: moonlit assets were not re-fetched after switching away
    // (thumbnails in the palette strip are excluded — only the full-bleed
    // backdrop counts).
    const moonlitAfter = requested.filter(
      (p) => p.startsWith("/bg/moonlit/") && !p.includes("-640.webp"),
    ).length;
    expect(moonlitAfter, "moonlit assets must not be re-fetched").toBe(moonlitCount);

    expect(crashes).toEqual([]);
  });
});
