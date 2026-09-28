import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { Card } from "@/components/ui/card";
import { API_ROUTES, type CmsPageResponse } from "@/lib/api/contract";
import { LEGAL_PAGE_DEFINITIONS } from "@/lib/legal-pages";

export const dynamic = "force-dynamic";

export default async function AdminRulesPage() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const cookie = (await cookies()).toString();
  const pages = await Promise.all(
    LEGAL_PAGE_DEFINITIONS.map(async (definition) => {
      const response = await fetch(
        `${apiUrl}${API_ROUTES.ADMIN_CMS_PAGE_BY_SLUG(definition.slug)}`,
        { headers: { cookie }, cache: "no-store" },
      );
      if (response.status === 401) redirect("/?auth=1");
      if (response.status === 403) redirect("/403");
      if (response.status === 404) return { definition, page: null };
      if (!response.ok) throw new Error("Failed to load legal page");
      const payload = (await response.json()) as CmsPageResponse | { data: CmsPageResponse };
      return { definition, page: "data" in payload ? payload.data : payload };
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Правила" description="Юридические документы сервиса" />
      <div className="grid gap-4 md:grid-cols-2">
        {pages.map(({ definition, page }) => (
          <Card key={definition.slug} className="border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <h2 className="font-medium">{definition.label}</h2>
                <p className="mt-1 text-sm text-[--color-foreground-muted]">/{definition.slug}</p>
                <Link
                  href={page ? `/admin/rules/${definition.slug}` : `/admin/cms/new`}
                  className="mt-4 inline-flex text-sm text-primary underline-offset-4 hover:underline"
                >
                  {page ? "Редактировать" : "Создать страницу"}
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
