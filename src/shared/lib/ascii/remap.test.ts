import { describe, expect, it } from "vitest";

import {
  isNeutral,
  luminance01,
  remap,
  withLuminance,
  type Rgb,
} from "@/src/shared/lib/ascii/remap";

const AMBER: Rgb = [240, 184, 120];
const CYAN: Rgb = [143, 212, 232];
const DARK: Rgb = [46, 56, 88];
const LIGHT: Rgb = [238, 242, 255];

describe("remap", () => {
  it("sends neutral cells onto the fg ramp by luminance", () => {
    const black = remap([10, 10, 12], [AMBER, CYAN], DARK, LIGHT);
    const white = remap([245, 245, 240], [AMBER, CYAN], DARK, LIGHT);
    expect(luminance01(black)).toBeLessThan(luminance01(white));
    // Near-black neutral lands near the dark end of the ramp.
    expect(black[0]).toBeLessThan(DARK[0] + 10);
  });

  it("maps a warm cell to the nearest-hue pool colour", () => {
    // A saturated red is closer in hue to amber (~35°) than cyan (~193°).
    const out = remap([180, 40, 30], [AMBER, CYAN], DARK, LIGHT);
    // Warm output: red channel dominates blue.
    expect(out[0]).toBeGreaterThan(out[2]);
  });

  it("maps a cool cell to the cyan side of the pool", () => {
    const out = remap([40, 120, 200], [AMBER, CYAN], DARK, LIGHT);
    expect(out[2]).toBeGreaterThan(out[0]);
  });

  it("preserves the source luminance through the remap", () => {
    const dim: Rgb = [80, 20, 15];
    const bright: Rgb = [250, 120, 100];
    const dimOut = remap(dim, [AMBER], DARK, LIGHT);
    const brightOut = remap(bright, [AMBER], DARK, LIGHT);
    expect(luminance01(dimOut)).toBeCloseTo(luminance01(dim), 1);
    expect(luminance01(brightOut)).toBeCloseTo(luminance01(bright), 1);
  });

  it("withLuminance darkens and lightens without leaving 0-255", () => {
    const darker = withLuminance(AMBER, 0.1);
    const lighter = withLuminance(AMBER, 0.95);
    for (const v of [...darker, ...lighter]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
    expect(luminance01(darker)).toBeCloseTo(0.1, 1);
    expect(luminance01(lighter)).toBeCloseTo(0.95, 1);
  });

  it("classifies greys as neutral and saturated colours as not", () => {
    expect(isNeutral([120, 120, 128])).toBe(true);
    expect(isNeutral([200, 60, 40])).toBe(false);
  });

  it("falls back to the ramp when the pool is empty", () => {
    const out = remap([200, 60, 40], [], DARK, LIGHT);
    expect(luminance01(out)).toBeGreaterThan(0);
  });
});
