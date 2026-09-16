import { notFound } from "next/navigation";

import { ProjectArticle } from "@/src/features/site";
import {
  getAllProjects,
  getProjectBySlug,
} from "@/src/shared/lib/projects/projects";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectArticle project={project} />;
}
