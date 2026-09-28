import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StylesHubEditor } from "@/components/admin/styles/StylesHubEditor";
import { API_ROUTES, type StylesHubSettingsResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function StylesHubAdminPage() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_PHOTO_SESSION_STYLES_HUB}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load styles hub settings");
  const raw = (await response.json()) as StylesHubSettingsResponse | { data: StylesHubSettingsResponse };
  const initial = "data" in raw ? raw.data : raw;
  return <StylesHubEditor initial={initial} />;
}
