import { expect, test } from "@playwright/test";

// All workspace tests run at a full-desktop viewport so Tailwind's lg+ shell
// (rail + pulls) and md+ WM container are both active.
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
      page.locator(".wm-window-body").getByText(POST_TITLE).first(),
    ).toBeVisible({ timeout: 10_000 });

    // After the WM hydrates, the posts window toolbar title confirms the workspace
    // seeded with the right app.
    await expect(windowTitle(page, "~/posts")).toBeVisible({ timeout: 10_000 });
  });

  test("rail posts button opens a posts window", async ({ page }) => {
    await page.goto("/");

    // The rail is only rendered at lg+ after hydration. Wait for it.
    const postsBtn = page.getByRole("button", { name: "posts" });
    await expect(postsBtn).toBeVisible({ timeout: 10_000 });

    // Workspace 1 is seeded with 'about'; clicking 'posts' adds that window.
    await postsBtn.click();
    await expect(windowTitle(page, "~/posts")).toBeVisible();
  });

  // leader → key chord: press the leader (backtick), then the command key.
  const chord = async (page: import("@playwright/test").Page, key: string) => {
    await page.keyboard.press("Backquote");
    await page.keyboard.press(key);
  };

  test("leader → 2 empties the workspace and leader → 1 restores it", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for the WM to hydrate by checking for the seeded about window toolbar.
    const aboutTitle = windowTitle(page, "~/about");
    await expect(aboutTitle).toBeVisible({ timeout: 10_000 });

    // Switch to workspace 2 — it has no seeded windows, so the mosaic is empty.
    await chord(page, "2");
    await expect(aboutTitle).not.toBeVisible();

    // Switch back; workspace 1 layout is preserved.
    await chord(page, "1");
    await expect(aboutTitle).toBeVisible();
  });

  test("holding the leader switches workspaces on each key without re-pressing", async ({
    page,
  }) => {
    await page.goto("/");
    const aboutTitle = windowTitle(page, "~/about");
    await expect(aboutTitle).toBeVisible({ timeout: 10_000 });

    // Hold the leader down, tap 2 then 1, then release — both fire under one hold.
    await page.keyboard.down("Backquote");
    await page.keyboard.press("2");
    await expect(aboutTitle).not.toBeVisible();
    await page.keyboard.press("1");
    await expect(aboutTitle).toBeVisible();
    await page.keyboard.up("Backquote");
  });

  test("leader → q twice opens two terminal windows", async ({ page }) => {
    await page.goto("/");

    // Wait for the WM to be ready.
    const aboutTitle = windowTitle(page, "~/about");
    await expect(aboutTitle).toBeVisible({ timeout: 10_000 });

    // Count existing windows before adding terminals.
    const closeButtons = page.getByRole("button", { name: "close" });
    const initialCount = await closeButtons.count();

    await chord(page, "q");
    await chord(page, "q");

    // Two new windows should have opened — each has exactly one close button.
    await expect(closeButtons).toHaveCount(initialCount + 2, { timeout: 5_000 });

    // Both carry the 'terminal' window title in their toolbar span.
    const terminalTitles = page.locator("span.truncate", {
      hasText: /^terminal$/,
    });
    await expect(terminalTitles).toHaveCount(2);
  });

  test("the keybind panel rebinds new-terminal and the new chord triggers it", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(windowTitle(page, "~/about")).toBeVisible({ timeout: 10_000 });

    // Open the panel from the quick menu (right edge pull).
    await page.getByRole("button", { name: "toggle quick menu" }).click();
    await page.getByRole("button", { name: "keybinds" }).click();
    await expect(page.getByText("keybinds", { exact: true })).toBeVisible();

    // New terminal is the 6th rebind row (after leader + 4 workspaces).
    await page.getByRole("button", { name: "rebind" }).nth(5).click();
    await page.keyboard.press("t");
    await expect(page.getByText("leader → T")).toBeVisible();

    // Close the panel; the new chord should now spawn a terminal.
    await page.keyboard.press("Escape");
    const terminalTitles = page.locator("span.truncate", { hasText: /^terminal$/ });
    await expect(terminalTitles).toHaveCount(0);
    await chord(page, "t");
    await expect(terminalTitles).toHaveCount(1);
  });

  // Open a second window so the field has two side-by-side leaves to gesture on.
  const twoWindows = async (page: import("@playwright/test").Page) => {
    await page.goto("/");
    const postsBtn = page.getByRole("button", { name: "posts" });
    await expect(postsBtn).toBeVisible({ timeout: 10_000 });
    await postsBtn.click();
    const about = page.locator('[data-leaf="about"]');
    const posts = page.locator('[data-leaf="posts"]');
    await expect(about).toBeVisible();
    await expect(posts).toBeVisible();
    return { about, posts };
  };

  const center = (b: { x: number; y: number; width: number; height: number }) => ({
    x: b.x + b.width / 2,
    y: b.y + b.height / 2,
  });

  test("leader + left-drag re-tiles onto a drop zone with a ghost overlay", async ({
    page,
  }) => {
    const { about, posts } = await twoWindows(page);
    await page.waitForTimeout(300); // settle the open/pop-in animation
    const a0 = (await about.boundingBox())!;
    const p0 = (await posts.boundingBox())!;

    const from = center(a0);
    // Aim at posts' right edge → about should re-tile to posts' right side.
    const to = { x: p0.x + p0.width * 0.9, y: p0.y + p0.height / 2 };

    await page.keyboard.down("Backquote");
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 8 });

    // The floating ghost overlay is visible while dragging.
    await expect(page.locator("[data-drag-overlay]")).toBeVisible();

    await page.mouse.up();
    await page.keyboard.up("Backquote");

    // Ghost gone, and about now sits to the right of posts.
    await expect(page.locator("[data-drag-overlay]")).toHaveCount(0);
    await expect
      .poll(async () => {
        const a = (await about.boundingBox())!;
        const p = (await posts.boundingBox())!;
        return a.x > p.x;
      })
      .toBe(true);
  });

  test("leader + right-drag resizes the split", async ({ page }) => {
    const { about } = await twoWindows(page);
    await page.waitForTimeout(300); // let the open/pop-in animation settle
    const a0 = (await about.boundingBox())!;
    const c = center(a0);

    await page.keyboard.down("Backquote");
    await page.mouse.move(c.x, c.y);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(c.x + 160, c.y, { steps: 8 });
    await page.mouse.up({ button: "right" });
    await page.keyboard.up("Backquote");

    // A horizontal right-drag moves the nearest split, changing about's width.
    // (Which way depends on the tree, so assert a meaningful change either way.)
    await expect
      .poll(async () => Math.abs((await about.boundingBox())!.width - a0.width))
      .toBeGreaterThan(60);
  });
});
