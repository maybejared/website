import { List, ListRow, SectionHeader } from "@jt/ds";
import type { FC } from "react";

import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { Project } from "@/src/shared/types/portfolio";

interface Props {
  projects: Project[];
}

export const ProjectList: FC<Props> = ({ projects }) => (
  <section
    className="band flex flex-1 flex-col gap-3"
    style={{ padding: "24px 32px 28px" }}
  >
    <SectionHeader title="Work / Projects / Experiments" />
    <List>
      {projects.map((project) => (
        <ListRow
          key={project.slug}
          date={formatPostDate(project.date)}
          title={project.title}
          description={project.description}
          href={`/projects/${project.slug}`}
        />
      ))}
    </List>
  </section>
);
