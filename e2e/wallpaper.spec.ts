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

    // Open the theme-panel popover and pick the 'none' wallpaper (no image).
    // 'none' is unique in the panel so it is unambiguous.
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("button", { name: "none" }).click();

    // Allow a tick for any lazy loads that should NOT fire.
    await page.waitForTimeout(600);
    expect(
      requested.length,
      "switching to none must not fetch any new bg assets",
    ).toBe(moonlitCount);

    // Open the panel again and pick 'mono' wallpaper. The 'mono' label appears
    // in both the scheme section and the wallpaper section; the wallpaper entry
    // is rendered second in the DOM (after the scheme buttons), so nth(1) targets
    // the correct one.
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("button", { name: "mono" }).nth(1).click();

    await expect
      .poll(() => requested.some((p) => p.startsWith("/bg/mono/")), {
        timeout: 5_000,
      })
      .toBe(true);

    // Laziness: moonlit assets were not re-fetched after switching away.
    const moonlitAfter = requested.filter((p) => p.startsWith("/bg/moonlit/")).length;
    expect(moonlitAfter, "moonlit assets must not be re-fetched").toBe(moonlitCount);

    expect(crashes).toEqual([]);
  });
});
