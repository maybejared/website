import { Button, Label } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

export const CtaSection: FC = () => {
  const { contact, landing } = portfolioContent;
  return (
    <section
      id="contact"
      className="jt-band flex flex-wrap items-center justify-between gap-6"
      style={{ padding: "24px 32px", borderBottom: "none" }}
    >
      <div className="flex flex-col gap-1.5">
        <Label>Currently open to new work &mdash; 2026</Label>
        <p className="jt-display jt-display--heading">
          Have something worth building?
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="fill" href={`mailto:${contact.email}`} keyHint="E">
          {contact.email}
        </Button>
        <Button variant="accent" href={landing.github}>
          GitHub
        </Button>
      </div>
    </section>
  );
};
