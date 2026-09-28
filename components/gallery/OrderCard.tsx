import { useMemo } from "react";
import Image from "next/image";
import { Heart, ImageIcon, Pencil } from "lucide-react";
import {
  GenerationStatus,
  OrderSourceType,
  OrderStatus,
  type GenerationOrderListItemDto,
} from "@/lib/api/contract";
import { useOrderById } from "@/lib/hooks/generations/useGenerations";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: GenerationOrderListItemDto;
  sourceTitle: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

type GalleryCardVariant = "preset" | "session" | "processing" | "error";

function resolveVariant(order: GenerationOrderListItemDto): GalleryCardVariant {
  if (
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.PROCESSING
  ) {
    return "processing";
  }

  if (
    order.status === OrderStatus.FAILED ||
    order.status === OrderStatus.CANCELLED
  ) {
    return "error";
  }

  return order.sourceType === OrderSourceType.PHOTO_SESSION
    ? "session"
    : "preset";
}

export function OrderCard({
  order,
  sourceTitle,
  isFavorite = false,
  onToggleFavorite,
}: OrderCardProps) {
  const variant = resolveVariant(order);
  const orderDetailsQuery = useOrderById(order.id);

  const completedImageUrls = useMemo(() => {
    return (orderDetailsQuery.data?.generations ?? [])
      .filter(
        (generation) =>
          generation.status === GenerationStatus.COMPLETED &&
          !!generation.resultImageUrl,
      )
      .map((generation) => generation.resultImageUrl)
      .filter((url): url is string => !!url);
  }, [orderDetailsQuery.data?.generations]);

  const presetPreviewImage = completedImageUrls[0] ?? null;
  const sessionPreviewImages = completedImageUrls.slice(0, 4);
  const sessionPhotoCount = orderDetailsQuery.data?.generations.length ?? 0;
  const isSessionOrder = order.sourceType === OrderSourceType.PHOTO_SESSION;

  if (variant === "processing" || variant === "error") {
    const statusLabel = variant === "processing" ? "В обработке" : "Ошибка";

    return (
      <article className="overflow-hidden rounded-[12px] border border-white/10 bg-[--color-surface]">
        <div className="relative aspect-184/260 w-full bg-black/25">
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white/40" aria-hidden />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-black/20 to-black/80" />

          <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[12px] font-medium text-white">
            {statusLabel}
          </div>

          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-3">
            {isSessionOrder ? (
              <div className="mb-2 inline-flex h-5 items-center rounded-full bg-black/35 px-2 text-[13px] font-normal text-white">
                {sessionPhotoCount} фото
              </div>
            ) : null}
            <p className="line-clamp-2 text-[15px] font-normal text-white">
              {sourceTitle}
            </p>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "session") {
    return (
      <article className="overflow-hidden rounded-[12px] border border-white/10 bg-[--color-surface]">
        <div className="relative aspect-184/260 w-full bg-black/20">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0">
            {Array.from({ length: 4 }).map((_, index) => {
              const imageUrl = sessionPreviewImages[index] ?? null;

              return (
                <div key={index} className="relative bg-white/8">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={sourceTitle}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon
                        className="h-5 w-5 text-white/35"
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 via-black/10 to-black/80" />

          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-3">
            <div className="mb-2 inline-flex h-5 items-center rounded-full bg-black/35 px-2 text-[13px] font-normal text-white">
              {sessionPhotoCount} фото
            </div>
            <p className="line-clamp-2 text-[15px] font-normal text-white">
              {sourceTitle}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-[12px] border border-white/10 bg-[--color-surface]">
      <div className="relative aspect-184/260 w-full bg-black/20">
        {presetPreviewImage ? (
          <Image
            src={presetPreviewImage}
            alt={sourceTitle}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white/50" aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 via-black/10 to-black/75" />

        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <button
            type="button"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-black/60",
              isFavorite && "text-[--color-danger]",
            )}
            onClick={onToggleFavorite}
            aria-label={
              isFavorite ? "Убрать из избранного" : "Добавить в избранное"
            }
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/90"
            aria-label="Редактировать"
            disabled
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-3">
          <p className="line-clamp-2 text-[15px] font-normal text-white">
            {sourceTitle}
          </p>
        </div>
      </div>
    </article>
  );
}
