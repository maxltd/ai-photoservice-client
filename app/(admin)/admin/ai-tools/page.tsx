import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AiToolPagesList } from "@/components/admin/ai-tools/AiToolPagesList";
import {
  API_ROUTES,
  AiToolPageStatus,
  type AiToolPageResponse,
  type PaginationMeta,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";
interface Props {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    status?: string;
  }>;
}
export default async function AiToolsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(params.pageSize ?? "20") || 20),
  );
  const status =
    params.status === AiToolPageStatus.DRAFT ||
    params.status === AiToolPageStatus.PUBLISHED ||
    params.status === AiToolPageStatus.ARCHIVED
      ? params.status
      : undefined;
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (status) query.set("status", status);
  const base = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("API_URL is not set");
  const response = await fetch(
    `${base}${API_ROUTES.ADMIN_AI_TOOL_PAGES}?${query.toString()}`,
    { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
  );
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load AI tool pages");
  const raw = (await response.json()) as {
    data?:
      | AiToolPageResponse[]
      | { data: AiToolPageResponse[]; meta: PaginationMeta };
    meta?: PaginationMeta;
  };
  const payload =
    raw.data && !Array.isArray(raw.data)
      ? raw.data
      : {
          data: Array.isArray(raw.data) ? raw.data : [],
          meta: raw.meta ?? {
            page,
            pageSize,
            total: Array.isArray(raw.data) ? raw.data.length : 0,
            totalPages: 1,
          },
        };
  return (
    <AiToolPagesList
      initialData={payload.data}
      meta={payload.meta}
      filters={{ search: params.search, status: status ?? "all" }}
    />
  );
}
