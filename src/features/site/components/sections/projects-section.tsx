import { ProjectCard, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { portfolioContent } from "@/src/content/portfolio/portfolio-content";
import { hatchStyle } from "@/src/features/site/lib/hatch";

/** Strips the `[tag]` brackets used by the content file. */
const cleanTag = (tag: string) => tag.replace(/[[\]]/g, "");

export const ProjectsSection: FC = () => (
  <section
    id="work"
    className="jt-band flex flex-col gap-4"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader title="Featured projects" />
    <div className="grid grid-cols-[repeat(auto-fit,minmax(216px,1fr))] gap-4">
      {portfolioContent.projects.slice(0, 4).map((project, i) => (
        <ProjectCard
          key={project.slug}
          index={String(i + 1).padStart(2, "0")}
          year={project.date}
          title={project.name}
          tags={[cleanTag(project.tag)]}
          description={project.detail}
          href="#work"
          media={<div className="jt-graph h-full" style={hatchStyle} />}
        />
      ))}
    </div>
  </section>
);
