import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PhotoSessionIdeasList } from "@/components/admin/ideas/PhotoSessionIdeasList";
import {
  API_ROUTES,
  PhotoSessionIdeaStatus,
  type PaginatedResponse,
  type PhotoSessionIdeaResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

interface IdeasPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function PhotoSessionIdeasPage({ searchParams }: IdeasPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? "20") || 20));
  const search = params.search?.trim();
  const status =
    params.status === PhotoSessionIdeaStatus.DRAFT ||
    params.status === PhotoSessionIdeaStatus.PUBLISHED ||
    params.status === PhotoSessionIdeaStatus.ARCHIVED
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

  const response = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_IDEAS}?${query.toString()}`,
    {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    },
  );

  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load photo session ideas");

  const payload = (await response.json()) as PaginatedResponse<PhotoSessionIdeaResponse>;

  return (
    <PhotoSessionIdeasList
      initialData={payload.data}
      meta={payload.meta}
      filters={{ search, status: status ?? "all" }}
    />
  );
}
