import type { FC } from "react";

import { MdxArticle } from "@/src/features/site/components/mdx-article";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { ProjectDoc } from "@/src/shared/types/portfolio";

interface Props {
  project: ProjectDoc;
}

export const ProjectArticle: FC<Props> = ({ project }) => (
  <MdxArticle
    section="Work"
    action={{ label: "All projects", href: "/projects" }}
    kicker={
      <>
        {formatPostDate(project.date)} &nbsp;//&nbsp;{" "}
        {project.tag.replace(/[[\]]/g, "")} &nbsp;//&nbsp; {project.status}
        {project.repo && (
          <>
            {" "}
            &nbsp;//&nbsp;{" "}
            <a href={project.repo} target="_blank" rel="noopener noreferrer">
              Repo ↗
            </a>
          </>
        )}
      </>
    }
    title={project.title}
    description={project.description}
    headings={project.headings}
    content={project.content}
  />
);
