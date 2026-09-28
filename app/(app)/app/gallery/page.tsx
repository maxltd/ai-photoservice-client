import { cookies } from "next/headers";
import { redirectToAuth } from "@/lib/auth/auth-redirect";
import {
  API_ROUTES,
  type ApiErrorResponse,
  type GenerationOrderListItemDto,
  type PaginationMeta,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { GalleryPageClient } from "@/components/gallery/GalleryPageClient";

interface OrdersResponse {
  data: GenerationOrderListItemDto[];
  meta: PaginationMeta;
}

export default async function GalleryPage() {
  const cookieStore = await cookies();

  const res = await fetch(
    toServerApiUrl(`${API_ROUTES.GENERATIONS}?pageSize=20`),
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (res.status === 401) {
    redirectToAuth("/app/gallery");
  }

  if (!res.ok) {
    const errorPayload = (await res
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(
      `Failed to load orders (status: ${res.status}, code: ${errorPayload?.error?.code ?? "UNKNOWN"})`,
    );
  }

  const json = (await res.json()) as OrdersResponse;

  return (
    <GalleryPageClient initialOrders={json.data} initialMeta={json.meta} />
  );
}
