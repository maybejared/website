import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Palette } from "@/src/features/portfolio/components/wm/palette";
import { WorkspaceProvider } from "@/src/features/portfolio/providers/workspace-provider";
import type { WorkspaceSeed } from "@/src/features/portfolio/lib/wm/workspace-reducer";
import type { AppearanceState } from "@/src/features/portfolio/hooks/use-appearance";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

const seed: WorkspaceSeed = {
  workspace: 1,
  instances: [{ id: "about", appId: "about" }],
  layout: "about",
};

const makeAppearance = (): AppearanceState => ({
  scheme: "moonlit",
  setScheme: vi.fn(),
  wallpaperId: "moonlit",
  setWallpaperId: vi.fn(),
}) as unknown as AppearanceState;

const renderPalette = (appearance: AppearanceState, onClose = vi.fn()) => {
  render(
    <WorkspaceProvider seed={seed}>
      <Palette open onClose={onClose} appearance={appearance} />
    </WorkspaceProvider>,
  );
  return onClose;
};

describe("Palette", () => {
  it("typing filters and Enter runs the highlighted item and closes", async () => {
    const onClose = renderPalette(makeAppearance());

    await userEvent.type(screen.getByRole("textbox", { name: "search" }), "posts");
    await userEvent.keyboard("{Enter}");

    expect(push).toHaveBeenCalledWith("/posts");
    expect(onClose).toHaveBeenCalled();
  });

  it("strip mode: ArrowRight moves the highlight and Enter applies the wallpaper", async () => {
    const appearance = makeAppearance();
    const onClose = renderPalette(appearance);

    await userEvent.type(
      screen.getByRole("textbox", { name: "search" }),
      ">wallpaper",
    );
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{Enter}");

    expect(appearance.setWallpaperId).toHaveBeenCalledWith("mono");
    expect(onClose).toHaveBeenCalled();
  });
});
