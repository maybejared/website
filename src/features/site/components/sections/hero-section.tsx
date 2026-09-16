import { Button, Corners, DitherImage, Label } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { Hotkeys } from "@/src/features/site/components/hotkeys";

export const HeroSection: FC = () => {
  const { user, landing, contact } = portfolioContent;
  const mailto = `mailto:${contact.email}`;
  return (
    <section
      className="jt-band grid items-start gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      style={{ padding: "36px 32px 32px" }}
    >
      <Hotkeys keys={{ w: "#work", e: mailto }} />
      <div className="flex flex-col gap-4">
        <Label>{landing.kicker} &nbsp;//</Label>
        <h1 className="jt-display text-[clamp(46px,7.5vw,112px)] capitalize">
          {user.name}
        </h1>
        <Label tone="ink" style={{ letterSpacing: "0.18em" }}>
          {landing.roles}
        </Label>
        <div className="jt-hatch">/ / / / / / / / / / / /</div>
        <p className="jt-body max-w-[52ch]">{landing.statement}</p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="fill" href="#work" keyHint="W">
            View work
          </Button>
          <Button href={mailto} keyHint="E">
            Get in touch
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Corners>
          <DitherImage
            src="/ascii/portrait.webp"
            alt={user.name}
            height={200}
            caption="Portrait"
          />
        </Corners>
        <div className="flex flex-col gap-2.5">
          <Label
            as="p"
            tone="ink"
            className="whitespace-pre-line"
            style={{ lineHeight: 1.8 }}
          >
            &ldquo;{landing.quote}&rdquo;
          </Label>
          <span className="jt-rule max-w-10" />
          <Label>JT.2026</Label>
        </div>
      </div>
    </section>
  );
};
