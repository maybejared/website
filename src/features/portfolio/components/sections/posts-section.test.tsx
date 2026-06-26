import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WindowFocusContext } from "@/src/features/portfolio/hooks/use-window-focus";
import type { Post } from "@/src/shared/types/portfolio";

import { PostsSection } from "./posts-section";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const POSTS: Post[] = [
  {
    slug: "a",
    date: "2024-01-01",
    title: "Post Alpha",
    tag: "tech",
    description: "first post",
    readTime: 3,
  },
  {
    slug: "b",
    date: "2024-02-01",
    title: "Post Beta",
    tag: "life",
    description: "second post",
    readTime: 5,
  },
];

const press = (key: string) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });

function renderWithFocus(focused: boolean) {
  render(
    <WindowFocusContext.Provider value={focused}>
      <PostsSection posts={POSTS} />
    </WindowFocusContext.Provider>,
  );
}

// The detail pane preview title carries font-semibold; the PostRow title
// span does not. Use this to find the list-row span unambiguously.
function getRowSpan(title: string): HTMLElement {
  const matches = screen.getAllByText(title);
  return matches.find((el) => !el.className.includes("font-semibold"))!;
}

describe("PostsSection keyboard navigation focus scoping", () => {
  it("does NOT advance the highlight on ArrowDown when the window is not focused", () => {
    renderWithFocus(false);
    // Post Alpha is selected initially — its PostRow title span carries text-fg-0
    const titleA = getRowSpan("Post Alpha");
    expect(titleA.className).toContain("text-fg-0");
    press("ArrowDown");
    // Still on Post Alpha — focus gate blocked the key
    expect(titleA.className).toContain("text-fg-0");
  });

  it("DOES advance the highlight on ArrowDown when the window is focused", () => {
    renderWithFocus(true);
    const titleA = getRowSpan("Post Alpha");
    expect(titleA.className).toContain("text-fg-0");
    press("ArrowDown");
    // Post Alpha is no longer active; Post Beta is
    expect(titleA.className).toContain("text-fg-1");
    expect(getRowSpan("Post Beta").className).toContain("text-fg-0");
  });
});
