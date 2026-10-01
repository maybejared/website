import type { FC } from "react";

import { MdxArticle } from "@/src/features/site/components/mdx-article";
import { formatPostDate } from "@/src/features/site/lib/format-post-date";
import type { ProjectDoc } from "@/src/shared/types/portfolio";

interface Props {
  project: ProjectDoc;
}

export const ProjectArticle: FC<Props> = ({ project }) => {
  const tag = project.tag.replace(/[[\]]/g, "");
  const links = [
    ...(project.repo ? [{ label: "GitHub", href: project.repo }] : []),
    ...(project.links ?? []),
  ];
  return (
    <MdxArticle
      section="Work"
      action={{ label: "All projects", href: "/projects" }}
      kicker={`${formatPostDate(project.date)} // ${tag} // ${project.status}`}
      title={project.title}
      description={project.description}
      date={project.date}
      meta={[
        { key: "Date", value: formatPostDate(project.date) },
        { key: "Tag", value: tag },
        { key: "Status", value: project.status },
      ]}
      links={links}
      image={
        project.image
          ? { src: project.image, alt: project.imageAlt ?? project.title }
          : undefined
      }
      headings={project.headings}
      content={project.content}
    />
  );
};
