import { cookies } from "next/headers";
import {
  API_ROUTES,
  type CategoryResponse,
  type PresetListItemResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { BrowsePresetsClient } from "../../../../../components/create/BrowsePresetsClient";

interface ApiListResponse<TData> {
  data: TData;
}

export default async function AllPresetsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const [catsRes, presetsRes] = await Promise.all([
    fetch(toServerApiUrl(`${API_ROUTES.CATEGORIES}?pageSize=100`), {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(toServerApiUrl(API_ROUTES.PRESETS), {
      headers: { cookie },
      cache: "no-store",
    }),
  ]);

  const catsJson = (await catsRes.json()) as ApiListResponse<
    CategoryResponse[]
  >;
  const presetsJson = (await presetsRes.json()) as ApiListResponse<
    PresetListItemResponse[]
  >;

  return (
    <BrowsePresetsClient
      categories={catsJson.data}
      presets={presetsJson.data}
      initialCategorySlug={category ?? null}
    />
  );
}
