import { notFound } from "next/navigation";

import { PostArticle } from "@/src/features/site";
import { getAllPosts, getPostBySlug } from "@/src/shared/lib/posts/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostReaderPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return <PostArticle post={post} />;
}
