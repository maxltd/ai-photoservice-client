"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Heart, Sparkles } from "lucide-react";
import {
  API_ROUTES,
  OrderSourceType,
  OrderStatus,
  type GenerationOrderListItemDto,
  type PaginationMeta,
  type PaginatedResponse,
  type PhotoSessionListItemResponse,
  type PresetListItemResponse,
} from "@/lib/api/contract";
import { apiGet } from "@/lib/api/client";
import {
  useMyOrders,
  useMyOrdersSse,
} from "@/lib/hooks/generations/useGenerations";
import { queryKeys } from "@/lib/query/keys";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/gallery/OrderCard";
import { OrderWatcher } from "@/components/gallery/OrderWatcher";
import { cn } from "@/lib/utils";

interface GalleryPageClientProps {
  initialOrders: GenerationOrderListItemDto[];
  initialMeta: PaginationMeta;
}

interface ListEnvelope<T> {
  data: T[];
}

const EMPTY_ORDERS: GenerationOrderListItemDto[] = [];

function extractListData<T>(payload: T[] | ListEnvelope<T> | undefined): T[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export function GalleryPageClient({
  initialOrders,
  initialMeta,
}: GalleryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteOrderIds, setFavoriteOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [page, setPage] = useState<number>(1);

  const initialData = useMemo<
    PaginatedResponse<GenerationOrderListItemDto> | undefined
  >(
    () => (page === 1 ? { data: initialOrders, meta: initialMeta } : undefined),
    [initialMeta, initialOrders, page],
  );

  useMyOrdersSse();

  const ordersQuery = useMyOrders(
    {
      page,
      pageSize: 20,
    },
    initialData,
  );

  const orders = ordersQuery.data?.data ?? EMPTY_ORDERS;
  const visibleOrders = useMemo(() => {
    if (!favoritesOnly) {
      return orders;
    }

    return orders.filter((order) => favoriteOrderIds.has(order.id));
  }, [favoriteOrderIds, favoritesOnly, orders]);
  const meta = ordersQuery.data?.meta;

  const watchOrderId = searchParams.get("orderId");

  const presetsQuery = useQuery({
    queryKey: queryKeys.presets.list({ scope: "gallery" }),
    queryFn: () =>
      apiGet<PresetListItemResponse[] | ListEnvelope<PresetListItemResponse>>(
        API_ROUTES.PRESETS,
      ),
    staleTime: 60_000,
  });

  const sessionsQuery = useQuery({
    queryKey: queryKeys.photoSessions.list({ scope: "gallery" }),
    queryFn: () =>
      apiGet<
        | PhotoSessionListItemResponse[]
        | ListEnvelope<PhotoSessionListItemResponse>
      >(API_ROUTES.PHOTO_SESSIONS),
    staleTime: 60_000,
  });

  const presetTitles = useMemo(() => {
    const map = new Map<string, string>();

    for (const preset of extractListData(presetsQuery.data)) {
      map.set(preset.id, preset.title);
    }

    return map;
  }, [presetsQuery.data]);

  const sessionTitles = useMemo(() => {
    const map = new Map<string, string>();

    for (const session of extractListData(sessionsQuery.data)) {
      map.set(session.id, session.title);
    }

    return map;
  }, [sessionsQuery.data]);

  function handleCloseWatcher(): void {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("orderId");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleWatcherComplete(orderId: string): void {
    router.push(`/app/gallery/${orderId}`);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1556px] px-3 pb-8 pt-4 md:px-7 md:pb-10 md:pt-6">
        <div className="mb-4 md:mb-5">
          <button
            type="button"
            onClick={() => {
              setFavoritesOnly((prev) => !prev);
              setPage(1);
            }}
            className={cn(
              "inline-flex h-[33px] items-center gap-2 rounded-full border px-[18px] py-[7px] text-[15px] font-semibold leading-none transition-colors",
              favoritesOnly
                ? "border-white bg-white text-[--color-background]"
                : "border-white/15 bg-transparent text-white/50 hover:border-white/30 hover:text-white/70",
            )}
            aria-pressed={favoritesOnly}
            aria-label="Показать избранные работы"
          >
            <Heart
              className={cn("h-4 w-4", favoritesOnly && "fill-current")}
              aria-hidden
            />
            Избранное
          </button>
        </div>

        {ordersQuery.isLoading && orders.length === 0 ? (
          <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-6 text-sm text-[--color-foreground-muted]">
            Загружаем работы...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="mx-auto mt-16 w-full max-w-103.5 text-center md:mt-20">
            <p className="text-xl font-semibold text-[--color-foreground] md:text-2xl">
              {favoritesOnly
                ? "У вас пока нет избранных работ"
                : "У вас пока нет созданных работ"}
            </p>
            <p className="mt-2 text-sm text-[--color-foreground]/70 md:text-lg">
              {favoritesOnly
                ? "Добавьте ваши лучшие работы в избранное"
                : "Начните создавать свой контент прямо сейчас"}
            </p>
            <Button
              asChild
              className="mt-6 h-13 w-full rounded-[--radius-lg] bg-[--color-profile-link] text-base font-semibold hover:bg-[--color-profile-link]/90"
            >
              <Link href="/app/create">
                <Sparkles className="h-5 w-5" />
                Создать
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                sourceTitle={
                  order.sourceType === OrderSourceType.PRESET
                    ? ((order.presetId
                        ? presetTitles.get(order.presetId)
                        : undefined) ?? "Создание по шаблону")
                    : ((order.photoSessionId
                        ? sessionTitles.get(order.photoSessionId)
                        : undefined) ?? "Фотосессия")
                }
                isFavorite={favoriteOrderIds.has(order.id)}
                onToggleFavorite={
                  order.sourceType === OrderSourceType.PRESET &&
                  order.status === OrderStatus.COMPLETED
                    ? () => {
                        setFavoriteOrderIds((prev) => {
                          const next = new Set(prev);

                          if (next.has(order.id)) {
                            next.delete(order.id);
                          } else {
                            next.add(order.id);
                          }

                          return next;
                        });
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && !favoritesOnly ? (
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Назад
            </Button>
            <span className="text-sm text-[--color-foreground-muted]">
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() =>
                setPage((prev) => Math.min(meta.totalPages, prev + 1))
              }
            >
              Далее
            </Button>
          </div>
        ) : null}
      </section>

      {watchOrderId ? (
        <OrderWatcher
          orderId={watchOrderId}
          onClose={handleCloseWatcher}
          onComplete={handleWatcherComplete}
        />
      ) : null}
    </>
  );
}
