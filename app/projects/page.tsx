import { ProjectList } from "@/src/features/site";
import { getAllProjects } from "@/src/shared/lib/projects/projects";

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return <ProjectList projects={projects} />;
}
