"use client";

import { Nav } from "@jt/ds";
import { usePathname } from "next/navigation";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";

const items = [
  { index: "01", label: "Home", href: "/" },
  { index: "02", label: "Work", href: "/projects" },
  { index: "03", label: "Writing", href: "/posts" },
  { index: "04", label: "About", href: "/#about" },
];

export const SiteNav: FC = () => {
  const pathname = usePathname();
  const active = pathname.startsWith("/posts")
    ? "/posts"
    : pathname.startsWith("/projects")
      ? "/projects"
      : "/";
  const { user, landing, contact } = portfolioContent;

  return (
    <Nav
      brand="JT"
      tagline={`${user.name}  //  ${landing.tagline}`}
      items={items.map((item) => ({ ...item, active: item.href === active }))}
      cta={{ label: "Let's talk", href: `mailto:${contact.email}` }}
      className="site-nav site-chrome sticky top-0 z-20"
      style={{
        height: "auto",
        minHeight: "var(--bar-h)",
        padding: "10px 20px",
        gap: 24,
        flexWrap: "wrap",
      }}
    />
  );
};
