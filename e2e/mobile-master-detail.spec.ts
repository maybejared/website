import { expect, test } from "@playwright/test";

// Runs at the iPhone 13 viewport (≈390px < lg). The WM does not mount below
// lg so there is only the stacked page in the DOM — no duplicate elements.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

const FIRST_POST = "On small models and small teams";
const FIRST_POST_SLUG = "on-small-models-and-small-teams";

test.describe("mobile master/detail", () => {
  test("shows only the list, opens detail on tap, and goes back", async ({ page }) => {
    await page.goto("/posts");

    const listCmd = page.getByText("tail -f posts/").first();
    const backButton = page.getByRole("button", { name: /cd \.\./i }).first();
    // Title renders in both the list row and the (off-screen) detail pane.
    const visibleTitle = page.getByText(FIRST_POST).and(page.locator(":visible"));

    // 1. List only — list command visible, back control hidden.
    await expect(listCmd).toBeVisible();
    await expect(backButton).toBeHidden();

    // 2. Tap a row → detail opens, list hides, URL reflects the slug path.
    //    PostsSection now navigates via router.push('/posts/<slug>') rather than
    //    a query param, so the URL becomes /posts/<slug> not ?item=<slug>.
    await visibleTitle.click();
    await expect(backButton).toBeVisible();
    await expect(listCmd).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`/posts/${FIRST_POST_SLUG}$`));

    // 3. Back → list returns, URL is clean.
    await backButton.click();
    await expect(listCmd).toBeVisible();
    await expect(backButton).toBeHidden();
    await expect(page).toHaveURL(/\/posts$/);
  });

  test("bottom tab bar navigates sections and search opens posts", async ({
    page,
  }) => {
    await page.goto("/");

    // Tab bar: tap experience → routed, tab active.
    const nav = page.getByRole("navigation", { name: "site navigation" });
    await nav.getByRole("link", { name: "experience" }).click();
    await expect(page).toHaveURL(/\/experience$/);

    // Search sheet: find a post by title and open it.
    await nav.getByRole("button", { name: "search" }).click();
    const input = page.getByRole("textbox", { name: "search" });
    await input.fill("keyboards");
    await page.getByRole("button", { name: /designing for keyboards/i }).click();
    await expect(page).toHaveURL(/\/posts\/designing-for-keyboards-first$/);
  });

  test("deep link opens the detail directly on reload", async ({ page }) => {
    // Deep-link is now a path route, not a query param.
    await page.goto(`/posts/${FIRST_POST_SLUG}`);

    const backButton = page.getByRole("button", { name: /cd \.\./i }).first();
    await expect(backButton).toBeVisible();
    await expect(page.getByText("tail -f posts/").first()).toBeHidden();
    // The opened post's title shows in the (now visible) detail pane.
    await expect(page.getByText(FIRST_POST).and(page.locator(":visible"))).toBeVisible();
  });
});
