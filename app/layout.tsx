import type { Metadata } from "next";

import { SiteShell } from "@/src/features/site";
import { getAllPosts } from "@/src/shared/lib/posts/posts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Jared Tucker",
  description: "Personal Portfolio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = await getAllPosts();
  return (
    <html lang="en">
      <body className="root p-6 pb-0 max-md:p-0">
        <SiteShell posts={posts}>{children}</SiteShell>
      </body>
    </html>
  );
}
