import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseAnsi } from "@/src/shared/lib/ascii/ansi";

const FIXTURE = readFileSync(
  join(process.cwd(), "public/ascii/rose.ans"),
  "utf8",
);

describe("parseAnsi", () => {
  it("parses a truecolour cell and a reset", () => {
    const art = parseAnsi("\u001b[38;2;200;10;30mA\u001b[0mB");
    expect(art.rows).toBe(1);
    expect(art.cells[0][0]).toEqual({ ch: "A", rgb: [200, 10, 30] });
    expect(art.cells[0][1]).toEqual({ ch: "B", rgb: null });
  });

  it("treats spaces as empty cells regardless of active colour", () => {
    const art = parseAnsi("\u001b[38;2;1;2;3m .");
    expect(art.cells[0][0].rgb).toBeNull();
    expect(art.cells[0][1].rgb).toEqual([1, 2, 3]);
  });

  it("skips unknown SGR sequences without consuming glyphs", () => {
    const art = parseAnsi("\u001b[1mX\u001b[48;2;9;9;9mY");
    expect(art.cells[0].map((c) => c.ch).join("")).toBe("XY");
  });

  it("trims fully-empty leading and trailing rows", () => {
    const art = parseAnsi("\u001b[0m   \nX\n   \n");
    expect(art.rows).toBe(1);
    expect(art.cells[0][0].ch).toBe("X");
  });

  it("parses the committed fixture into a plausible grid", () => {
    const art = parseAnsi(FIXTURE);
    expect(art.rows).toBeGreaterThan(30);
    expect(art.cols).toBeGreaterThan(80);
    // At least one coloured glyph exists.
    expect(
      art.cells.some((row) => row.some((c) => c.rgb !== null && c.ch !== " ")),
    ).toBe(true);
  });
});
