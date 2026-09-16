import { Button, Corners, DitherImage, KeyValue, Label, Panel } from "@jt/ds";
import type { CSSProperties, FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { cdnUrl } from "@/src/shared/lib/cdn";
import { Hotkeys } from "@/src/features/site/components/hotkeys";

export const HeroSection: FC = () => {
  const { user, landing, contact, about } = portfolioContent;
  const mailto = `mailto:${contact.email}`;
  const bullet = (label: string) =>
    (about.bullets.find(([key]) => key === label)?.[1] ?? "")
      .split(" · ")
      .join("\n");
  return (
    <section
      className="band hero-band grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      style={
        {
          padding: "36px 32px 32px",
          "--hero-portrait": `url(${cdnUrl("ascii/portrait.webp")})`,
        } as CSSProperties
      }
    >
      <Hotkeys keys={{ w: "#work", e: mailto }} />
      <div className="flex flex-col gap-4">
        <Label>{landing.kicker} &nbsp;//</Label>
        <h1 className="display text-[clamp(46px,7.5vw,112px)] capitalize">
          {user.name}
        </h1>
        <Label tone="ink" style={{ letterSpacing: "0.18em" }}>
          {landing.roles}
        </Label>
        <div className="hatch">/ / / / / / / / / / / /</div>
        <p className="body max-w-[52ch]">{landing.statement}</p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="fill" href="#work" keyHint="W">
            View work
          </Button>
          <Button href={mailto} keyHint="E">
            Get in touch
          </Button>
        </div>
        <Panel
          title="Basecamp"
          index="01"
          className="mt-4"
          footer={<Label>Build / Explore / Iterate / Repeat</Label>}
        >
          <KeyValue
            rows={[
              { key: "Location", value: user.based },
              { key: "Currently", value: bullet("currently") },
              { key: "Focus", value: bullet("focus") },
              { key: "Available", value: "Open to opportunities", live: true },
              { key: "Contact", value: <a href={mailto}>{contact.email}</a> },
              { key: "Status", value: bullet("status") },
            ]}
          />
        </Panel>
      </div>
      <div className="flex flex-col gap-5">
        <Corners className="flex min-h-0 flex-1 max-md:hidden">
          <DitherImage
            src={cdnUrl("ascii/portrait.webp")}
            alt={user.name}
            mode="color"
            className="hero-portrait flex-1"
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
          <span className="rule max-w-10" />
          <Label>JT.2026</Label>
        </div>
      </div>
    </section>
  );
};
