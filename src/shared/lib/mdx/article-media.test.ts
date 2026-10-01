import { describe, expect, it } from "vitest";

import { readArticleMedia } from "./article-media";

describe("readArticleMedia", () => {
  it("keeps well-formed links and drops the rest", () => {
    const media = readArticleMedia({
      image: "ascii/x.webp",
      links: [{ label: "GitHub", href: "https://g" }, { label: 3 }, "nope"],
    });
    expect(media).toEqual({
      image: "ascii/x.webp",
      imageAlt: undefined,
      links: [{ label: "GitHub", href: "https://g" }],
    });
  });

  it("leaves every field undefined when frontmatter has none", () => {
    expect(readArticleMedia({})).toEqual({
      image: undefined,
      imageAlt: undefined,
      links: undefined,
    });
  });
});
