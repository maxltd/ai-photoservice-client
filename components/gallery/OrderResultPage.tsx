"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  Share2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  GenerationStatus,
  type GalleryItemResponse,
} from "@/lib/api/contract";
import type {
  GenerationOrderResponse,
  GenerationResponse,
} from "@/lib/hooks/generations/useGenerations";
import { Button } from "@/components/ui/button";

interface OrderResultPageProps {
  order: GenerationOrderResponse;
}

function getCompletedGenerations(
  order: GenerationOrderResponse,
): GenerationResponse[] {
  return order.generations.filter(
    (generation) =>
      generation.status === GenerationStatus.COMPLETED &&
      ((typeof generation.resultImageUrl === "string" &&
        generation.resultImageUrl.length > 0) ||
        (typeof generation.resultVideoUrl === "string" &&
          generation.resultVideoUrl.length > 0)),
  );
}

export function OrderResultPage({ order }: OrderResultPageProps) {
  const completedGenerations = useMemo(
    () => getCompletedGenerations(order),
    [order],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const activeGeneration = completedGenerations[activeIndex] ?? null;

  const publishMutation = useMutation({
    mutationFn: (payload: {
      generationId: string;
      title?: string;
      description?: string;
    }) =>
      apiPost<
        { data: GalleryItemResponse },
        { generationId: string; title?: string; description?: string }
      >(API_ROUTES.GALLERY, payload),
    onSuccess: () => {
      toast.success("Работа отправлена на модерацию");
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Не удалось опубликовать работу");
        return;
      }

      toast.error("Не удалось опубликовать работу");
    },
  });

  function handleDownload(): void {
    const resultUrl =
      activeGeneration?.resultVideoUrl ?? activeGeneration?.resultImageUrl;
    if (!resultUrl || !activeGeneration) {
      return;
    }

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `generation-${activeGeneration.id}.${activeGeneration.resultVideoUrl ? "mp4" : "jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleShare(): Promise<void> {
    const resultUrl =
      activeGeneration?.resultVideoUrl ?? activeGeneration?.resultImageUrl;
    if (!resultUrl) {
      return;
    }

    if (typeof navigator.share === "function") {
      await navigator.share({
        title: "Результат генерации",
        url: resultUrl,
      });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(resultUrl);
      toast.success("Ссылка скопирована");
      return;
    }

    toast.error("Поделиться не удалось в этом браузере");
  }

  async function handlePublish(): Promise<void> {
    if (!activeGeneration) {
      toast.error("Нет готового результата для публикации");
      return;
    }

    await publishMutation.mutateAsync({ generationId: activeGeneration.id });
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-3 md:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[--color-foreground-muted]">
            Заказ #{order.id.slice(0, 8)}
          </p>
          <p className="text-xs text-[--color-foreground-muted]">
            Готово изображений: {completedGenerations.length} /{" "}
            {order.generations.length}
          </p>
        </div>

        <div className="relative aspect-4/5 w-full overflow-hidden rounded-[--radius-md] bg-[--color-background] md:aspect-video">
          {activeGeneration?.resultVideoUrl ? (
            <video
              key={activeGeneration.id}
              src={activeGeneration.resultVideoUrl}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : activeGeneration?.resultImageUrl ? (
            <Image
              src={activeGeneration.resultImageUrl}
              alt={`Результат ${activeIndex + 1}`}
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-[--color-foreground-muted]">
              Для этого заказа пока нет завершённых результатов.
            </div>
          )}
        </div>

        {completedGenerations.length > 1 ? (
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? completedGenerations.length - 1 : prev - 1,
                )
              }
            >
              <ArrowLeft className="h-4 w-4" />
              Предыдущее
            </Button>

            <span className="text-xs text-[--color-foreground-muted]">
              {activeIndex + 1} / {completedGenerations.length}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === completedGenerations.length - 1 ? 0 : prev + 1,
                )
              }
            >
              Следующее
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        {completedGenerations.length > 0 ? (
          <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
            {completedGenerations.map((generation, index) => (
              <button
                key={generation.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-12 shrink-0 overflow-hidden rounded border transition md:h-20 md:w-14 ${
                  index === activeIndex
                    ? "border-[--color-primary]"
                    : "border-[--color-border]"
                }`}
              >
                {generation.resultVideoUrl ? (
                  <>
                    <video
                      src={generation.resultVideoUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                      <Video className="h-4 w-4" aria-label="Видео" />
                    </span>
                  </>
                ) : generation.resultImageUrl ? (
                  <Image
                    src={generation.resultImageUrl}
                    alt={`Миниатюра ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!activeGeneration}
        >
          <Download className="h-4 w-4" />
          Скачать
        </Button>

        {activeGeneration?.resultVideoUrl ? null : (
          <Button
            variant="outline"
            onClick={() => void handlePublish()}
            disabled={!activeGeneration || publishMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            {publishMutation.isPending ? "Публикация..." : "В галерею"}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => void handleShare()}
          disabled={!activeGeneration}
        >
          <Share2 className="h-4 w-4" />
          Поделиться
        </Button>

        <Button asChild>
          <Link href={`/app/gallery/${order.id}/edit`}>
            <ExternalLink className="h-4 w-4" />
            Создать похожее
          </Link>
        </Button>
      </div>
    </section>
  );
}
