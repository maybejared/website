import type { ReactNode } from "react";
import { createElement as h, Fragment } from "react";

import { AboutSection } from "@/src/features/portfolio/components/sections/about-section";
import { ContactSection } from "@/src/features/portfolio/components/sections/contact-section";
import { ExperienceSection } from "@/src/features/portfolio/components/sections/experience-section";
import { PostsSection } from "@/src/features/portfolio/components/sections/posts-section";
import { BtopPanel } from "@/src/features/portfolio/components/background/btop-panel";
import { FetchPanel } from "@/src/features/portfolio/components/background/fetch-panel";
import { PlaylistPanel } from "@/src/features/portfolio/components/background/playlist-panel";
import { ScramblePanel } from "@/src/features/portfolio/components/background/scramble-panel";
import { VimPanel } from "@/src/features/portfolio/components/background/vim-panel";
import { ClockApp } from "@/src/features/portfolio/components/apps/clock-app";
import { ImvApp } from "@/src/features/portfolio/components/apps/imv-app";
import { TerminalApp } from "@/src/features/portfolio/components/apps/terminal/terminal-app";
import { POSTS } from "@/src/content/portfolio/posts-client";

export type AppId =
  | "about"
  | "experience"
  | "posts"
  | "contact"
  | "btop"
  | "cava"
  | "clock"
  | "fetch"
  | "vim"
  | "playlist"
  | "imv"
  | "terminal";

export interface AppMeta {
  id: AppId;
  title: string;
  label: string;
  icon: string;
  tint: string;
  kind: "content" | "decor";
  href?: string;
  multiInstance?: boolean;
  render: (ctx: { instanceId: string }) => ReactNode;
}

// ScramblePanel requires a delay (ms before content resolves). Zero means the
// scramble completes immediately — fine for a static registry placeholder.
const cavaRender = () =>
  h(ScramblePanel, { delay: 0, children: h(BtopPanel, null) });

export const APPS: AppMeta[] = [
  {
    id: "about",
    title: "~/about",
    label: "about",
    icon: "/icons/user.svg",
    tint: "#bd93f9",
    kind: "content",
    href: "/",
    render: () => h(AboutSection, null),
  },
  {
    id: "posts",
    title: "~/posts",
    label: "posts",
    icon: "/icons/posts.svg",
    tint: "#ff79c6",
    kind: "content",
    href: "/posts",
    render: () => h(PostsSection, { posts: POSTS }),
  },
  {
    id: "experience",
    title: "~/experience",
    label: "experience",
    icon: "/icons/experience.svg",
    tint: "#ffb86c",
    kind: "content",
    href: "/experience",
    render: () => h(ExperienceSection, null),
  },
  {
    id: "contact",
    title: "~/contact.card",
    label: "contact",
    icon: "/icons/contact.svg",
    tint: "#8be9fd",
    kind: "content",
    href: "/contact",
    render: () => h(ContactSection, null),
  },
  {
    id: "btop",
    title: "btop — system monitor",
    label: "monitor",
    icon: "/icons/btop.svg",
    tint: "#00e441",
    kind: "decor",
    render: () => h(BtopPanel, null),
  },
  {
    id: "cava",
    title: "cava — audio visualizer",
    label: "cava",
    icon: "/icons/cava.svg",
    tint: "#ff5555",
    kind: "decor",
    render: cavaRender,
  },
  {
    id: "clock",
    title: "clock",
    label: "clock",
    icon: "/icons/clock.svg",
    tint: "#6272a4",
    kind: "decor",
    render: () => h(ClockApp, null),
  },
  {
    id: "fetch",
    title: "regn@fjell : ~ — pfetch",
    label: "fetch",
    icon: "/icons/pfetch.svg",
    tint: "#1793d1",
    kind: "decor",
    render: () => h(FetchPanel, null),
  },
  {
    id: "vim",
    title: "nvim ~/src/coreutils/pwd.c",
    label: "editor",
    icon: "/icons/nvim.svg",
    tint: "#6ba63f",
    kind: "decor",
    render: () => h(VimPanel, null),
  },
  {
    id: "playlist",
    title: "spotify — music",
    label: "music",
    icon: "/icons/spotify.svg",
    tint: "#1ed760",
    kind: "decor",
    render: () => h(PlaylistPanel, null),
  },
  {
    id: "imv",
    title: "imv — ~/wall/current.png",
    label: "viewer",
    icon: "/icons/imv.svg",
    tint: "#36aca3",
    kind: "decor",
    render: () => h(ImvApp, null),
  },
  {
    id: "terminal",
    title: "terminal",
    label: "terminal",
    icon: "/icons/terminal.svg",
    tint: "#282a36",
    kind: "decor",
    multiInstance: true,
    render: (ctx) => h(TerminalApp, { instanceId: ctx.instanceId }),
  },
];

export const APP_BY_ID: Record<AppId, AppMeta> = Object.fromEntries(
  APPS.map((app) => [app.id, app]),
) as Record<AppId, AppMeta>;

export const CONTENT_APPS: AppMeta[] = APPS.filter(
  (app) => app.kind === "content",
);
