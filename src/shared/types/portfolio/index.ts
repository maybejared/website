// Portfolio domain types. Hand-written barrel — the single source of truth for
// the shape of the terminal portfolio's content and navigation model.

export type SectionKey =
  | "about"
  | "experience"
  | "posts"
  | "contact";

export type SchemeName = "beige" | "mono" | "moonlit";

export interface Tab {
  key: SectionKey;
  label: string;
  hasList: boolean;
  href: string;
}

export interface PortfolioUser {
  handle: string;
  name: string;
  role: string;
  based: string;
}

/** A key/value pair rendered as a definition-list row. */
export type KeyValue = [label: string, value: string];

/**
 * Anything addressable by a stable, URL-safe slug. List entries extend this so
 * a single item can be deep-linked via `?item=<slug>` and survive a reload.
 */
export interface Identifiable {
  slug: string;
}

export interface AboutContent {
  intro: string[];
  bullets: KeyValue[];
}

export interface NowContent {
  updated: string;
  items: string[];
}

export interface Contact {
  email: string;
  note: string;
}

export interface PlayerTrack {
  title: string;
  artist: string;
  album: string;
  /** mm:ss display string. */
  length: string;
  /** Accent token used to tint the placeholder album tile. */
  tint: "amber" | "cyan" | "magenta" | "yellow";
}

export interface PlayerContent {
  tracks: PlayerTrack[];
}

export interface ExperienceEntry extends Identifiable {
  date: string;
  org: string;
  role: string;
  tag: string;
  detail: string;
}

export interface Post extends Identifiable {
  /** ISO `YYYY-MM-DD`; formatted to dotted style for display. */
  date: string;
  title: string;
  tag: string;
  description: string;
  readTime: number;
}

export interface Heading {
  text: string;
  slug: string;
  level: 2 | 3;
}

export interface PostDoc extends Post {
  content: string;
  headings: Heading[];
}

export interface PortfolioContent {
  user: PortfolioUser;
  about: AboutContent;
  now: NowContent;
  contact: Contact;
  experience: ExperienceEntry[];
  player: PlayerContent;
}
