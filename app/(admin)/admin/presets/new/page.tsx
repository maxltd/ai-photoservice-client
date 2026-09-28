import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";
import { CreatePresetDraftForm } from "@/components/admin/presets/CreatePresetDraftForm";

async function getCategories(): Promise<CategoryResponse[]> {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const response = await fetch(
    `${apiUrl}${API_ROUTES.ADMIN_CATEGORIES}?pageSize=100`,
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    redirect("/admin/presets");
  }

  const payload =
    (await response.json()) as PaginatedResponse<CategoryResponse>;
  return payload.data;
}

export default async function NewPresetPage() {
  const categories = await getCategories();
  return <CreatePresetDraftForm categories={categories} />;
}
