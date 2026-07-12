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
      slug: "CTGT (YC F24)",
      date: "2026 — now",
      org: "ctgt",
      role: "software engineer & architect",
      tag: "[engineering]",
      detail:
        "CTGT (YC F24) - Building deterministic AI governance for highly regulated industries",
    },
    {
      slug: "lyra",
      date: "2026 — now",
      org: "lyra",
      role: "forward deployed engineer & engineering manager",
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
};
