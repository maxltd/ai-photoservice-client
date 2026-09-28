import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LegalPageEditor } from "@/components/admin/rules/LegalPageEditor";
import { API_ROUTES, type CmsPageResponse } from "@/lib/api/contract";
import { isLegalPageSlug } from "@/lib/legal-pages";

interface AdminLegalPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminLegalPage({ params }: AdminLegalPageProps) {
  const { slug } = await params;
  if (!isLegalPageSlug(slug)) notFound();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_CMS_PAGE_BY_SLUG(slug)}`,
    { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
  );
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load legal page");
  const payload = (await response.json()) as CmsPageResponse | { data: CmsPageResponse };
  return <LegalPageEditor page={"data" in payload ? payload.data : payload} />;
}
