import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_ROUTES, type AiToolPageResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";
export default async function AiToolPagesAdminPage() {
  const response = await fetch(toServerApiUrl(API_ROUTES.ADMIN_AI_TOOL_PAGES), {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load AI tool pages");
  const payload = (await response.json()) as { data: AiToolPageResponse[] };
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Страницы AI-инструментов</h1>
          <p className="text-sm text-foreground-muted">
            Контент детальных страниц
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/ai-tools/pages/new">Новая страница</Link>
        </Button>
      </div>
      <div className="space-y-2">
        {payload.data.map((page) => (
          <Link
            key={page.id}
            href={`/admin/ai-tools/pages/${page.id}/edit`}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 hover:border-secondary"
          >
            <span>{page.h1}</span>
            <span className="text-sm text-foreground-muted">{page.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
