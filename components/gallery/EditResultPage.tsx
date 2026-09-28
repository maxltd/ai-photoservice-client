"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  OrderSourceType,
  type GenerationOrderResponse,
  type PresetResponse,
} from "@/lib/api/contract";
import { useCreateGeneration } from "@/lib/hooks/generations/useCreateGeneration";
import { ParameterSelector } from "@/components/create/ParameterSelector";
import {
  PhotoUploadZone,
  type UploadedPhoto,
} from "@/components/create/PhotoUploadZone";
import { Button } from "@/components/ui/button";

interface EditResultPageProps {
  order: GenerationOrderResponse;
  preset: PresetResponse;
}

function getInitialSelectedOptions(order: GenerationOrderResponse): Record<string, string> {
  return Object.fromEntries(
    (order.selectedOptions ?? []).map((option) => [
      option.parameterGroupId,
      option.optionId,
    ]),
  );
}

export function EditResultPage({ order, preset }: EditResultPageProps) {
  const router = useRouter();
  const createGeneration = useCreateGeneration();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => getInitialSelectedOptions(order),
  );

  const previewResultUrl = useMemo(() => {
    const completed = order.generations.find(
      (generation) =>
        typeof generation.resultImageUrl === "string" &&
        generation.resultImageUrl.length > 0,
    );

    return completed?.resultImageUrl ?? null;
  }, [order.generations]);

  const requiredGroups = useMemo(
    () => preset.parameterGroups.filter((group) => group.isRequired),
    [preset.parameterGroups],
  );

  const missingRequired = useMemo(
    () => requiredGroups.filter((group) => !selectedOptions[group.id]).length,
    [requiredGroups, selectedOptions],
  );

  const readyPhoto = photos.find((photo) => photo.status === "done") ?? null;

  const canSubmit =
    !createGeneration.isPending &&
    readyPhoto !== null &&
    missingRequired === 0 &&
    order.presetId;

  function handleSelect(groupId: string, optionId: string): void {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  }

  async function handleSubmit(): Promise<void> {
    if (!order.presetId) {
      toast.error("Для этого заказа недоступно создание вариации");
      return;
    }

    if (!readyPhoto) {
      toast.error("Сначала загрузите фото");
      return;
    }

    if (missingRequired > 0) {
      toast.error("Заполните обязательные параметры");
      return;
    }

    await createGeneration.mutateAsync({
      dto: {
        sourceType: OrderSourceType.PRESET,
        presetId: order.presetId,
        inputImageUrl: readyPhoto.storageKey,
        selectedOptions: Object.entries(selectedOptions).map(
          ([parameterGroupId, optionId]) => ({ parameterGroupId, optionId }),
        ),
      },
      idempotencyKey: crypto.randomUUID(),
    });

    router.push(`/app/gallery?orderId=${order.id}`);
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 md:px-6 md:pb-32 md:pt-6">
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-[--color-border] bg-[--color-background]/95 px-4 py-3 backdrop-blur-sm md:-mx-6 md:mb-5 md:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href={`/app/gallery/${order.id}`} aria-label="Назад к результату">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-sm font-semibold md:text-base">Создать вариацию</h1>
            <p className="text-xs text-[--color-foreground-muted]">{preset.title}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-5">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-3 md:p-4">
          <p className="mb-2 text-xs text-[--color-foreground-muted]">Оригинал</p>
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-[--radius-md] bg-[--color-background] md:aspect-video">
            {previewResultUrl ? (
              <Image
                src={previewResultUrl}
                alt="Оригинальный результат"
                fill
                unoptimized
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 960px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-[--color-foreground-muted]">
                Нет готового изображения в этом заказе.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
          <h2 className="mb-2 text-sm font-semibold md:text-base">Новое фото</h2>
          <PhotoUploadZone value={photos} onChange={setPhotos} min={1} max={1} />
        </div>

        {preset.parameterGroups.length > 0 ? (
          <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
            <h2 className="mb-2 text-sm font-semibold md:text-base">Параметры</h2>
            <ParameterSelector
              groups={preset.parameterGroups}
              selectedOptions={selectedOptions}
              onSelect={handleSelect}
            />
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[--color-border] bg-[--color-background]/95 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <p className="text-xs text-[--color-foreground-muted]">Стоимость: {preset.tokenCost} токенов</p>
          <Button disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {createGeneration.isPending ? "Создание..." : "Создать вариацию"}
          </Button>
        </div>
      </div>
    </section>
  );
}
