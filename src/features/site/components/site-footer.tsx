import { Label, Marker } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

export const SiteFooter: FC = () => {
  const { landing, contact, user } = portfolioContent;
  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-(--jt-border) bg-(--jt-panel) px-6 py-[18px]">
      <div className="flex items-center gap-[18px]">
        <span className="jt-title">JT</span>
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
          <a href={`mailto:${contact.email}`} className="text-(--jt-cobalt)">
            {contact.email}
          </a>
        </Label>
        <Label>
          <a href={landing.github}>[ gh ]</a> &nbsp;{" "}
          <a href={`mailto:${contact.email}`}>[ @ ]</a>
        </Label>
      </div>
    </footer>
  );
};
