import { ArrowLink, Label } from "@/src/shared/ui";
import type { FC } from "react";

export const NotFoundBand: FC = () => (
  <section
    className="band flex flex-1 flex-col gap-4"
    style={{ padding: "48px 32px" }}
  >
    <Label tone="accent">404</Label>
    <h1 className="display display--section">Nothing here.</h1>
    <ArrowLink href="/">Back home</ArrowLink>
  </section>
);
