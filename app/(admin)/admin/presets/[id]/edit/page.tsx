import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  API_ROUTES,
  type CategoryResponse,
  type PaginatedResponse,
  type PresetResponse,
} from "@/lib/api/contract";
import { PresetEditor } from "@/components/admin/presets/PresetEditor";

interface EditPresetPageProps {
  params: Promise<{ id: string }>;
}

async function getData(id: string): Promise<{
  preset: PresetResponse | null;
  categories: CategoryResponse[];
}> {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const [presetRes, categoriesRes] = await Promise.all([
    fetch(`${apiUrl}${API_ROUTES.ADMIN_PRESET_BY_ID(id)}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${API_ROUTES.ADMIN_CATEGORIES}?pageSize=100`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
  ]);

  if (presetRes.status === 401 || categoriesRes.status === 401) {
    redirect("/?auth=1");
  }

  if (presetRes.status === 403 || categoriesRes.status === 403) {
    redirect("/403");
  }

  if (presetRes.status === 404) {
    return { preset: null, categories: [] };
  }

  if (!presetRes.ok) {
    throw new Error("Failed to load preset for editing");
  }

  if (!categoriesRes.ok) {
    throw new Error("Failed to load categories for preset editor");
  }

  const presetPayload = (await presetRes.json()) as
    | PresetResponse
    | { data: PresetResponse };
  const categoriesPayload =
    (await categoriesRes.json()) as PaginatedResponse<CategoryResponse>;

  return {
    preset: "data" in presetPayload ? presetPayload.data : presetPayload,
    categories: categoriesPayload.data,
  };
}

export default async function EditPresetPage({ params }: EditPresetPageProps) {
  const { id } = await params;
  const { preset, categories } = await getData(id);

  if (!preset) {
    notFound();
  }

  return <PresetEditor initialData={preset} categories={categories} />;
}
