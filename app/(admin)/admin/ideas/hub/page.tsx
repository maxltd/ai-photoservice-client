import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IdeasHubEditor } from "@/components/admin/ideas/IdeasHubEditor";
import { API_ROUTES, type IdeasHubSettingsResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function IdeasHubAdminPage() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_IDEAS_HUB}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load ideas hub settings");
  const raw = (await response.json()) as IdeasHubSettingsResponse | { data: IdeasHubSettingsResponse };
  const initial = "data" in raw ? raw.data : raw;
  return <IdeasHubEditor initial={initial} />;
}
