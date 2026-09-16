import {
  ApproachSection,
  EnvironmentSection,
  ExperienceSection,
  HeroSection,
  ProjectsSection,
  WritingSection,
} from "@/src/features/site";
import { getAllPosts } from "@/src/shared/lib/posts/posts";
import { getAllProjects } from "@/src/shared/lib/projects/projects";

export default async function Home() {
  const [posts, projects] = await Promise.all([
    getAllPosts(),
    getAllProjects(),
  ]);
  return (
    <>
      <HeroSection />
      <EnvironmentSection />
      <ExperienceSection />
      <ProjectsSection projects={projects} />
      <WritingSection posts={posts} />
      <ApproachSection />
    </>
  );
}
