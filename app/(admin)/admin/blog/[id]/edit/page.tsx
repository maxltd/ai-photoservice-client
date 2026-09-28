import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { BlogArticleEditor } from "@/components/admin/blog/BlogArticleEditor";
import { API_ROUTES, type BlogArticleResponse } from "@/lib/api/contract";

export default async function EditBlogArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");

  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_BLOG_BY_ID(id)}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load blog article");

  const payload = (await response.json()) as BlogArticleResponse | { data: BlogArticleResponse };
  const article = "data" in payload ? payload.data : payload;

  return <BlogArticleEditor initialData={article} />;
}
