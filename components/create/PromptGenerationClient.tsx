"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/contract";
import { usePromptGeneration } from "@/lib/hooks/generations/usePromptGeneration";
import {
  PhotoUploadZone,
  type UploadedPhoto,
} from "@/components/create/PhotoUploadZone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE_PROMPTS = [
  "Кинематографичный портрет в мягком свете",
  "Фотореалистичный editorial style, high detail",
  "Уличная фотография на закате, natural colors",
  "Портрет в стиле fashion campaign",
] as const;

export function PromptGenerationClient() {
  const router = useRouter();
  const promptMutation = usePromptGeneration();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isBackendUnavailable, setIsBackendUnavailable] = useState(false);

  const promptLength = prompt.length;
  const readyPhoto = useMemo(
    () => photos.find((photo) => photo.status === "done") ?? null,
    [photos],
  );

  const canSubmit =
    !isBackendUnavailable &&
    !promptMutation.isPending &&
    readyPhoto !== null &&
    prompt.trim().length > 0 &&
    promptLength <= 1000;

  async function handleSubmit(): Promise<void> {
    if (isBackendUnavailable) {
      return;
    }

    if (!readyPhoto) {
      toast.error("Сначала загрузите фото");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Добавьте промпт");
      return;
    }

    if (promptLength > 1000) {
      toast.error("Промпт не должен превышать 1000 символов");
      return;
    }

    try {
      await promptMutation.mutateAsync({
        dto: {
          inputImageUrl: readyPhoto.storageKey,
          prompt: prompt.trim(),
        },
        idempotencyKey: crypto.randomUUID(),
      });

      router.push("/app/gallery");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        setIsBackendUnavailable(true);
        return;
      }

      toast.error("Не удалось создать генерацию");
    }
  }

  if (isBackendUnavailable) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <div className="rounded-[--radius-lg] border border-[--color-danger] bg-[--color-surface] p-5">
          <div className="mb-2 flex items-center gap-2 text-[--color-danger]">
            <AlertTriangle className="h-4 w-4" />
            <h1 className="text-sm font-semibold md:text-base">
              Недоступно: требуется обновление backend API
            </h1>
          </div>
          <p className="text-sm text-[--color-foreground-muted]">
            Эндпоинт prompt-generation ещё не доступен в текущей версии backend.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 space-y-1 md:mb-6">
        <h1 className="text-xl font-semibold md:text-2xl">Промпт из фото</h1>
        <p className="text-sm text-[--color-foreground-muted]">
          Загрузите изображение и опишите желаемый результат.
        </p>
      </div>

      <div className="space-y-4 md:space-y-5">
        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
          <h2 className="mb-2 text-sm font-semibold md:text-base">Фото</h2>
          <PhotoUploadZone
            value={photos}
            onChange={setPhotos}
            min={1}
            max={1}
          />
        </div>

        <div className="rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold md:text-base">Промпт</h2>
            <span className="text-xs text-[--color-foreground-muted]">
              {promptLength}/1000
            </span>
          </div>

          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Опишите стиль, свет, ракурс, атмосферу и детали результата"
            maxLength={1000}
            className="min-h-28"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setPrompt(chip)}
                className="rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1.5 text-xs text-[--color-foreground-muted] transition hover:text-[--color-foreground]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {promptMutation.isPending ? "Создание..." : "Создать генерацию"}
          </Button>
        </div>
      </div>
    </section>
  );
}
