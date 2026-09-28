import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";
import { CategoriesClient } from "@/components/admin/categories/CategoriesClient";

export const dynamic = "force-dynamic";

async function getCategories(): Promise<PaginatedResponse<CategoryResponse>> {
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

  if (response.status === 401) {
    redirect("/?auth=1");
  }

  if (response.status === 403) {
    redirect("/403");
  }

  if (!response.ok) {
    throw new Error("Failed to load categories");
  }

  const payload =
    (await response.json()) as PaginatedResponse<CategoryResponse>;
  return payload;
}

export default async function CategoriesPage() {
  const initialData = await getCategories();
  return <CategoriesClient initialData={initialData} />;
}
