import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PricingPageSettingsClient } from "@/components/admin/pricing-page/PricingPageSettingsClient";
import { API_ROUTES, type PricingPageSettingsResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function AdminPricesPage() {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_PRICING_PAGE}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load pricing page settings");
  const settings = (await response.json()) as PricingPageSettingsResponse;
  return <PricingPageSettingsClient initialSettings={settings} />;
}
