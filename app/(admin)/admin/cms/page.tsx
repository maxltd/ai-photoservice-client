import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CmsClient } from "@/components/admin/cms/CmsClient";
import {
  API_ROUTES,
  type CmsPageResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function CmsPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_CMS_PAGES}?pageSize=20`,
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (res.status === 401) {
    redirect("/?auth=1");
  }

  if (res.status === 403) {
    redirect("/403");
  }

  if (!res.ok) {
    throw new Error("Failed to load admin CMS pages");
  }

  const result = (await res.json()) as PaginatedResponse<CmsPageResponse>;
  return <CmsClient initialData={result.data} initialMeta={result.meta} />;
}
