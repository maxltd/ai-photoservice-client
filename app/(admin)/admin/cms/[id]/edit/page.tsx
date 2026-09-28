import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CmsEditor } from "@/components/admin/cms/CmsEditor";
import { API_ROUTES, type CmsPageResponse } from "@/lib/api/contract";

interface CmsEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CmsEditPage({ params }: CmsEditPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(`${apiUrl}${API_ROUTES.ADMIN_CMS_PAGE_BY_ID(id)}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load CMS page");
  }

  const payload = (await res.json()) as
    | CmsPageResponse
    | { data: CmsPageResponse };

  const page = "data" in payload ? payload.data : payload;

  return <CmsEditor initialData={page} />;
}
