import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  API_ROUTES,
  type GenerationOrderResponse,
  type PresetResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { EditResultPage } from "@/components/gallery/EditResultPage";

interface ApiItemResponse<TData> {
  data: TData;
}

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const cookieStore = await cookies();

  const orderRes = await fetch(
    toServerApiUrl(API_ROUTES.GENERATION_BY_ID(orderId)),
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (orderRes.status === 404) {
    notFound();
  }

  if (!orderRes.ok) {
    throw new Error("Failed to load order");
  }

  const orderJson =
    (await orderRes.json()) as ApiItemResponse<GenerationOrderResponse>;
  const order = orderJson.data;

  if (!order.presetId) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-5 text-sm text-[--color-foreground-muted]">
          Редактирование доступно только для генераций по пресетам.
          <div className="mt-3">
            <Link
              href={`/app/gallery/${order.id}`}
              className="text-[--color-primary] underline-offset-2 hover:underline"
            >
              Вернуться к результату
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const presetRes = await fetch(
    toServerApiUrl(API_ROUTES.PRESET_BY_USER_ID(order.presetId)),
    {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    },
  );

  if (presetRes.status === 404) {
    notFound();
  }

  if (!presetRes.ok) {
    throw new Error("Failed to load preset");
  }

  const presetJson =
    (await presetRes.json()) as ApiItemResponse<PresetResponse>;

  return <EditResultPage order={order} preset={presetJson.data} />;
}
