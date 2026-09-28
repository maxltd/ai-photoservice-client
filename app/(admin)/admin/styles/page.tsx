import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PhotoSessionStylesList } from "@/components/admin/styles/PhotoSessionStylesList";
import {
  API_ROUTES,
  PhotoSessionStyleStatus,
  type PaginatedResponse,
  type PhotoSessionStyleResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

interface StylesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function PhotoSessionStylesPage({ searchParams }: StylesPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? "20") || 20));
  const search = params.search?.trim();
  const status =
    params.status === PhotoSessionStyleStatus.DRAFT ||
    params.status === PhotoSessionStyleStatus.PUBLISHED ||
    params.status === PhotoSessionStyleStatus.ARCHIVED
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
    `${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_STYLES}?${query.toString()}`,
    {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    },
  );

  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load photo session styles");

  const payload = (await response.json()) as PaginatedResponse<PhotoSessionStyleResponse>;

  return (
    <PhotoSessionStylesList
      initialData={payload.data}
      meta={payload.meta}
      filters={{ search, status: status ?? "all" }}
    />
  );
}
