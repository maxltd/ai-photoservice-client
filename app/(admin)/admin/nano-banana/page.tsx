import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NanoBananaPagesList } from "@/components/admin/nano-banana/NanoBananaPagesList";
import {
  API_ROUTES,
  NanoBananaPageStatus,
  type NanoBananaPageResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function NanoBananaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(params.pageSize ?? "20") || 20),
  );
  const status = Object.values(NanoBananaPageStatus).includes(
    params.status as NanoBananaPageStatus,
  )
    ? params.status
    : undefined;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (status) query.set("status", status);
  const response = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_NANO_BANANA}?${query.toString()}`,
    { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
  );
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load Nano Banana pages");
  const payload =
    (await response.json()) as PaginatedResponse<NanoBananaPageResponse>;
  return (
    <NanoBananaPagesList
      initialData={payload.data}
      meta={payload.meta}
      filters={{ search: params.search, status: status ?? "all" }}
    />
  );
}
