"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  API_ROUTES,
  OrderSourceType,
  type PresetResponse,
  type UploadImageResponse,
} from "@/lib/api/contract";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParameterSelector } from "@/components/create/ParameterSelector";
import {
  PhotoUploadZone,
  type UploadedPhoto,
} from "@/components/create/PhotoUploadZone";
import { useCreateGeneration } from "@/lib/hooks/generations/useCreateGeneration";
import { useAiProfilePhotos } from "@/lib/hooks/profile/useProfile";
import { apiUpload } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface GenerationFormProps {
  preset: PresetResponse;
  inModal?: boolean;
}

const PRESET_MODAL_MAX_SELECTED_PHOTOS = 10;
const PRESET_MODAL_MAX_PHOTO_POOL = 10;

interface ModalUploadedAsset {
  id: string;
  previewUrl: string;
  storageKey: string;
  status: "uploading" | "done" | "error";
}

interface ModalAiProfileAsset {
  id: string;
  previewUrl: string;
  storageKey: string;
  status: "done";
}

interface ApiData<T> {
  data: T;
}

function unwrapUploadResponse(
  payload: UploadImageResponse | ApiData<UploadImageResponse>,
): UploadImageResponse {
  if ("data" in payload) {
    return payload.data;
  }

  return payload;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 1023px)");

    const update = (): void => {
      setIsMobile(media.matches);
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

export function GenerationForm({
  preset,
  inModal = false,
}: GenerationFormProps) {
  const router = useRouter();
  const createGeneration = useCreateGeneration();

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const defaults: Record<string, string> = {};

    for (const group of preset.parameterGroups) {
      if (!group.options[0]) {
        continue;
      }

      if (inModal) {
        defaults[group.id] = group.options[0].id;
        continue;
      }

      if (group.isRequired && group.options.length === 1) {
        defaults[group.id] = group.options[0].id;
      }
    }

    return defaults;
  });
  const aiProfilePhotosQuery = useAiProfilePhotos();
  const isMobile = useIsMobile();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [modalUploadedAssets, setModalUploadedAssets] = useState<
    ModalUploadedAsset[]
  >([]);
  const [hiddenAssetIds, setHiddenAssetIds] = useState<Set<string>>(new Set());
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set(),
  );
  const uploadedAssetsRef = useRef<ModalUploadedAsset[]>([]);
  const pickerInputRef = useRef<HTMLInputElement | null>(null);

  const requiredGroups = useMemo(
    () => preset.parameterGroups.filter((group) => group.isRequired),
    [preset.parameterGroups],
  );

  const missingRequired = useMemo(
    () => requiredGroups.filter((group) => !selectedOptions[group.id]).length,
    [requiredGroups, selectedOptions],
  );

  const aiProfileAssets = useMemo<Array<ModalAiProfileAsset>>(
    () =>
      (aiProfilePhotosQuery.data ?? []).map((photo) => ({
        id: `ai:${photo.id}`,
        previewUrl: photo.imageUrl,
        storageKey: photo.storageKey,
        status: "done" as const,
      })),
    [aiProfilePhotosQuery.data],
  );

  const allModalAssets = useMemo<
    Array<ModalUploadedAsset | ModalAiProfileAsset>
  >(
    () => [...aiProfileAssets, ...modalUploadedAssets],
    [aiProfileAssets, modalUploadedAssets],
  );

  const visibleModalAssets = useMemo<
    Array<ModalUploadedAsset | ModalAiProfileAsset>
  >(
    () => allModalAssets.filter((asset) => !hiddenAssetIds.has(asset.id)),
    [allModalAssets, hiddenAssetIds],
  );

  const effectiveSelectedPhotoIds = useMemo(() => {
    const visibleIds = new Set(visibleModalAssets.map((asset) => asset.id));

    return new Set(
      Array.from(selectedPhotoIds)
        .filter((id) => visibleIds.has(id))
        .slice(0, PRESET_MODAL_MAX_SELECTED_PHOTOS),
    );
  }, [selectedPhotoIds, visibleModalAssets]);

  const selectedModalStorageKeys = useMemo(() => {
    const byId = new Map(allModalAssets.map((asset) => [asset.id, asset]));

    return Array.from(effectiveSelectedPhotoIds)
      .map((id) => byId.get(id))
      .filter((asset): asset is ModalUploadedAsset | ModalAiProfileAsset =>
        Boolean(asset),
      )
      .filter((asset) => asset.status === "done" && asset.storageKey.length > 0)
      .map((asset) => asset.storageKey);
  }, [allModalAssets, effectiveSelectedPhotoIds]);

  useEffect(() => {
    uploadedAssetsRef.current = modalUploadedAssets;
  }, [modalUploadedAssets]);

  useEffect(() => {
    return () => {
      for (const asset of uploadedAssetsRef.current) {
        URL.revokeObjectURL(asset.previewUrl);
      }
    };
  }, []);

  const readyPhotoStorageKey = inModal
    ? (selectedModalStorageKeys[0] ?? null)
    : (photos.find((photo) => photo.status === "done" && photo.storageKey)
        ?.storageKey ?? null);

  const aiProfileCount = aiProfilePhotosQuery.data?.length ?? 0;

  const canSubmit =
    !createGeneration.isPending &&
    readyPhotoStorageKey !== null &&
    missingRequired === 0;

  const singleGroup =
    inModal && preset.parameterGroups.length === 1
      ? preset.parameterGroups[0]
      : null;

  function handleSelect(groupId: string, optionId: string): void {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  }

  async function uploadModalFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) {
      return;
    }

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length === 0) {
      toast.error("Можно загружать только изображения");
      return;
    }

    const freeSlots = Math.max(
      PRESET_MODAL_MAX_PHOTO_POOL - visibleModalAssets.length,
      0,
    );
    const toUpload = imageFiles.slice(0, freeSlots);

    if (toUpload.length === 0) {
      toast.error(`Достигнут лимит в ${PRESET_MODAL_MAX_PHOTO_POOL} фото`);
      return;
    }

    const items: ModalUploadedAsset[] = toUpload.map(() => ({
      id: `local:${crypto.randomUUID()}`,
      previewUrl: "",
      storageKey: "",
      status: "uploading",
    }));

    const itemsWithPreview = items.map((item, index) => ({
      ...item,
      previewUrl: URL.createObjectURL(toUpload[index]),
    }));

    setModalUploadedAssets((prev) => [...prev, ...itemsWithPreview]);

    await Promise.all(
      itemsWithPreview.map(async (item, index) => {
        const formData = new FormData();
        formData.append("file", toUpload[index]);

        try {
          const response = await apiUpload<
            UploadImageResponse | ApiData<UploadImageResponse>
          >(API_ROUTES.UPLOAD_IMAGE, formData);

          const data = unwrapUploadResponse(response);

          setModalUploadedAssets((prev) =>
            prev.map((asset) =>
              asset.id === item.id
                ? { ...asset, status: "done", storageKey: data.storageKey }
                : asset,
            ),
          );

          setSelectedPhotoIds((prev) => {
            if (prev.size >= PRESET_MODAL_MAX_SELECTED_PHOTOS) {
              return prev;
            }

            const next = new Set(prev);
            next.add(item.id);
            return next;
          });
        } catch {
          setModalUploadedAssets((prev) =>
            prev.map((asset) =>
              asset.id === item.id ? { ...asset, status: "error" } : asset,
            ),
          );
          toast.error("Не удалось загрузить фото");
        }
      }),
    );
  }

  function toggleModalSelection(id: string): void {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      if (next.size >= PRESET_MODAL_MAX_SELECTED_PHOTOS) {
        toast.error(
          `Можно выбрать максимум ${PRESET_MODAL_MAX_SELECTED_PHOTOS} фото`,
        );
        return prev;
      }

      next.add(id);
      return next;
    });
  }

  function removeModalAsset(id: string): void {
    setHiddenAssetIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    if (id.startsWith("local:")) {
      setModalUploadedAssets((prev) => {
        const target = prev.find((asset) => asset.id === id);
        if (target) {
          URL.revokeObjectURL(target.previewUrl);
        }

        return prev.filter((asset) => asset.id !== id);
      });
    }

    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleSubmit(): Promise<void> {
    if (!readyPhotoStorageKey) {
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
        presetId: preset.id,
        inputImageUrl: readyPhotoStorageKey,
        selectedOptions: Object.entries(selectedOptions).map(
          ([parameterGroupId, optionId]) => ({ parameterGroupId, optionId }),
        ),
      },
      idempotencyKey: crypto.randomUUID(),
    });

    router.push("/app/gallery");
  }

  if (inModal) {
    const modalSelectedOption =
      singleGroup?.options.find(
        (option) => option.id === selectedOptions[singleGroup.id],
      ) ?? singleGroup?.options[0];

    const doneSelectedAssets = allModalAssets.filter(
      (asset) =>
        effectiveSelectedPhotoIds.has(asset.id) && asset.status === "done",
    );

    const pickerVisibleCount = visibleModalAssets.length;
    const isPickerEmptyState = pickerVisibleCount === 0;
    const isPickerFullState = pickerVisibleCount >= PRESET_MODAL_MAX_PHOTO_POOL;
    const isPickerStateTwo = pickerVisibleCount > 0 && pickerVisibleCount <= 2;
    const isPickerStateThree = pickerVisibleCount > 2;

    return (
      <section className="w-full text-white">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[--color-background]">
          <div className="relative h-[260px] w-full bg-[--color-background] md:h-[375px]">
            {preset.previewUrl ? (
              <Image
                src={preset.previewUrl}
                alt={preset.title}
                fill
                unoptimized
                className="object-contain"
                sizes="(max-width: 767px) 100vw, 520px"
              />
            ) : (
              <div className="h-full w-full bg-[--color-surface]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[--color-background] via-black/25 to-transparent" />
          </div>

          <div className="px-3 pb-3 pt-5 md:px-8 md:pb-8 md:pt-7">
            <h1 className="text-center text-[18px] font-semibold leading-[112%] md:text-[24px]">
              {preset.title}
            </h1>

            <div className="mt-6 space-y-6 md:mt-7 md:space-y-7">
              <div className="space-y-2 md:space-y-3">
                <h2 className="text-[15px] font-medium leading-[112%] text-white/75 md:text-[18px]">
                  1. Выберите фото
                </h2>

                {doneSelectedAssets.length === 0 ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-[52px] w-full justify-center rounded-[16px] border border-white/15 bg-white px-4 text-[15px] font-semibold text-background hover:bg-white! hover:text-background! hover:border-white/15!"
                      onClick={() => setIsPickerOpen(true)}
                    >
                      <ImagePlus className="h-5 w-5 text-background" />
                      Добавьте до {PRESET_MODAL_MAX_SELECTED_PHOTOS} фото
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-[12px] bg-white p-2">
                    <div className="grid grid-cols-6 gap-2">
                      {doneSelectedAssets
                        .slice(0, PRESET_MODAL_MAX_SELECTED_PHOTOS)
                        .map((asset) => (
                          <div
                            key={asset.id}
                            className="relative h-11 w-11 overflow-hidden rounded-[8px] md:h-[66px] md:w-[66px]"
                          >
                            <Image
                              src={asset.previewUrl}
                              alt="Выбранное фото"
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 767px) 44px, 66px"
                            />
                          </div>
                        ))}

                      <button
                        type="button"
                        onClick={() => setIsPickerOpen(true)}
                        aria-label="Изменить выбранные фото"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-black/30 bg-[#f2f2f2] text-black md:h-[66px] md:w-[66px]"
                      >
                        <Pencil className="h-4 w-4 stroke-2 text-black md:h-5 md:w-5" />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[13px] leading-[116%] text-white/50">
                  <span className="text-white/75">Важно:</span> на фотографиях
                  лицо должно быть хорошо видно. Чем больше качественных
                  фотографий вы выберете, тем больше будет сходство
                </p>
              </div>

              {singleGroup ? (
                <div className="space-y-2 md:space-y-3">
                  <h2 className="text-[15px] font-medium leading-[112%] text-white/75 md:text-[18px]">
                    2. {singleGroup.question}
                  </h2>

                  {singleGroup.options.length <= 1 ? (
                    <div className="min-h-[104px] rounded-[16px] border border-white/10 bg-white/8 px-4 py-3 text-[15px] leading-[112%] text-white">
                      {modalSelectedOption?.label ?? "Как на фото примере"}
                    </div>
                  ) : (
                    <Select
                      value={selectedOptions[singleGroup.id]}
                      onValueChange={(value) =>
                        handleSelect(singleGroup.id, value)
                      }
                    >
                      <SelectTrigger className="h-[52px] rounded-[16px] border-white/10 bg-[--color-surface] text-[15px] text-white data-[placeholder]:text-white/75 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:outline-0 focus-visible:outline-offset-0">
                        <SelectValue placeholder="Как на фото примере" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={8}
                        className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] border border-white/12 !bg-surface text-white shadow-lg"
                      >
                        {singleGroup.options.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-[15px] font-medium leading-[112%] text-white/75 md:text-[18px]">
                    2. Выберите параметры
                  </h2>
                  <ParameterSelector
                    groups={preset.parameterGroups}
                    selectedOptions={selectedOptions}
                    onSelect={handleSelect}
                  />
                </div>
              )}

              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
                className="h-[52px] w-full rounded-[16px] !border-0 bg-[image:var(--gradient-create-cta)] text-[15px] font-semibold text-white hover:brightness-110 disabled:opacity-40"
              >
                {createGeneration.isPending ? (
                  "Создание..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Создать за
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[13px]">
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden
                        className="h-3.5 w-3.5 text-token"
                      >
                        <path
                          fill="currentColor"
                          d="M3 6.25C3 5.56 3.56 5 4.25 5h11.5C16.44 5 17 5.56 17 6.25v2.1a1.15 1.15 0 0 0 0 2.3v2.1c0 .69-.56 1.25-1.25 1.25H4.25C3.56 14 3 13.44 3 12.75v-2.1a1.15 1.15 0 1 0 0-2.3v-2.1Z"
                        />
                      </svg>
                      {preset.tokenCost}
                    </span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {isMobile ? (
          <Sheet open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <SheetContent
              side="bottom"
              className={cn(
                "bottom-0 rounded-t-[24px] border-white/10 bg-[#141414] p-4 [transition:height_220ms_ease,max-height_220ms_ease] origin-bottom [&>button:last-child]:hidden",
                isPickerEmptyState &&
                  "h-[264px] max-h-[264px] overflow-hidden rounded-t-[24px] border-white/10 p-0",
                isPickerStateTwo &&
                  "h-[333px] max-h-[333px] overflow-hidden rounded-t-[24px] border-white/10 p-0",
                isPickerStateThree &&
                  "min-h-[333px] max-h-[800px] overflow-y-auto rounded-t-[24px] border-white/10 p-0",
              )}
            >
              {isPickerEmptyState ? (
                <div className="relative h-full w-full">
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    aria-label="Закрыть выбор фото"
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/12 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="px-3 pb-3 pt-[18px]">
                    <div className="mx-auto flex w-[336px] flex-col items-center gap-6">
                      <div className="w-full text-center">
                        <h3 className="text-[18px] font-semibold leading-[112%] text-white">
                          Выберите до {PRESET_MODAL_MAX_PHOTO_POOL} фото
                        </h3>
                        <p className="mt-3 text-[15px] font-medium leading-[112%] text-white/75">
                          У вас нет добавленных фотографий
                        </p>
                      </div>

                      <button
                        type="button"
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 text-[15px] font-semibold text-white"
                        onClick={() => pickerInputRef.current?.click()}
                        aria-label="Загрузить фото"
                      >
                        <ImagePlus className="h-5 w-5" />
                        Загрузить фото
                      </button>

                      <Button
                        type="button"
                        disabled
                        className="h-[52px] w-full rounded-2xl border-0 bg-[image:var(--gradient-create-cta)] text-[15px] font-semibold text-white opacity-40"
                        onClick={() => setIsPickerOpen(false)}
                      >
                        Выбрать
                      </Button>
                    </div>
                  </div>

                  <input
                    ref={pickerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      void uploadModalFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    aria-label="Закрыть выбор фото"
                    className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/12 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="px-3 pb-3 pt-[18px]">
                    <div className="mx-auto flex w-[336px] flex-col gap-6">
                      <h3 className="text-center text-[18px] font-semibold leading-[112%] text-white">
                        Выберите до {PRESET_MODAL_MAX_PHOTO_POOL} фото
                      </h3>

                      <div className="grid grid-cols-3 gap-2">
                        {visibleModalAssets.map((asset) => {
                          const isSelected = effectiveSelectedPhotoIds.has(
                            asset.id,
                          );
                          const disabledSelect =
                            !isSelected &&
                            asset.status === "done" &&
                            effectiveSelectedPhotoIds.size >=
                              PRESET_MODAL_MAX_SELECTED_PHOTOS;

                          return (
                            <div
                              key={asset.id}
                              className="relative h-[107px] w-[107px] overflow-hidden rounded-[12px] border border-white/10 bg-[--color-background]"
                            >
                              <Image
                                src={asset.previewUrl}
                                alt="Загруженное фото"
                                fill
                                unoptimized
                                className={cn(
                                  "object-cover",
                                  asset.status === "uploading" && "opacity-50",
                                  asset.status === "error" && "opacity-40",
                                )}
                                sizes="107px"
                              />

                              <button
                                type="button"
                                onClick={() => removeModalAsset(asset.id)}
                                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white"
                                aria-label="Удалить фото"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              {asset.status === "uploading" ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : null}

                              {asset.status === "error" ? (
                                <div className="absolute inset-x-0 bottom-0 bg-black/75 px-1 py-0.5 text-center text-[10px] text-[--color-danger]">
                                  Ошибка
                                </div>
                              ) : null}

                              {asset.status === "done" ? (
                                <button
                                  type="button"
                                  onClick={() => toggleModalSelection(asset.id)}
                                  disabled={disabledSelect}
                                  className={cn(
                                    "absolute bottom-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[--color-background]",
                                    isSelected &&
                                      "border-[#5bcfff] bg-[#1f93e6]",
                                    disabledSelect &&
                                      "cursor-not-allowed opacity-70",
                                  )}
                                  aria-label={
                                    isSelected
                                      ? "Снять выбор фото"
                                      : "Выбрать фото"
                                  }
                                >
                                  {isSelected ? (
                                    <Check className="h-3 w-3" />
                                  ) : null}
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={isPickerFullState}
                        className={cn(
                          "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 text-[15px] font-semibold text-white",
                          isPickerFullState && "cursor-not-allowed opacity-40",
                        )}
                        onClick={() => {
                          if (isPickerFullState) {
                            return;
                          }
                          pickerInputRef.current?.click();
                        }}
                        aria-label="Загрузить фото"
                      >
                        <ImagePlus className="h-5 w-5" />
                        Загрузить фото
                      </button>

                      <Button
                        type="button"
                        className="h-[52px] w-full rounded-2xl border-0 bg-[image:var(--gradient-create-cta)] text-[15px] font-semibold text-white"
                        onClick={() => setIsPickerOpen(false)}
                      >
                        {isPickerFullState
                          ? `Выбрать (${effectiveSelectedPhotoIds.size} фото)`
                          : "Выбрать"}
                      </Button>
                    </div>
                  </div>

                  <input
                    ref={pickerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      void uploadModalFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              )}
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <DialogContent className="max-w-[720px] rounded-[24px] border-white/10 bg-[#141414] p-8 [&>button:last-child]:hidden">
              {isPickerEmptyState ? (
                <div className="relative mx-auto flex w-full flex-col items-center gap-7">
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    aria-label="Закрыть выбор фото"
                    className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/12 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="w-full text-center">
                    <h3 className="text-[24px] font-semibold leading-[112%] text-white">
                      Выберите до {PRESET_MODAL_MAX_PHOTO_POOL} фото
                    </h3>
                    <p className="mt-3 text-[18px] font-normal leading-[112%] text-white/75">
                      У вас нет добавленных фотографий
                    </p>
                  </div>

                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      void uploadModalFiles(event.dataTransfer.files);
                    }}
                    className="flex h-[160px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/8"
                  >
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 text-[18px] font-semibold text-white"
                      onClick={() => pickerInputRef.current?.click()}
                      aria-label="Загрузить фото"
                    >
                      <ImagePlus className="h-5 w-5" />
                      Загрузить фото
                    </button>
                    <p className="text-[15px] font-normal text-white/50">
                      перетащите элемент в выделенню область
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled
                    className="h-[52px] w-[336px] rounded-2xl border-0 bg-[image:var(--gradient-create-cta)] text-[15px] font-semibold text-white opacity-40"
                    onClick={() => setIsPickerOpen(false)}
                  >
                    Выбрать
                  </Button>

                  <input
                    ref={pickerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      void uploadModalFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              ) : (
                <div className="relative mx-auto flex w-full flex-col items-center gap-7">
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(false)}
                    aria-label="Закрыть выбор фото"
                    className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/12 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="w-full text-center">
                    <h3 className="text-[24px] font-semibold leading-[112%] text-white">
                      Выберите до {PRESET_MODAL_MAX_PHOTO_POOL} фото
                    </h3>
                    <p className="mt-3 text-[18px] font-normal leading-[112%] text-white/75">
                      У вас нет добавленных фотографий
                    </p>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="grid grid-cols-5 gap-3">
                      {visibleModalAssets.map((asset) => {
                        const isSelected = effectiveSelectedPhotoIds.has(
                          asset.id,
                        );
                        const disabledSelect =
                          !isSelected &&
                          asset.status === "done" &&
                          effectiveSelectedPhotoIds.size >=
                            PRESET_MODAL_MAX_SELECTED_PHOTOS;

                        return (
                          <div
                            key={asset.id}
                            className="relative h-[122px] w-[122px] overflow-hidden rounded-xl border border-white/10 bg-[--color-background]"
                          >
                            <Image
                              src={asset.previewUrl}
                              alt="Загруженное фото"
                              fill
                              unoptimized
                              className={cn(
                                "object-cover",
                                asset.status === "uploading" && "opacity-50",
                                asset.status === "error" && "opacity-40",
                              )}
                              sizes="122px"
                            />

                            <button
                              type="button"
                              onClick={() => removeModalAsset(asset.id)}
                              className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white"
                              aria-label="Удалить фото"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>

                            {asset.status === "uploading" ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : null}

                            {asset.status === "error" ? (
                              <div className="absolute inset-x-0 bottom-0 bg-black/75 px-1 py-0.5 text-center text-[10px] text-[--color-danger]">
                                Ошибка
                              </div>
                            ) : null}

                            {asset.status === "done" ? (
                              <button
                                type="button"
                                onClick={() => toggleModalSelection(asset.id)}
                                disabled={disabledSelect}
                                className={cn(
                                  "absolute bottom-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[--color-background]",
                                  isSelected && "border-[#5bcfff] bg-[#1f93e6]",
                                  disabledSelect &&
                                    "cursor-not-allowed opacity-70",
                                )}
                                aria-label={
                                  isSelected
                                    ? "Снять выбор фото"
                                    : "Выбрать фото"
                                }
                              >
                                {isSelected ? (
                                  <Check className="h-3 w-3" />
                                ) : null}
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      onDragOver={(event) => {
                        if (!isPickerFullState) {
                          event.preventDefault();
                        }
                      }}
                      onDrop={(event) => {
                        if (isPickerFullState) {
                          return;
                        }
                        event.preventDefault();
                        void uploadModalFiles(event.dataTransfer.files);
                      }}
                      className={cn(
                        "flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4",
                        isPickerFullState && "opacity-40",
                      )}
                    >
                      <button
                        type="button"
                        disabled={isPickerFullState}
                        className={cn(
                          "inline-flex items-center gap-2 text-[18px] font-semibold text-white",
                          isPickerFullState && "cursor-not-allowed",
                        )}
                        onClick={() => {
                          if (isPickerFullState) {
                            return;
                          }
                          pickerInputRef.current?.click();
                        }}
                        aria-label="Загрузить фото"
                      >
                        <ImagePlus className="h-5 w-5" />
                        Загрузить фото
                      </button>
                      <span className="text-[15px] text-white/50">
                        перетащите элемент в выделенню область
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="h-[52px] w-[336px] rounded-2xl border-0 bg-[image:var(--gradient-create-cta)] text-[15px] font-semibold text-white"
                    onClick={() => setIsPickerOpen(false)}
                  >
                    {isPickerFullState
                      ? `Выбрать (${effectiveSelectedPhotoIds.size} фото)`
                      : "Выбрать"}
                  </Button>

                  <input
                    ref={pickerInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      void uploadModalFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 overflow-hidden rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] md:mb-6">
        <div className="relative h-44 w-full md:h-56">
          {preset.previewUrl ? (
            <Image
              src={preset.previewUrl}
              alt={preset.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 960px"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <h1 className="text-lg font-semibold md:text-2xl">
              {preset.title}
            </h1>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-[--color-token]">
              <Ticket className="h-3.5 w-3.5" />
              {preset.tokenCost}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
        <div className="space-y-2">
          <h2 className="text-base font-semibold">1. Загрузите фото</h2>
          <PhotoUploadZone
            value={photos}
            onChange={setPhotos}
            min={1}
            max={1}
          />

          {aiProfileCount > 0 ? (
            <p className="text-xs text-[--color-foreground-muted]">
              В AI-профиле уже сохранено {aiProfileCount} фото. Для лучших
              результатов поддерживайте 10+ фото в{" "}
              <Link
                href="/app/profile#ai"
                className="text-[--color-primary] underline-offset-2 hover:underline"
              >
                разделе профиля
              </Link>
              .
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold">2. Выберите параметры</h2>
          <ParameterSelector
            groups={preset.parameterGroups}
            selectedOptions={selectedOptions}
            onSelect={handleSelect}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-[--color-foreground-muted]">
            После запуска вы перейдёте в «Мои работы».
          </p>

          <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {createGeneration.isPending ? "Запуск..." : "Создать генерацию"}
          </Button>
        </div>
      </div>
    </section>
  );
}
