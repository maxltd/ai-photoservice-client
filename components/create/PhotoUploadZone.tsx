"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_ROUTES, type UploadImageResponse } from "@/lib/api/contract";
import { apiUpload } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export interface UploadedPhoto {
  localId: string;
  storageKey: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
}

interface PhotoUploadZoneProps {
  value: UploadedPhoto[];
  onChange: (value: UploadedPhoto[]) => void;
  min?: number;
  max?: number;
  showPreviewList?: boolean;
  variant?: "default" | "presetModal";
  ctaLabel?: string;
}

interface ApiData<TData> {
  data: TData;
}

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function unwrapUpload(
  payload: UploadImageResponse | ApiData<UploadImageResponse>,
): UploadImageResponse {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as unknown as Record<string, unknown>)
  ) {
    return (payload as ApiData<UploadImageResponse>).data;
  }

  return payload as UploadImageResponse;
}

export function PhotoUploadZone({
  value,
  onChange,
  min = 1,
  max = 1,
  showPreviewList = true,
  variant = "default",
  ctaLabel,
}: PhotoUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const valueRef = useRef<UploadedPhoto[]>(value);

  const doneCount = useMemo(
    () => value.filter((photo) => photo.status === "done").length,
    [value],
  );

  const isModalVariant = variant === "presetModal";

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      revokePhotos(valueRef.current);
    };
  }, []);

  function revokePhotos(photos: UploadedPhoto[]): void {
    for (const photo of photos) {
      URL.revokeObjectURL(photo.previewUrl);
    }
  }

  function updatePhoto(localId: string, next: Partial<UploadedPhoto>): void {
    const nextValue = valueRef.current.map((photo) =>
      photo.localId === localId ? { ...photo, ...next } : photo,
    );
    valueRef.current = nextValue;
    onChange(nextValue);
  }

  async function uploadSingle(file: File, localId: string): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiUpload<
        UploadImageResponse | ApiData<UploadImageResponse>
      >(API_ROUTES.UPLOAD_IMAGE, formData);
      const result = unwrapUpload(response);

      updatePhoto(localId, {
        storageKey: result.storageKey,
        status: "done",
      });
    } catch {
      updatePhoto(localId, { status: "error" });
      toast.error("Не удалось загрузить изображение");
    }
  }

  function removePhoto(localId: string): void {
    const target = valueRef.current.find((photo) => photo.localId === localId);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }

    const nextValue = valueRef.current.filter(
      (photo) => photo.localId !== localId,
    );
    valueRef.current = nextValue;
    onChange(nextValue);
  }

  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) {
      return;
    }

    const validFiles = Array.from(files).filter((file) => {
      if (!ACCEPTED_TYPES.has(file.type)) {
        toast.error("Разрешены только JPEG, PNG или WEBP");
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    const availableSlots = Math.max(max - valueRef.current.length, 0);
    const picked = validFiles.slice(0, availableSlots || max);

    if (picked.length === 0) {
      toast.error(`Можно загрузить максимум ${max} фото`);
      return;
    }

    if (max === 1 && valueRef.current.length > 0) {
      revokePhotos(valueRef.current);
      valueRef.current = [];
      onChange([]);
    }

    const tempItems: UploadedPhoto[] = picked.map((file) => ({
      localId: crypto.randomUUID(),
      storageKey: "",
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
    }));

    const nextValue =
      max === 1 ? tempItems.slice(0, 1) : [...valueRef.current, ...tempItems];

    valueRef.current = nextValue;
    onChange(nextValue);

    await Promise.all(
      picked.map((file, index) => uploadSingle(file, tempItems[index].localId)),
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "w-full transition",
          isModalVariant
            ? "flex h-[52px] items-center justify-center gap-2 rounded-[16px] border border-white/15 bg-white px-4 text-[15px] font-semibold text-background hover:brightness-95"
            : "flex flex-col items-center justify-center gap-2 rounded-[--radius-lg] border border-dashed border-[--color-border] bg-[--color-surface] px-4 py-8 text-center hover:border-white/20",
        )}
      >
        <ImagePlus
          className={cn(
            isModalVariant
              ? "h-5 w-5 text-background"
              : "h-6 w-6 text-[--color-foreground-muted]",
          )}
        />

        {isModalVariant ? (
          <span>{ctaLabel ?? `Добавьте до ${max} фото`}</span>
        ) : (
          <>
            <p className="text-sm text-[--color-foreground-muted]">
              Перетащите фото или нажмите для выбора
            </p>
            <p className="text-xs text-[--color-foreground-muted]">
              Минимум: {min} · Максимум: {max}
            </p>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
        className="hidden"
        multiple={max > 1}
      />

      {showPreviewList ? (
        <>
          <div
            className={cn(
              "grid gap-2",
              isModalVariant
                ? "grid-cols-4 md:grid-cols-6"
                : "grid-cols-2 md:grid-cols-3",
            )}
          >
            {value.map((photo) => (
              <div
                key={photo.localId}
                className={cn(
                  "relative overflow-hidden border bg-black/40",
                  isModalVariant
                    ? "h-[66px] rounded-[12px] border-white/10"
                    : "h-28 rounded-[--radius-md] border-[--color-border] md:h-32",
                )}
              >
                <Image
                  src={photo.previewUrl}
                  alt="Загруженное фото"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes={
                    isModalVariant ? "66px" : "(max-width: 768px) 50vw, 33vw"
                  }
                />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-[10px] text-[--color-foreground]">
                  <span
                    className={cn(
                      photo.status === "done" && "text-[--color-success]",
                      photo.status === "error" && "text-[--color-danger]",
                    )}
                  >
                    {photo.status === "uploading" ? "Загрузка..." : null}
                    {photo.status === "done" ? "Готово" : null}
                    {photo.status === "error" ? "Ошибка" : null}
                  </span>

                  {photo.status === "uploading" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.localId)}
                      className="inline-flex items-center justify-center text-[--color-foreground-muted] transition hover:text-[--color-foreground]"
                      aria-label="Удалить фото"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-[--color-foreground-muted]">
            {isModalVariant
              ? `Загружено: ${doneCount}/${max}`
              : `Загружено: ${doneCount}/${Math.max(min, 1)}`}
          </p>
        </>
      ) : null}
    </div>
  );
}
