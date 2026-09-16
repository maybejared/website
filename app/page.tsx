import {
  ApproachSection,
  EnvironmentSection,
  ExperienceSection,
  HeroSection,
  ProjectsSection,
  WritingSection,
} from "@/src/features/site";
import { getAllPosts } from "@/src/shared/lib/posts/posts";

export default async function Home() {
  const posts = await getAllPosts();
  return (
    <>
      <HeroSection />
      <EnvironmentSection />
      <ProjectsSection />
      <WritingSection posts={posts} />
      <ApproachSection />
      <ExperienceSection />
    </>
  );
}
