import { cookies } from "next/headers";
import {
  API_ROUTES,
  type CategoryResponse,
  type GenerationOrderListItemResponse,
  type PresetListItemResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { CreateCatalogClient } from "@/components/create/CreateCatalogClient";

interface ApiListResponse<TData> {
  data: TData;
}

export default async function CreateCatalogPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const [catsRes, presetsRes, recentRes] = await Promise.all([
    fetch(toServerApiUrl(`${API_ROUTES.CATEGORIES}?pageSize=100`), {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(toServerApiUrl(API_ROUTES.PRESETS), {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(toServerApiUrl(`${API_ROUTES.GENERATIONS}?pageSize=6`), {
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
  const recentJson = (await recentRes.json()) as ApiListResponse<
    GenerationOrderListItemResponse[]
  >;

  return (
    <CreateCatalogClient
      categories={catsJson.data}
      presets={presetsJson.data}
      recentOrders={recentJson.data}
    />
  );
}
