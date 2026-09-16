import type { Metadata } from "next";

import { SiteShell } from "@/src/features/site";
import { getAllPosts } from "@/src/shared/lib/posts/posts";

import "@/packages/ds/src/styles.css";
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
      <body className="jt-root p-6 max-md:p-0">
        <SiteShell posts={posts}>{children}</SiteShell>
      </body>
    </html>
  );
}
