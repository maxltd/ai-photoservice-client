import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_ROUTES } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import type { GenerationOrderResponse } from "@/lib/hooks/generations/useGenerations";
import { OrderResultPage } from "@/components/gallery/OrderResultPage";

interface ApiItemResponse<TData> {
  data: TData;
}

export default async function GalleryOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    toServerApiUrl(API_ROUTES.GENERATION_BY_ID(orderId)),
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load order");
  }

  const json = (await res.json()) as ApiItemResponse<GenerationOrderResponse>;

  return <OrderResultPage order={json.data} />;
}
