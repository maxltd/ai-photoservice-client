import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CreateCmsPageForm } from "@/components/admin/cms/CreateCmsPageForm";
import { CmsEditor } from "@/components/admin/cms/CmsEditor";
import { API_ROUTES, type CmsPageResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const response = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_CMS_PAGE_BY_SLUG("faq")}`,
    {
      headers: { cookie: (await cookies()).toString() },
      cache: "no-store",
    },
  );

  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (response.status === 404) return <CreateCmsPageForm isFaq />;
  if (!response.ok) throw new Error("Failed to load FAQ page");

  const payload = (await response.json()) as CmsPageResponse | { data: CmsPageResponse };
  const faqPage = "data" in payload ? payload.data : payload;

  if (faqPage.slug !== "faq") notFound();
  return <CmsEditor initialData={faqPage} />;
}
