import type { PortfolioContent } from "@/src/shared/types/portfolio";

// Static content source for the portfolio. Edit me — this is the single source
// of truth for everything rendered in the terminal.
export const portfolioContent: PortfolioContent = {
  user: {
    handle: "dawad",
    name: "jared tucker",
    role: "forward deployed engineer & systems architect",
    based: "melbourne, au — utc+10",
  },

  landing: {
    kicker: "Ideas for a brighter tomorrow",
    tagline: "Software × Engineering × Systems",
    roles: "Forward Deployed Engineer / Systems Architect",
    statement:
      "I design and build thoughtful products, tools, and systems at the intersection of technology, creativity, and a more human future.",
    quote: "A more open,\nbeautiful internet.",
    coordinates: "37.8136° S\n144.9631° E",
    github: "https://github.com/Dawaad",
    approach: [
      {
        title: "01 / Systems first",
        body: "I start with the parts that repeat. A small, honest set of components beats a pile of one-off screens, and it keeps a product coherent as it grows.",
      },
      {
        title: "02 / Build to learn",
        body: "Prototypes answer questions documents argue about. I ship something rough early, put it in front of people, and let what I learn redirect the work.",
      },
      {
        title: "03 / Environment matters",
        body: "The places I spend time in shape the software I make. Calm, legible interfaces come from paying attention to calm, legible surroundings.",
      },
    ],
    headline: "A more beautiful internet",
    footerLine: "Design better systems for a brighter tomorrow.",
  },

  about: {
    intro: [
      "i am a software engineer, bodybuilder and startup founder focused on architecting, designing and building both systems and my life. I want to research, explore and share everything about thinking better, living better and creating better.",
    ],
    bullets: [
      [
        "focus",
        "systems design & architecture · ai augmented pattern recognition · videography",
      ],
      ["status", "start-up founder · forward deployed engineer"],
    ],
  },

  now: {
    updated: "29.05.2026",
    items: [
      "engineer currently at a YC backed startup building AI governance and alignment infrastructure",
      "researching and developing a programmable extension of the LLM wiki for 10k+ documents.",
      "learning videography, content creation and blog writing.",
      "building a home server/nas for large scale media storage/editing & local model hosting.",
      "trying to build more TUIs.",
    ],
  },

  contact: {
    email: "jared@rmr.studio",
    note: "I read every email. Replies in 1–3 days.",
  },

  experience: [
    {
      slug: "lyra",
      date: "2026 — now",
      org: "lyra",
      role: "forward deployed engineer",
      tag: "[engineering]",
      detail:
        "Shipping exceptional products for Silicon Valley startups. Currently building in a YC backed startup building the deterministic layer for frontier intelligence",
    },
    {
      slug: "cranium",
      date: "2026 — now",
      org: "cranium",
      role: "technical founder",
      tag: "[architecture]",
      detail:
        "The Open Sourced Self Adapting Hive Mind for Engineering Teams. Building the allignment substrate for AI-Augmented engineering teams. Infrastructure that embeds system design, team standards and interactions as context for agentic development and orchestration.",
    },
    {
      slug: "leidos",
      date: "2023 — 2026",
      org: "leidos",
      role: "software engineer",
      tag: "[engineering]",
      detail:
        "Solving the toughest challenges in government intelligence. Worked across a major engineering team to transform and modernise critical government capabilities. Lead the design and development of some critical domains and functionality with distributed systems, data pipelines, and internal tools.",
    },
    {
      slug: "monash",
      date: "2018 — 2022",
      org: "monash university",
      role: "student",
      tag: "[education]",
      detail:
        "Bachelor of Computer Science. This is where I learned to code, and where I fell in love with systems design and architecture.",
    },
  ],

  projects: [
    {
      slug: "signal-cli",
      date: "2026",
      name: "signal/cli",
      tag: "[tool]",
      detail:
        "A terminal client for our team's IDE backend. Written in Rust + Tauri.",
    },
    {
      slug: "runlines",
      date: "2026",
      name: "runlines",
      tag: "[oss]",
      detail: "A tiny todo-list that lives in your editor's status bar.",
    },
    {
      slug: "slowpost",
      date: "2025",
      name: "slowpost",
      tag: "[product]",
      detail:
        "A blogging tool that intentionally limits you to one post a week.",
    },
    {
      slug: "ks-icons",
      date: "2025",
      name: "ks-icons",
      tag: "[oss]",
      detail: "A 240-glyph monoline icon set for terminal apps. Free.",
    },
    {
      slug: "vector-insights",
      date: "2024",
      name: "vector/insights",
      tag: "[work]",
      detail:
        "A keyboard-first data exploration product. Shipped to ~3k seats.",
    },
    {
      slug: "plate",
      date: "2023",
      name: "plate",
      tag: "[wip]",
      detail: "Drum-machine sampler experiment. Still going.",
    },
  ],
};
