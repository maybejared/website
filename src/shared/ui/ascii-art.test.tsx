import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { AsciiArt } from "@/src/shared/ui/ascii-art";

const SAMPLE = "[38;2;200;10;30m##\n[0m##";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(SAMPLE, { status: 200 })),
  );
});

describe("AsciiArt", () => {
  it("mounts an accessible canvas and fetches the art once", async () => {
    render(<AsciiArt src="/ascii/one.ans" label="rose" />);
    expect(screen.getByRole("img", { name: "rose" })).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/ascii/one.ans"));
  });

  it("caches parses per src across instances", async () => {
    render(
      <>
        <AsciiArt src="/ascii/two.ans" />
        <AsciiArt src="/ascii/two.ans" />
      </>,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getAllByRole("img", { name: "ascii art" })).toHaveLength(2);
  });
});
