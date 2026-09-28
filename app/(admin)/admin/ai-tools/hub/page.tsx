import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AiToolsHubEditor } from "@/components/admin/ai-tools/AiToolsHubEditor";
import {
  API_ROUTES,
  type AiToolsHubSettingsResponse,
} from "@/lib/api/contract";
export const dynamic = "force-dynamic";
export default async function AiToolsHubAdminPage() {
  const base = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("API_URL is not set");
  const response = await fetch(`${base}${API_ROUTES.ADMIN_AI_TOOLS_HUB}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load AI tools hub");
  const raw = (await response.json()) as AiToolsHubSettingsResponse & {
    data?: AiToolsHubSettingsResponse;
  };
  const payload = raw.data ?? raw;
  const initial: AiToolsHubSettingsResponse = {
    id: payload.id ?? "ai-tools-hub",
    h1: payload.h1 ?? "",
    description: payload.description ?? "",
    seoSections:
      Array.isArray(payload.seoSections) && payload.seoSections.length === 2
        ? payload.seoSections
        : [
            { heading: "", body: "" },
            { heading: "", body: "" },
          ],
    seoTitle: payload.seoTitle ?? null,
    seoDescription: payload.seoDescription ?? null,
    canonical: payload.canonical ?? null,
    ogTitle: payload.ogTitle ?? null,
    ogDescription: payload.ogDescription ?? null,
    ogImage: payload.ogImage ?? null,
    twitterCard: payload.twitterCard ?? null,
    jsonLd: payload.jsonLd ?? null,
    isVisible: payload.isVisible ?? false,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: payload.updatedAt ?? new Date().toISOString(),
  };
  return <AiToolsHubEditor initial={initial} />;
}
