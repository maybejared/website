import {
  EnvironmentSection,
  ExperienceSection,
  HeroSection,
  ProjectsSection,
} from "@/src/features/site";
import { getAllProjects } from "@/src/shared/lib/projects/projects";

export default async function Home() {
  const [projects] = await Promise.all([
    // getAllPosts(),
    getAllProjects(),
  ]);
  return (
    <>
      <HeroSection />
      <EnvironmentSection />
      <ExperienceSection />
      <ProjectsSection projects={projects} />
      {/*<WritingSection posts={posts} />*/}
    </>
  );
}
