"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  API_ROUTES,
  MediaEntityType,
  type ApiErrorResponse,
  type ImageVariants,
} from "@/lib/api/contract";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (storageKey: string, publicUrl?: string) => void;
  onClear: () => void;
  accept?: string;
  maxSizeMb?: number;
  entityType: MediaEntityType;
  entityId?: string;
  label?: string;
  aspectRatio?: "1:1" | "16:9" | "4:3";
  previewSize?: "auto" | "184x260" | "compact";
}

interface UploadAdminAssetPayload {
  data?: {
    url?: string;
    mediaAssetId?: string;
    variants?: ImageVariants;
  };
  url?: string;
  mediaAssetId?: string;
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMb = 10,
  entityType,
  entityId,
  label = "Изображение",
  aspectRatio = "16:9",
  previewSize = "auto",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const preview = value;
  const draftEntityIdRef = useRef<string | null>(null);

  const ratioClass = useMemo(() => {
    if (previewSize === "184x260") {
      return "h-[260px] w-[184px]";
    }

    if (previewSize === "compact") {
      return "h-20 w-20";
    }

    if (aspectRatio === "1:1") {
      return "aspect-square";
    }

    if (aspectRatio === "4:3") {
      return "aspect-[4/3]";
    }

    return "aspect-video";
  }, [aspectRatio, previewSize]);

  function validateFile(file: File): boolean {
    const allowed = accept.split(",").map((item) => item.trim());

    if (!allowed.includes(file.type)) {
      toast.error("Неподдерживаемый формат файла");
      return false;
    }

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Размер файла превышает ${maxSizeMb}MB`);
      return false;
    }

    return true;
  }

  async function uploadFile(file: File): Promise<void> {
    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);

    const uploadEntityId =
      entityId ??
      (draftEntityIdRef.current ??=
        `draft-${entityType.toLowerCase()}-${crypto.randomUUID()}`);
    formData.append("entityId", uploadEntityId);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${baseUrl}${API_ROUTES.ADMIN_UPLOAD_ASSET}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Ошибка сети при загрузке"));
      };

      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          try {
            const parsed = JSON.parse(xhr.responseText) as ApiErrorResponse;
            reject(
              new Error(parsed.error.message ?? "Не удалось загрузить файл"),
            );
          } catch {
            reject(new Error("Не удалось загрузить файл"));
          }
          return;
        }

        try {
          const parsed = JSON.parse(
            xhr.responseText,
          ) as UploadAdminAssetPayload;
          const url = parsed.data?.url ?? parsed.url;
          const mediaAssetId = parsed.data?.mediaAssetId ?? parsed.mediaAssetId;

          if (!url || !mediaAssetId) {
            reject(new Error("Некорректный ответ сервера"));
            return;
          }

          onChange(mediaAssetId, url);
          resolve();
        } catch {
          reject(new Error("Не удалось обработать ответ сервера"));
        }
      };

      xhr.send(formData);
    });

    setIsUploading(false);
    setProgress(0);
    toast.success("Изображение загружено");
  }

  async function handleFileSelect(file: File | null): Promise<void> {
    if (!file) {
      return;
    }

    try {
      await uploadFile(file);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Произошла ошибка при загрузке";
      toast.error(message);
      setIsUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) =>
          void handleFileSelect(event.target.files?.[0] ?? null)
        }
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed border-border bg-surface",
          ratioClass,
          isDragging ? "ring-1 ring-primary" : "",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0] ?? null;
          void handleFileSelect(file);
        }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Preview"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-foreground-muted">
            <ImagePlus className="h-6 w-6" />
            <p className="text-xs leading-snug">
              Перетащите файл или выберите вручную
            </p>
          </div>
        )}

        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            <p className="mt-2 text-xs text-foreground">{progress}%</p>
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Загрузить
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClear();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </Button>
        ) : null}
      </div>
    </div>
  );
}
