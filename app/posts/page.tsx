import { PostList } from "@/src/features/site";
import { getAllPosts } from "@/src/shared/lib/posts/posts";

export default async function PostsPage() {
  const posts = await getAllPosts();
  return <PostList posts={posts} />;
}
