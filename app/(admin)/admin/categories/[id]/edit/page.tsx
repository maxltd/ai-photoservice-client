import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
} from "@/lib/api/contract";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

async function getCategoryById(id: string): Promise<CategoryResponse | null> {
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
    return null;
  }

  const payload =
    (await response.json()) as PaginatedResponse<CategoryResponse>;
  return payload.data.find((category) => category.id === id) ?? null;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return <CategoryForm initialData={category} />;
}
