import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/admin/settings/SettingsClient";
import { API_ROUTES, type AppSettingResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(`${apiUrl}${API_ROUTES.ADMIN_SETTINGS}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/?auth=1");
  }

  if (res.status === 403) {
    redirect("/403");
  }

  if (!res.ok) {
    throw new Error("Failed to load admin settings");
  }

  const payload = (await res.json()) as
    | AppSettingResponse[]
    | { data: AppSettingResponse[] };

  const settings = Array.isArray(payload) ? payload : payload.data;

  return <SettingsClient initialData={settings} />;
}
