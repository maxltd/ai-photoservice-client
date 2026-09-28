import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BlogArticlesList } from "@/components/admin/blog/BlogArticlesList";
import {
  API_ROUTES,
  BlogArticleStatus,
  type BlogArticleResponse,
  type BlogHubSettingsResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function BlogAdminPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? "20") || 20));
  const search = params.search?.trim();
  const status =
    params.status === BlogArticleStatus.DRAFT ||
    params.status === BlogArticleStatus.PUBLISHED ||
    params.status === BlogArticleStatus.ARCHIVED
      ? params.status
      : undefined;

  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search) query.set("search", search);
  if (status) query.set("status", status);

  const [articlesResponse, hubResponse] = await Promise.all([
    fetch(`${apiUrl}${API_ROUTES.ADMIN_BLOG}?${query.toString()}`, {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${API_ROUTES.ADMIN_BLOG_HUB}`, {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    }),
  ]);

  if (articlesResponse.status === 401) redirect("/?auth=1");
  if (articlesResponse.status === 403) redirect("/403");

  if (!articlesResponse.ok) throw new Error("Failed to load blog articles");
  if (!hubResponse.ok) throw new Error("Failed to load blog hub settings");

  const payload = (await articlesResponse.json()) as PaginatedResponse<BlogArticleResponse>;
  const hubPayload = (await hubResponse.json()) as
    | BlogHubSettingsResponse
    | { data: BlogHubSettingsResponse };
  const hub = "data" in hubPayload ? hubPayload.data : hubPayload;

  return (
    <BlogArticlesList
      initialData={payload.data}
      meta={payload.meta}
      hub={hub}
      filters={{ search, status: status ?? "all" }}
    />
  );
}
