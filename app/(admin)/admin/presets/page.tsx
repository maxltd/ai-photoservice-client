import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
  type PresetListItemResponse,
} from "@/lib/api/contract";
import { PresetsClient } from "@/components/admin/presets/PresetsClient";

export const dynamic = "force-dynamic";

async function getInitialData(): Promise<{
  presets: PresetListItemResponse[];
  categories: CategoryResponse[];
}> {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const [presetsRes, categoriesRes] = await Promise.all([
    fetch(`${apiUrl}${API_ROUTES.ADMIN_PRESETS}?pageSize=100`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${API_ROUTES.ADMIN_CATEGORIES}?pageSize=100`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
  ]);

  if (presetsRes.status === 401 || categoriesRes.status === 401) {
    redirect("/?auth=1");
  }

  if (presetsRes.status === 403 || categoriesRes.status === 403) {
    redirect("/403");
  }

  if (!presetsRes.ok || !categoriesRes.ok) {
    throw new Error("Failed to load presets admin data");
  }

  const presetsPayload =
    (await presetsRes.json()) as PaginatedResponse<PresetListItemResponse>;

  const categoriesPayload =
    (await categoriesRes.json()) as PaginatedResponse<CategoryResponse>;

  const presets = presetsPayload.data;

  return {
    presets,
    categories: categoriesPayload.data,
  };
}

export default async function PresetsPage() {
  const { presets, categories } = await getInitialData();
  return <PresetsClient initialData={presets} categories={categories} />;
}
