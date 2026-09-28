import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AiToolPageEditor } from "@/components/admin/ai-tools/AiToolPageEditor";
import { API_ROUTES, type AiToolPageResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";
export default async function EditAiToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await fetch(
    toServerApiUrl(API_ROUTES.ADMIN_AI_TOOL_PAGE_BY_ID(id)),
    { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
  );
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load AI tool page");
  const payload = (await response.json()) as AiToolPageResponse & {
    data?: AiToolPageResponse;
  };
  return <AiToolPageEditor initial={payload.data ?? payload} />;
}
