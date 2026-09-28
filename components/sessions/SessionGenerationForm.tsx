"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Pencil, Ticket, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  API_ROUTES,
  OrderSourceType,
  type PhotoSessionResponse,
  type UploadImageResponse,
} from "@/lib/api/contract";
import { apiUpload } from "@/lib/api/client";
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
import { cn } from "@/lib/utils";

interface SessionGenerationFormProps {
  session: PhotoSessionResponse;
  inModal?: boolean;
  onClose?: () => void;
}

interface ApiData<T> {
  data: T;
}

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

const SESSION_MODAL_MAX_PHOTOS = 15;

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

function countMissingRequired(
  session: PhotoSessionResponse,
  selected: Record<string, string>,
): number {
  return session.parameterGroups.filter(
    (group) => group.isRequired && !selected[group.id],
  ).length;
}

export function SessionGenerationForm({
  session,
  inModal = false,
  onClose,
}: SessionGenerationFormProps) {
  const router = useRouter();
  const createGeneration = useCreateGeneration();
  const isMobile = useIsMobile();

  const [photo, setPhoto] = useState<UploadedPhoto[]>([]);
  const [activeSlotId, setActiveSlotId] = useState(session.slots[0]?.id ?? "");
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    if (!inModal) {
      return {};
    }

    const defaults: Record<string, string> = {};

    for (const group of session.parameterGroups) {
      if (group.options[0]) {
        defaults[group.id] = group.options[0].id;
      }
    }

    return defaults;
  });

  const aiProfilePhotosQuery = useAiProfilePhotos();

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

  const totalCost = session.tokenCostPerSlot * session.slots.length;

  const readyPhoto = photo.find((item) => item.status === "done") ?? null;

  const activeSlot =
    session.slots.find((slot) => slot.id === activeSlotId) ??
    session.slots[0] ??
    null;

  const missingRequiredTotal = useMemo(
    () => countMissingRequired(session, selectedOptions),
    [session, selectedOptions],
  );

  const aiProfileAssets = useMemo<Array<ModalAiProfileAsset>>(
    () =>
      (aiProfilePhotosQuery.data ?? []).map((item) => ({
        id: `ai:${item.id}`,
        previewUrl: item.imageUrl,
        storageKey: item.storageKey,
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

  const visibleModalAssets = useMemo(
    () => allModalAssets.filter((asset) => !hiddenAssetIds.has(asset.id)),
    [allModalAssets, hiddenAssetIds],
  );

  const effectiveSelectedPhotoIds = useMemo(() => {
    const visibleIds = new Set(visibleModalAssets.map((asset) => asset.id));

    return new Set(
      Array.from(selectedPhotoIds)
        .filter((id) => visibleIds.has(id))
        .slice(0, SESSION_MODAL_MAX_PHOTOS),
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

  const readyPhotoStorageKey = inModal
    ? (selectedModalStorageKeys[0] ?? null)
    : (readyPhoto?.storageKey ?? null);

  const canSubmit =
    !createGeneration.isPending &&
    readyPhotoStorageKey !== null &&
    missingRequiredTotal === 0;

  const slotPreviewUrls = useMemo(
    () =>
      [...session.slots]
        .sort((a, b) => a.order - b.order)
        .map((slot) => slot.previewUrl)
        .filter(
          (url): url is string => typeof url === "string" && url.length > 0,
        ),
    [session.slots],
  );

  const heroSlotUrls = slotPreviewUrls.slice(0, 2);

  const singleGroup =
    inModal && session.parameterGroups.length === 1
      ? session.parameterGroups[0]
      : null;

  const doneSelectedAssets = allModalAssets.filter(
    (asset) =>
      effectiveSelectedPhotoIds.has(asset.id) && asset.status === "done",
  );

  const pickerVisibleCount = visibleModalAssets.length;
  const isPickerEmptyState = pickerVisibleCount === 0;
  const isPickerFullState = pickerVisibleCount >= SESSION_MODAL_MAX_PHOTOS;

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

  function handleOptionSelect(groupId: string, optionId: string): void {
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
      SESSION_MODAL_MAX_PHOTOS - visibleModalAssets.length,
      0,
    );

    const toUpload = imageFiles.slice(0, freeSlots);

    if (toUpload.length === 0) {
      toast.error(`Достигнут лимит в ${SESSION_MODAL_MAX_PHOTOS} фото`);
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
            if (prev.size >= SESSION_MODAL_MAX_PHOTOS) {
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

      if (next.size >= SESSION_MODAL_MAX_PHOTOS) {
        toast.error(`Можно выбрать максимум ${SESSION_MODAL_MAX_PHOTOS} фото`);
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

    if (missingRequiredTotal > 0) {
      toast.error("Заполните обязательные параметры фотосессии");
      return;
    }

    await createGeneration.mutateAsync({
      dto: {
        sourceType: OrderSourceType.PHOTO_SESSION,
        photoSessionId: session.id,
        inputImageUrl: readyPhotoStorageKey,
        selectedOptions: Object.entries(selectedOptions).map(
          ([parameterGroupId, optionId]) => ({
            parameterGroupId,
            optionId,
          }),
        ),
      },
      idempotencyKey: crypto.randomUUID(),
    });

    if (onClose) {
      onClose();
    }

    router.push("/app/gallery");
  }

  if (inModal) {
    const modalSelectedOption =
      singleGroup?.options.find(
        (option) => option.id === selectedOptions[singleGroup.id],
      ) ?? singleGroup?.options[0];

    return (
      <section className="w-full text-white">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
          <div className="relative h-[260px] w-full bg-[--color-background] md:h-[375px]">
            <div className="grid h-full w-full grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => {
                const imageUrl = heroSlotUrls[index] ?? null;

                return (
                  <div
                    key={index}
                    className="relative h-full w-full overflow-hidden"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${session.title} — превью ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 767px) 50vw, 260px"
                      />
                    ) : (
                      <div className="h-full w-full bg-[--color-surface]" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть создание фотосессии"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-3 pb-3 pt-2 md:px-8 md:pb-8 md:pt-6">
            <div className="text-center">
              <span className="inline-flex rounded-full border border-white/15 bg-white/4 px-2 py-[3px] text-[11px] text-white/85">
                {session.slots.length} фото
              </span>
              <h2 className="mt-2 text-[30px] font-semibold leading-[112%] md:text-[38px]">
                {session.title}
              </h2>
            </div>

            <div className="mt-5 space-y-5 md:mt-6 md:space-y-6">
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-[15px] font-medium leading-[112%] text-white/75 md:text-[18px]">
                  1. Выберите фото
                </h3>

                {doneSelectedAssets.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-[52px] w-full justify-center rounded-[16px] border border-white/15 bg-white px-4 text-[15px] font-semibold text-background hover:bg-white! hover:text-background! hover:border-white/15!"
                    onClick={() => setIsPickerOpen(true)}
                  >
                    <ImagePlus className="h-5 w-5 text-background" />
                    Добавьте до {SESSION_MODAL_MAX_PHOTOS} фото
                  </Button>
                ) : (
                  <div className="rounded-[12px] bg-white p-2">
                    <div className="grid grid-cols-6 gap-2">
                      {doneSelectedAssets
                        .slice(0, SESSION_MODAL_MAX_PHOTOS)
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
                  <h3 className="text-[15px] font-medium leading-[112%] text-white/75 md:text-[18px]">
                    2. {singleGroup.question}
                  </h3>

                  {singleGroup.options.length <= 1 ? (
                    <div className="min-h-[52px] rounded-[16px] border border-white/10 bg-white/8 px-4 py-3 text-[15px] leading-[112%] text-white">
                      {modalSelectedOption?.label ?? "Как на фото примере"}
                    </div>
                  ) : (
                    <Select
                      value={selectedOptions[singleGroup.id]}
                      onValueChange={(value) =>
                        handleOptionSelect(singleGroup.id, value)
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
                  <h3 className="text-[15px] font-medium leading-[112%] text-white/75 md:text-[18px]">
                    2. Выберите параметры
                  </h3>
                  <ParameterSelector
                    groups={session.parameterGroups}
                    selectedOptions={selectedOptions}
                    onSelect={handleOptionSelect}
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
                  "Запуск..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Запустить за
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[13px]">
                      <Ticket className="h-3.5 w-3.5 text-[--color-token]" />
                      {totalCost}
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
                "bottom-0 rounded-t-[24px] border-white/10 bg-[#141414] p-0 [transition:height_220ms_ease,max-height_220ms_ease] origin-bottom [&>button:last-child]:hidden",
                isPickerEmptyState
                  ? "h-[264px] max-h-[264px] overflow-hidden"
                  : "min-h-[333px] max-h-[800px] overflow-y-auto",
              )}
            >
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
                      Выберите до {SESSION_MODAL_MAX_PHOTOS} фото
                    </h3>

                    {isPickerEmptyState ? (
                      <p className="text-center text-[15px] text-white/75">
                        У вас нет добавленных фотографий
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {visibleModalAssets.map((asset) => {
                          const isSelected = effectiveSelectedPhotoIds.has(
                            asset.id,
                          );

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

                              {asset.status === "done" ? (
                                <button
                                  type="button"
                                  onClick={() => toggleModalSelection(asset.id)}
                                  className={cn(
                                    "absolute bottom-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[--color-background]",
                                    isSelected &&
                                      "border-[#5bcfff] bg-[#1f93e6]",
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
                    )}

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
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <DialogContent className="max-w-[720px] rounded-[24px] border-white/10 bg-[#141414] p-8 [&>button:last-child]:hidden">
              <div className="relative mx-auto flex w-full flex-col gap-7">
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
                    Выберите до {SESSION_MODAL_MAX_PHOTOS} фото
                  </h3>
                </div>

                {isPickerEmptyState ? (
                  <p className="text-center text-[18px] text-white/75">
                    У вас нет добавленных фотографий
                  </p>
                ) : (
                  <div className="grid grid-cols-5 gap-3">
                    {visibleModalAssets.map((asset) => {
                      const isSelected = effectiveSelectedPhotoIds.has(
                        asset.id,
                      );

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

                          {asset.status === "done" ? (
                            <button
                              type="button"
                              onClick={() => toggleModalSelection(asset.id)}
                              className={cn(
                                "absolute bottom-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[--color-background]",
                                isSelected && "border-[#5bcfff] bg-[#1f93e6]",
                              )}
                              aria-label={
                                isSelected ? "Снять выбор фото" : "Выбрать фото"
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
                )}

                <button
                  type="button"
                  disabled={isPickerFullState}
                  className={cn(
                    "flex h-[60px] w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 text-[18px] font-semibold text-white",
                    isPickerFullState && "cursor-not-allowed opacity-40",
                  )}
                  onClick={() => {
                    if (isPickerFullState) {
                      return;
                    }

                    pickerInputRef.current?.click();
                  }}
                >
                  <ImagePlus className="h-5 w-5" />
                  Загрузить фото
                </button>

                <Button
                  type="button"
                  className="h-[52px] w-[336px] self-center rounded-2xl border-0 bg-[image:var(--gradient-create-cta)] text-[15px] font-semibold text-white"
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
            </DialogContent>
          </Dialog>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4 overflow-hidden rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] md:mb-6">
        <div className="relative h-48 w-full md:h-64">
          {session.previewUrl ? (
            <Image
              src={session.previewUrl}
              alt={session.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 960px"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <h1 className="text-lg font-semibold md:text-2xl">
              {session.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-[--color-token]">
                <Ticket className="h-3.5 w-3.5" />
                {session.tokenCostPerSlot} за слот
              </span>
              <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-xs text-[--color-foreground]">
                Итого: {totalCost}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
        <div className="space-y-2">
          <h2 className="text-base font-semibold">1. Загрузите фото</h2>
          <PhotoUploadZone value={photo} onChange={setPhoto} min={1} max={1} />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold">2. Выберите слот</h2>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {session.slots.map((slot, index) => {
              const selected = slot.id === activeSlot?.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setActiveSlotId(slot.id)}
                  className={cn(
                    "inline-flex min-w-[120px] flex-col items-start gap-1 rounded-[--radius-md] border px-3 py-2 text-left text-xs transition",
                    selected
                      ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                      : "border-[--color-border] bg-[--color-background] text-[--color-foreground-muted] hover:text-[--color-foreground]",
                  )}
                >
                  <span className="font-medium">Слот {index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold">3. Параметры фотосессии</h2>
          <ParameterSelector
            groups={session.parameterGroups}
            selectedOptions={selectedOptions}
            onSelect={handleOptionSelect}
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-[--color-foreground-muted]">
            Стоимость фотосессии: {session.tokenCostPerSlot} ×{" "}
            {session.slots.length} = {totalCost}
          </p>

          <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {createGeneration.isPending ? "Запуск..." : "Запустить фотосессию"}
          </Button>
        </div>
      </div>
    </section>
  );
}
