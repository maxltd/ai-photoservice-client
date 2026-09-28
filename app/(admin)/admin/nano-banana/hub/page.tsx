import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NanoBananaHubEditor } from "@/components/admin/nano-banana/NanoBananaHubEditor";
import {
  API_ROUTES,
  type NanoBananaHubSettingsResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";
export default async function NanoBananaHubAdminPage() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_NANO_BANANA_HUB}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load Nano Banana hub");
  const payload = (await response.json()) as
    | NanoBananaHubSettingsResponse
    | { data: NanoBananaHubSettingsResponse };
  return (
    <NanoBananaHubEditor
      initialData={"data" in payload ? payload.data : payload}
    />
  );
}
