import { describe, expect, it } from "vitest";
import { APPS, APP_BY_ID, CONTENT_APPS } from "./apps.config";

describe("app registry", () => {
  it("indexes every app by id", () => {
    for (const app of APPS) expect(APP_BY_ID[app.id]).toBe(app);
  });

  it("exposes the four content apps in nav order with hrefs", () => {
    expect(CONTENT_APPS.map((a) => a.id)).toEqual([
      "about",
      "posts",
      "experience",
      "contact",
    ]);
    for (const a of CONTENT_APPS) expect(a.href).toBeTruthy();
  });

  it("marks only the terminal as multiInstance", () => {
    const multi = APPS.filter((a) => a.multiInstance).map((a) => a.id);
    expect(multi).toEqual(["terminal"]);
  });

  it("every app renders a node", () => {
    for (const app of APPS)
      expect(app.render({ instanceId: app.id })).toBeDefined();
  });
});
