import type { PortfolioContent } from "@/src/shared/types/portfolio";

export const portfolioContent: PortfolioContent = {
  user: {
    handle: "dawad",
    name: "jared tucker",
    role: "Software Engineering",
    based: "melbourne, au — utc+10",
  },

  landing: {
    kicker: "Ideas for a brighter tomorrow",
    tagline: "Software × Engineering × Systems",
    roles: "Forward Deployed Engineer / Systems Architect / Engineering Lead",
    statement:
      "Software Engineer, Bodybuilder, Hiker, Boulderer, Cycler, Marathon Runner & Technical Lead designing, building & shipping beautiful, well-engineered products & systems",
    quote: "Give to the world,\n and the world will one day give back.",
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
        "systems design & architecture · agentic knowledege tinkering · cinematic videography · embedded & hardware engineering",
      ],
      ["currently", "Engineering Lead @ CTGT (YC F24)"],

      ["status", "forward deployed engineer · engineering lead"],
    ],
  },

  now: {
    updated: "16.09.2026",
    items: [
      "Engineering lead currently at a YC backed startup leading a team & building AI runtime governance & policy ingestion",
      "learning videography, content creation and blog writing.",
      "building a home server/nas for large scale media storage/editing & local model hosting.",
      "touching more grass",
    ],
  },

  contact: {
    email: "me@jtucker.io",
    note: "I read every email. Replies in 1–3 days.",
  },

  experience: [
    {
      slug: "CTGT (YC F24)",
      date: "2026 — now",
      org: "CTGT",
      role: "Engineering Lead",
      tag: "[engineering]",
      detail:
        "YC backed startup building the deterministic layer for frontier intelligence & AI Governance. Leading a team, with end-to-end ownership of architecture, technical design, implementation infrastructure, and delivery across the company’s core platform and application",
    },
    {
      slug: "Lyra",
      date: "2026 — now",
      org: "lyra",
      role: "Forward Deployed Engineer",
      tag: "[engineering]",
      detail: "Shipping exceptional products for Silicon Valley startups",
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
