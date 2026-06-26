import { expect, test } from "@playwright/test";

// All workspace tests run at a full-desktop viewport so Tailwind's lg+ top-bar
// and md+ WM container are both active.
test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

const SLUG = "on-small-models-and-small-teams";
const POST_TITLE = "On small models and small teams";

// The WM inlines the window title in a `<span class="truncate">` inside the
// drag-source toolbar. This helper locates exactly the window whose toolbar
// shows the given title — unambiguous even when the same text also appears in
// panel headers, Mosaic internals, and hidden SSR elements.
const windowTitle = (page: import('@playwright/test').Page, title: string) =>
  page.locator("span.truncate", { hasText: new RegExp(`^${title.replace(/[~\/]/g, "\\$&")}$`) });

test.describe("workspace desktop", () => {
  test("deep link to a post route shows the article title", async ({ page }) => {
    await page.goto(`/posts/${SLUG}`);

    // After the WM hydrates the post title is visible inside the mosaic window body
    // (as the detail-panel preview heading or list-row title). Target it via the
    // mosaic class so we scope to the WM and avoid matching the SSR article title
    // that sits in md:hidden once mounted.
    await expect(
      page.locator(".mosaic-window-body").getByText(POST_TITLE).first(),
    ).toBeVisible({ timeout: 10_000 });

    // After the WM hydrates, the posts window toolbar title confirms the workspace
    // seeded with the right app.
    await expect(windowTitle(page, "~/posts")).toBeVisible({ timeout: 10_000 });
  });

  test("top-bar posts button opens a posts window", async ({ page }) => {
    await page.goto("/");

    // The top bar is only rendered at lg+ after hydration. Wait for it.
    const postsBtn = page.getByRole("button", { name: "posts" });
    await expect(postsBtn).toBeVisible({ timeout: 10_000 });

    // Workspace 1 is seeded with 'about'; clicking 'posts' adds that window.
    await postsBtn.click();
    await expect(windowTitle(page, "~/posts")).toBeVisible();
  });

  test("Alt+2 empties the workspace and Alt+1 restores it", async ({ page }) => {
    await page.goto("/");

    // Wait for the WM to hydrate by checking for the seeded about window toolbar.
    const aboutTitle = windowTitle(page, "~/about");
    await expect(aboutTitle).toBeVisible({ timeout: 10_000 });

    // Switch to workspace 2 — it has no seeded windows, so the mosaic is empty.
    await page.keyboard.press("Alt+2");
    await expect(aboutTitle).not.toBeVisible();

    // Switch back; workspace 1 layout is preserved.
    await page.keyboard.press("Alt+1");
    await expect(aboutTitle).toBeVisible();
  });

  test("Alt+q twice opens two terminal windows", async ({ page }) => {
    await page.goto("/");

    // Wait for the WM to be ready.
    const aboutTitle = windowTitle(page, "~/about");
    await expect(aboutTitle).toBeVisible({ timeout: 10_000 });

    // Count existing windows before adding terminals.
    const closeButtons = page.getByRole("button", { name: "close" });
    const initialCount = await closeButtons.count();

    await page.keyboard.press("Alt+q");
    await page.keyboard.press("Alt+q");

    // Two new windows should have opened — each has exactly one close button.
    await expect(closeButtons).toHaveCount(initialCount + 2, { timeout: 5_000 });

    // Both carry the 'terminal' window title in their toolbar span.
    const terminalTitles = page.locator("span.truncate", {
      hasText: /^terminal$/,
    });
    await expect(terminalTitles).toHaveCount(2);
  });
});
