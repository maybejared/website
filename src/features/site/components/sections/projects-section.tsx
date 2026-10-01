import { ProjectCard, SectionHeader } from "@/src/shared/ui";
import type { FC } from "react";

import { hatchStyle } from "@/src/features/site/lib/hatch";
import type { Project } from "@/src/shared/types/portfolio";

interface Props {
  projects: Project[];
}

/** Strips the `[tag]` brackets used by the content files. */
const cleanTag = (tag: string) => tag.replace(/[[\]]/g, "");

export const ProjectsSection: FC<Props> = ({ projects }) => (
  <section
    id="work"
    className="band flex flex-col gap-4"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader
      title="Featured projects"
      action={{ label: "View all", href: "/projects" }}
    />
    <div className="grid grid-cols-[repeat(auto-fit,minmax(216px,1fr))] gap-4">
      {projects.slice(0, 4).map((project, i) => (
        <ProjectCard
          key={project.slug}
          index={String(i + 1).padStart(2, "0")}
          year={project.date.slice(0, 4)}
          title={project.title}
          tags={[cleanTag(project.tag), project.status]}
          description={project.description}
          href={`/projects/${project.slug}`}
          media={<div className="graph h-full" style={hatchStyle} />}
        />
      ))}
    </div>
  </section>
);
