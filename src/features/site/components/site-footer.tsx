import { Label, Marker } from "@/src/shared/ui";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

export const SiteFooter: FC = () => {
  const { landing, contact, user } = portfolioContent;
  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-(--color-border) bg-(--color-panel) px-6 py-[18px]">
      <div className="flex items-center gap-[18px]">
        <span className="title">JT</span>
        <Label>{landing.footerLine}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Marker />
        <Marker tone="rule" />
        <Marker tone="rule" />
        <Marker tone="rule" />
        <Marker tone="rule" />
      </div>
      <div className="flex items-center gap-[18px]">
        <Label>
          {user.based} &nbsp;//&nbsp;{" "}
          <a href={`mailto:${contact.email}`} className="text-(--color-cobalt)">
            {contact.email}
          </a>
        </Label>
        <Label>
          <a href={landing.github} target="_blank" rel="noopener noreferrer">
            [ gh ]
          </a>{" "}
          &nbsp;{" "}
          <a href={landing.linkedin} target="_blank" rel="noopener noreferrer">
            [ in ]
          </a>{" "}
          &nbsp; <a href={`mailto:${contact.email}`}>[ @ ]</a>
        </Label>
      </div>
    </footer>
  );
};
