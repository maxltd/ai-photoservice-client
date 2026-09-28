"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import {
  Check,
  ChevronDown,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Search,
  Ticket,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiUpload } from "@/lib/api/client";
import {
  API_ROUTES,
  GenerationMode,
  type CategoryResponse,
  type GenerationModeCostResponse,
  type PresetListItemResponse,
  type PresetResponse,
  type UploadImageResponse,
} from "@/lib/api/contract";
import { useCreateGenerationMode } from "@/lib/hooks/generations/useCreateGenerationMode";
import { useAiProfilePhotos } from "@/lib/hooks/profile/useProfile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { GenerationForm } from "@/components/create/GenerationForm";

const MAX_MODAL_PHOTOS = 15;

interface UploadedAsset {
  id: string;
  previewUrl: string;
  storageKey: string;
  status: "uploading" | "done" | "error";
}

interface AiProfileAsset {
  id: string;
  previewUrl: string;
  storageKey: string;
  status: "done";
}

interface ModeConfig {
  mode: GenerationMode;
  title: string;
  placeholder: string;
  minImages: number;
  maxImages: number;
  addPhotoLabel: string;
  hidePhotoAction: boolean;
  gradientClass: string;
  icon: ComponentType<{ className?: string }>;
}

interface ApiData<T> {
  data: T;
}

function GalleryBoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="16" height="14" rx="3" fill="currentColor" />
      <circle cx="7" cy="8" r="1.6" fill="#141414" />
      <path
        d="M4.5 15.5L8.2 11.8C8.6 11.4 9.2 11.4 9.6 11.8L12 14.2L13 13.2C13.4 12.8 14 12.8 14.4 13.2L16 14.8V16H4.5V15.5Z"
        fill="#141414"
      />
    </svg>
  );
}

function ImageBoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="16" height="14" rx="3" fill="currentColor" />
      <circle cx="7" cy="8" r="1.6" fill="#141414" />
      <path
        d="M4.5 15.5L8.2 11.8C8.6 11.4 9.2 11.4 9.6 11.8L12 14.2L13 13.2C13.4 12.8 14 12.8 14.4 13.2L16 14.8V16H4.5V15.5Z"
        fill="#141414"
      />
    </svg>
  );
}

function GalleryFavoriteBoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="16" height="14" rx="3" fill="currentColor" />
      <path
        d="M4.5 15.5L8.2 11.8C8.6 11.4 9.2 11.4 9.6 11.8L12 14.2L13 13.2C13.4 12.8 14 12.8 14.4 13.2L16 14.8V16H4.5V15.5Z"
        fill="#141414"
      />
      <path
        d="M14.8 5.1L15.3 6.1L16.4 6.3L15.6 7.1L15.8 8.2L14.8 7.7L13.8 8.2L14 7.1L13.2 6.3L14.3 6.1L14.8 5.1Z"
        fill="#141414"
      />
    </svg>
  );
}

function VideoPlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="16" height="14" rx="3" fill="currentColor" />
      <path d="M8 7.2L13.2 10L8 12.8V7.2Z" fill="#141414" />
    </svg>
  );
}

function VideoSquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="16" height="14" rx="3" fill="currentColor" />
      <rect x="6" y="7" width="8" height="6" rx="1" fill="#141414" />
    </svg>
  );
}

function AddItemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="3" width="7.6" height="14" rx="2" fill="currentColor" />
      <rect
        x="10.4"
        y="6"
        width="7.6"
        height="11"
        rx="2"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M13.8 11.5H16.2"
        stroke="#141414"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M15 10.3V12.7"
        stroke="#141414"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MODE_CONFIGS: ModeConfig[] = [
  {
    mode: GenerationMode.PROMPT_AND_PHOTO,
    title: "Создание по промпту и фото",
    placeholder: "Девушка в горах, на фоне заката",
    minImages: 1,
    maxImages: 10,
    addPhotoLabel: "Добавить фото",
    hidePhotoAction: false,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(71,187,255,0.75)_0%,rgba(71,187,255,0)_100%)] border border-white/15",
    icon: GalleryBoldIcon,
  },
  {
    mode: GenerationMode.PROMPT_TO_PHOTO,
    title: "Создание фото по промпту",
    placeholder: "Девушка в горах, на фоне заката",
    minImages: 0,
    maxImages: 0,
    addPhotoLabel: "Добавить фото",
    hidePhotoAction: true,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(71,187,255,0.75)_0%,rgba(71,187,255,0)_100%)] border border-white/15",
    icon: ImageBoldIcon,
  },
  {
    mode: GenerationMode.MERGE_TWO_PHOTOS,
    title: "Объединить два фото",
    placeholder: "Мужчина с девушкой смотрят друг на друга посреди улицы",
    minImages: 2,
    maxImages: 2,
    addPhotoLabel: "Добавить 2 фото",
    hidePhotoAction: false,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(87,165,255,0.7)_0%,rgba(87,165,255,0)_100%)] border border-white/15",
    icon: GalleryFavoriteBoldIcon,
  },
  {
    mode: GenerationMode.PROMPT_TO_VIDEO,
    title: "Создание видео по промпту",
    placeholder: "Человек идёт по пляжу на фоне заката",
    minImages: 0,
    maxImages: 0,
    addPhotoLabel: "Добавить фото",
    hidePhotoAction: true,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(118,159,255,0.65)_0%,rgba(118,159,255,0)_100%)] border border-white/15",
    icon: VideoPlayIcon,
  },
  {
    mode: GenerationMode.ANIMATE_IMAGE,
    title: "Оживление изображения",
    placeholder: "Человек улыбается и отходит от камеры",
    minImages: 1,
    maxImages: 1,
    addPhotoLabel: "Добавить фото",
    hidePhotoAction: false,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(155,136,255,0.65)_0%,rgba(155,136,255,0)_100%)] border border-white/15",
    icon: VideoSquareIcon,
  },
  {
    mode: GenerationMode.MERGE_THREE_TO_FIVE_PHOTOS,
    title: "Объединить от 3 до 5 фото",
    placeholder: "Семейный портрет масляными красками",
    minImages: 3,
    maxImages: 5,
    addPhotoLabel: "Добавить 3-5 фото",
    hidePhotoAction: false,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(183,127,248,0.6)_0%,rgba(183,127,248,0)_100%)] border border-white/15",
    icon: GalleryFavoriteBoldIcon,
  },
  {
    mode: GenerationMode.BACKGROUND_REPLACE,
    title: "Замена фона",
    placeholder: "Продукт на простыне на фоне гор",
    minImages: 1,
    maxImages: 1,
    addPhotoLabel: "Добавить фото",
    hidePhotoAction: false,
    gradientClass:
      "bg-[radial-gradient(circle_at_100%_0%,rgba(222,112,215,0.6)_0%,rgba(222,112,215,0)_100%)] border border-white/15",
    icon: AddItemIcon,
  },
];

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

export function CreateModeClient() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const createModeMutation = useCreateGenerationMode();
  const aiProfilePhotosQuery = useAiProfilePhotos();

  const [mode, setMode] = useState<GenerationMode>(
    GenerationMode.PROMPT_AND_PHOTO,
  );
  const [prompt, setPrompt] = useState("");
  const [search, setSearch] = useState("");
  const [mediaTab, setMediaTab] = useState<"photo" | "video">("photo");
  const [isModeListOpen, setIsModeListOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetResponse | null>(
    null,
  );
  const [isPresetLoading, setIsPresetLoading] = useState(false);
  const [presetLoadError, setPresetLoadError] = useState<string | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [hiddenAssetIds, setHiddenAssetIds] = useState<Set<string>>(new Set());
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set(),
  );
  const uploadedAssetsRef = useRef<UploadedAsset[]>([]);
  const emptyPickerInputRef = useRef<HTMLInputElement | null>(null);
  const presetRequestIdRef = useRef(0);

  const categoriesQuery = useQuery({
    queryKey: ["create", "categories"],
    queryFn: () =>
      apiGet<ApiData<CategoryResponse[]>>(API_ROUTES.CATEGORIES, {
        pageSize: 100,
      }).then((response) => response.data),
    staleTime: 60_000,
  });

  const presetsQuery = useQuery({
    queryKey: ["create", "presets"],
    queryFn: () =>
      apiGet<ApiData<PresetListItemResponse[]>>(API_ROUTES.PRESETS).then(
        (response) => response.data,
      ),
    staleTime: 60_000,
  });

  const modeCostsQuery = useQuery({
    queryKey: ["create", "mode-costs"],
    queryFn: () =>
      apiGet<ApiData<GenerationModeCostResponse[]>>(
        API_ROUTES.GENERATIONS_MODE_COSTS,
      ).then((response) => response.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const modeCostByMode = useMemo(
    () =>
      new Map<GenerationMode, number>(
        (modeCostsQuery.data ?? []).map((item) => [item.mode, item.tokenCost]),
      ),
    [modeCostsQuery.data],
  );

  const getModeCostLabel = (mode: GenerationMode): string => {
    const tokenCost = modeCostByMode.get(mode);
    return typeof tokenCost === "number" ? String(tokenCost) : "…";
  };

  const config = useMemo(
    () => MODE_CONFIGS.find((item) => item.mode === mode) ?? MODE_CONFIGS[0],
    [mode],
  );

  const aiProfileAssets = useMemo<Array<AiProfileAsset>>(
    () =>
      (aiProfilePhotosQuery.data ?? []).map((photo) => ({
        id: `ai:${photo.id}`,
        previewUrl: photo.imageUrl,
        storageKey: photo.storageKey,
        status: "done" as const,
      })),
    [aiProfilePhotosQuery.data],
  );

  const allAssets = useMemo<Array<UploadedAsset | AiProfileAsset>>(
    () => [...aiProfileAssets, ...uploadedAssets],
    [aiProfileAssets, uploadedAssets],
  );

  const visibleAssets = useMemo<Array<UploadedAsset | AiProfileAsset>>(
    () => allAssets.filter((asset) => !hiddenAssetIds.has(asset.id)),
    [allAssets, hiddenAssetIds],
  );

  const effectiveSelectedPhotoIds = useMemo(() => {
    if (config.maxImages === 0) {
      return new Set<string>();
    }

    const visibleIds = new Set(visibleAssets.map((asset) => asset.id));

    return new Set(
      Array.from(selectedPhotoIds)
        .filter((id) => visibleIds.has(id))
        .slice(0, config.maxImages),
    );
  }, [config.maxImages, selectedPhotoIds, visibleAssets]);

  useEffect(() => {
    uploadedAssetsRef.current = uploadedAssets;
  }, [uploadedAssets]);

  useEffect(() => {
    return () => {
      for (const asset of uploadedAssetsRef.current) {
        URL.revokeObjectURL(asset.previewUrl);
      }
    };
  }, []);

  const selectedStorageKeys = useMemo(() => {
    const byId = new Map(allAssets.map((asset) => [asset.id, asset]));

    return Array.from(effectiveSelectedPhotoIds)
      .map((id) => byId.get(id))
      .filter((asset): asset is UploadedAsset | AiProfileAsset =>
        Boolean(asset),
      )
      .filter((asset) => asset.status === "done" && asset.storageKey.length > 0)
      .map((asset) => asset.storageKey);
  }, [allAssets, effectiveSelectedPhotoIds]);

  const normalizedSearch = search.trim().toLowerCase();
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const presets = useMemo(() => presetsQuery.data ?? [], [presetsQuery.data]);

  const filteredPresets = useMemo(() => {
    const visiblePresets = presets.filter(
      (preset) => preset.isVisible !== false,
    );

    const bySearch = visiblePresets.filter((preset) => {
      if (!normalizedSearch) {
        return true;
      }

      const categoryName =
        categories.find((c) => c.id === preset.categoryId)?.name ?? "";
      const haystack = `${preset.title} ${categoryName}`.toLowerCase();

      return haystack.includes(normalizedSearch);
    });

    if (mediaTab === "video") {
      return bySearch.filter((preset) =>
        preset.title.toLowerCase().includes("видео"),
      );
    }

    return bySearch;
  }, [categories, mediaTab, normalizedSearch, presets]);

  const sections = useMemo(() => {
    const popularSection = {
      key: "popular",
      title: "Популярные шаблоны⚡",
      presets: filteredPresets.filter((preset) => preset.popular),
    };

    const featuredSection = {
      key: "featured",
      title: "Рекомендуем ❤️‍🔥",
      presets: filteredPresets.filter(
        (preset) => preset.featured && !preset.popular,
      ),
    };

    const newestSection = {
      key: "newest",
      title: "Новинки 🆕",
      presets: filteredPresets.filter(
        (preset) => !preset.featured && !preset.popular,
      ),
    };

    const categorySections = categories
      .map((category) => ({
        key: `category-${category.id}`,
        title: category.name,
        presets: filteredPresets.filter(
          (preset) => preset.categoryId === category.id,
        ),
      }))
      .filter((section) => section.presets.length > 0);

    return [
      popularSection,
      featuredSection,
      newestSection,
      ...categorySections,
    ].filter((section) => section.presets.length > 0);
  }, [categories, filteredPresets]);

  const modeGridRows = useMemo(() => {
    const first = MODE_CONFIGS.slice(0, 4);
    const second = MODE_CONFIGS.slice(4);

    return [first, second];
  }, []);

  const canCreate =
    !createModeMutation.isPending &&
    prompt.trim().length > 0 &&
    selectedStorageKeys.length >= config.minImages &&
    selectedStorageKeys.length <= config.maxImages;

  async function uploadFiles(files: FileList | null): Promise<void> {
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

    const freeSlots = Math.max(MAX_MODAL_PHOTOS - visibleAssets.length, 0);
    const toUpload = imageFiles.slice(0, freeSlots);

    if (toUpload.length === 0) {
      toast.error(`Достигнут лимит в ${MAX_MODAL_PHOTOS} фото`);
      return;
    }

    const items: UploadedAsset[] = toUpload.map((file) => ({
      id: `local:${crypto.randomUUID()}`,
      previewUrl: URL.createObjectURL(file),
      storageKey: "",
      status: "uploading",
    }));

    setUploadedAssets((prev) => [...prev, ...items]);

    await Promise.all(
      items.map(async (item, index) => {
        const formData = new FormData();
        formData.append("file", toUpload[index]);

        try {
          const response = await apiUpload<
            UploadImageResponse | ApiData<UploadImageResponse>
          >(API_ROUTES.UPLOAD_IMAGE, formData);

          const data = unwrapUploadResponse(response);

          setUploadedAssets((prev) =>
            prev.map((asset) =>
              asset.id === item.id
                ? { ...asset, status: "done", storageKey: data.storageKey }
                : asset,
            ),
          );

          setSelectedPhotoIds((prev) => {
            if (config.maxImages === 0 || prev.size >= config.maxImages) {
              return prev;
            }

            const next = new Set(prev);
            next.add(item.id);
            return next;
          });
        } catch {
          setUploadedAssets((prev) =>
            prev.map((asset) =>
              asset.id === item.id ? { ...asset, status: "error" } : asset,
            ),
          );
          toast.error("Не удалось загрузить фото");
        }
      }),
    );
  }

  function toggleSelection(id: string): void {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      if (next.size >= config.maxImages) {
        toast.error(`Можно выбрать максимум ${config.maxImages} фото`);
        return prev;
      }

      next.add(id);
      return next;
    });
  }

  function removeAsset(id: string): void {
    setHiddenAssetIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    if (id.startsWith("local:")) {
      setUploadedAssets((prev) => {
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

  async function handleCreate(): Promise<void> {
    if (!prompt.trim()) {
      toast.error("Введите промпт");
      return;
    }

    if (selectedStorageKeys.length < config.minImages) {
      if (config.minImages > 0) {
        toast.error(`Для режима нужно минимум ${config.minImages} фото`);
      }
      return;
    }

    if (selectedStorageKeys.length > config.maxImages) {
      toast.error("Превышен лимит фото для режима");
      return;
    }

    await createModeMutation.mutateAsync({
      dto: {
        mode,
        prompt: prompt.trim(),
        inputImageKeys: selectedStorageKeys,
      },
      idempotencyKey: crypto.randomUUID(),
    });

    router.push("/app/gallery");
  }

  async function openPresetModal(slug: string): Promise<void> {
    const requestId = presetRequestIdRef.current + 1;
    presetRequestIdRef.current = requestId;

    setIsPresetModalOpen(true);
    setIsPresetLoading(true);
    setPresetLoadError(null);
    setSelectedPreset(null);

    try {
      const response = await apiGet<ApiData<PresetResponse>>(
        API_ROUTES.PRESET_BY_SLUG(slug),
      );

      if (presetRequestIdRef.current !== requestId) {
        return;
      }

      setSelectedPreset(response.data);
    } catch {
      if (presetRequestIdRef.current !== requestId) {
        return;
      }

      setPresetLoadError("Не удалось загрузить шаблон");
      toast.error("Не удалось загрузить шаблон");
    } finally {
      if (presetRequestIdRef.current === requestId) {
        setIsPresetLoading(false);
      }
    }
  }

  const doneSelectedAssets = allAssets.filter(
    (asset) =>
      effectiveSelectedPhotoIds.has(asset.id) && asset.status === "done",
  );

  const pickerVisibleCount = visibleAssets.length;
  const isPickerEmptyState = pickerVisibleCount === 0;
  const isPickerFullState = pickerVisibleCount >= MAX_MODAL_PHOTOS;
  const isPickerStateTwo = pickerVisibleCount > 0 && pickerVisibleCount <= 2;
  const isPickerStateThree = pickerVisibleCount > 2;

  const sectionBody = (
    <>
      {presetsQuery.isLoading || categoriesQuery.isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-[--color-foreground-muted]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка шаблонов
        </div>
      ) : null}

      {!presetsQuery.isLoading && sections.length === 0 ? (
        <div className="rounded-[--radius-lg] border border-white/8 bg-[--color-background] p-4 text-sm text-[--color-foreground-muted]">
          По вашему запросу ничего не найдено
        </div>
      ) : null}

      <div className="space-y-6 md:space-y-7">
        {sections.map((section) => (
          <section key={section.key} className="space-y-3">
            <h2 className="text-[15px] font-medium leading-[116%] text-white/75 md:text-[20px] md:font-semibold md:leading-[112%]">
              {section.title}
            </h2>

            <div className="scrollbar-hide flex gap-2 overflow-x-auto overflow-y-hidden touch-pan-y pb-1 md:gap-3">
              {section.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => void openPresetModal(preset.slug)}
                  aria-label={`Открыть шаблон ${preset.title}`}
                  className={cn(
                    "group relative shrink-0 overflow-hidden border border-white/12 text-left",
                    "h-[180px] w-[120px] rounded-[12px] md:h-[306px] md:w-[204px] md:rounded-[12px]",
                  )}
                >
                  {preset.previewUrl ? (
                    <Image
                      src={preset.previewUrl}
                      alt={preset.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 120px, 204px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[--color-background] text-[--color-foreground-muted]">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
                    <Ticket
                      className="h-3 w-3"
                      style={{ color: "var(--color-token)" }}
                    />
                    {preset.tokenCost}
                  </span>

                  <span className="absolute inset-x-2 bottom-2 text-[11px] leading-tight text-white md:inset-x-4 md:bottom-4 md:text-[15px]">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );

  return (
    <section className="w-full overflow-x-hidden pb-24 lg:pb-8">
      <div className="mx-auto w-full max-w-[1556px]">
        <div className="mx-auto w-full max-w-[968px] px-3 pt-5 md:px-4 md:pt-10">
          <div className="space-y-2 md:space-y-3">
            <div className="relative">
              <button
                type="button"
                className={cn(
                  "flex h-11 w-full items-center rounded-2xl px-3 text-[13px] text-foreground md:text-[15px]",
                  config.gradientClass,
                )}
                onClick={() => setIsModeListOpen((prev) => !prev)}
                aria-label="Выбрать режим создания"
                aria-expanded={isModeListOpen}
              >
                <config.icon className="mr-2 h-5 w-5 text-white" />
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-left">{config.title}</span>
                  <span className="inline-flex h-[17px] shrink-0 items-center gap-1 rounded-full bg-black/20 px-1.5 text-[11px] text-white md:h-5 md:px-1.5 md:text-[13px]">
                    <Ticket
                      className="h-3 w-3 text-[color:var(--color-token)]"
                      style={{ color: "var(--color-token)" }}
                    />
                    {getModeCostLabel(config.mode)}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "ml-auto h-5 w-5 transition-transform",
                    isModeListOpen && "rotate-180",
                  )}
                />
              </button>

              {isModeListOpen && !isMobile ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 space-y-2 rounded-2xl border border-white/8 bg-[#141414] p-3 shadow-lg">
                  {modeGridRows.map((row, rowIndex) => (
                    <div
                      key={`row-${rowIndex}`}
                      className={cn(
                        "grid gap-2",
                        rowIndex === 0 ? "grid-cols-4" : "grid-cols-3",
                      )}
                    >
                      {row.map((item) => (
                        <button
                          key={item.mode}
                          type="button"
                          className={cn(
                            "flex h-[67px] flex-col items-start justify-start rounded-2xl border border-white/10 px-3 py-3 text-left",
                            item.gradientClass,
                            mode === item.mode && "border-white/35",
                          )}
                          onClick={() => {
                            setMode(item.mode);
                            setIsModeListOpen(false);
                          }}
                        >
                          <span className="inline-flex items-center gap-2 text-white">
                            <item.icon className="h-5 w-5 text-white" />
                            <span className="inline-flex h-[17px] items-center gap-1 rounded-full bg-black/20 px-1.5 text-[11px] text-white">
                              <Ticket
                                className="h-3 w-3 text-[color:var(--color-token)]"
                                style={{ color: "var(--color-token)" }}
                              />
                              {getModeCostLabel(item.mode)}
                            </span>
                          </span>
                          <span className="mt-2 line-clamp-1 text-[13px] leading-[116%] text-white">
                            {item.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="h-40 rounded-2xl border border-white/8 bg-[#141414] px-[14px] pb-1.5 pt-3 md:px-4 md:pb-2 md:pt-4">
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={config.placeholder}
                maxLength={1000}
                className="h-[92px] resize-none border-0 bg-transparent px-0 text-[15px] text-white/40 shadow-none outline-none placeholder:text-white/40 md:h-[84px] focus:outline-none focus:ring-0 focus-visible:!outline-none focus-visible:!outline-0 focus-visible:!outline-offset-0 focus-visible:ring-0"
                aria-label="Поле промпта"
              />

              <div className="flex items-center justify-between gap-2">
                {!config.hidePhotoAction ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-auto min-w-[142px] whitespace-nowrap rounded-[10px] border-white/10 bg-white/4 px-[10px] text-[13px] font-normal text-white/75 hover:bg-white/8 md:h-[42px] md:min-w-[161px] md:px-3 md:text-[13px]"
                      onClick={() => setIsPickerOpen(true)}
                    >
                      <ImagePlus className="h-4 w-4" />
                      {doneSelectedAssets.length > 0
                        ? "Заменить фото"
                        : config.addPhotoLabel}
                    </Button>

                    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                      {doneSelectedAssets.slice(0, 6).map((asset) => (
                        <div
                          key={asset.id}
                          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10"
                        >
                          <Image
                            src={asset.previewUrl}
                            alt="Выбранное фото"
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="28px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                <Button
                  type="button"
                  className="h-10 w-[117px] rounded-[10px] !border-0 !bg-[image:var(--gradient-create-cta)] px-0 text-[13px] font-bold text-white hover:brightness-110 md:h-[42px] md:w-[134px] md:text-[15px]"
                  disabled={!canCreate}
                  onClick={() => void handleCreate()}
                >
                  {createModeMutation.isPending ? "Создание..." : "Создать"}
                </Button>
              </div>
            </div>

            <p className="text-[13px] leading-[116%] text-white/50">
              <span className="font-normal text-white/75">Важно:</span> на
              фотографиях лицо должно быть хорошо видно. Чем больше качественных
              фотографий вы выберете, тем больше будет сходство
            </p>
          </div>
        </div>

        {isMobile ? (
          <div className="px-3 pt-2">
            <div className="mb-3 flex items-center gap-1">
              <div className="inline-flex h-[37px] rounded-full bg-[--color-background] p-[2px]">
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-[33px] w-[99px] items-center justify-center gap-2 rounded-full px-[18px] text-[15px] font-semibold",
                    mediaTab === "photo"
                      ? "bg-white text-[color:var(--color-background)]"
                      : "text-white/50",
                  )}
                  onClick={() => setMediaTab("photo")}
                >
                  <ImageIcon className="h-4 w-4" /> Фото
                </button>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-[33px] w-[106px] items-center justify-center gap-2 rounded-full px-[18px] text-[15px] font-semibold",
                    mediaTab === "video"
                      ? "bg-white text-[color:var(--color-background)]"
                      : "text-white/50",
                  )}
                  onClick={() => setMediaTab("video")}
                >
                  <Video className="h-4 w-4" /> Видео
                </button>
              </div>

              <div className="relative h-[37px] w-[121px] rounded-full bg-white/8 px-3">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск"
                  className="h-full border-0 bg-transparent px-0 pr-7 text-[15px] font-normal text-white/50 shadow-none placeholder:text-white/50 focus-visible:ring-0"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/50" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 rounded-t-[24px] bg-[--color-surface] px-3 pb-24 pt-5 md:mt-8 md:rounded-t-[32px] md:px-7 md:pb-8 md:pt-5">
          {!isMobile ? (
            <div className="mb-7 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex h-[42px] rounded-full bg-[--color-background] p-1">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-[34px] w-[99px] items-center justify-center gap-2 rounded-full px-[18px] text-[15px] font-semibold",
                      mediaTab === "photo"
                        ? "bg-white text-[color:var(--color-background)]"
                        : "text-white/50",
                    )}
                    onClick={() => setMediaTab("photo")}
                  >
                    <ImageIcon className="h-4 w-4" /> Фото
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-[34px] w-[106px] items-center justify-center gap-2 rounded-full px-[18px] text-[15px] font-semibold",
                      mediaTab === "video"
                        ? "bg-white text-[color:var(--color-background)]"
                        : "text-white/50",
                    )}
                    onClick={() => setMediaTab("video")}
                  >
                    <Video className="h-4 w-4" /> Видео
                  </button>
                </div>

                <div className="relative h-[42px] w-[320px] rounded-full bg-white/8 px-4">
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск"
                    className="h-full border-0 bg-transparent px-0 pr-7 text-[15px] font-normal text-white/50 shadow-none placeholder:text-white/50 focus-visible:ring-0"
                  />
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                </div>
              </div>

              <div className="h-px w-full bg-white/8" />
            </div>
          ) : null}

          {sectionBody}
        </div>
      </div>

      {isMobile ? (
        <Sheet open={isPresetModalOpen} onOpenChange={setIsPresetModalOpen}>
          <SheetContent
            side="bottom"
            className="overflow-hidden rounded-t-[26px] border-white/10 bg-[--color-background] p-0 text-white [&>button:last-child]:hidden"
          >
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(false)}
              aria-label="Закрыть окно шаблона"
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {isPresetLoading ? (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-[--color-foreground-muted]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка
                шаблона
              </div>
            ) : null}

            {!isPresetLoading && presetLoadError ? (
              <div className="rounded-[--radius-lg] border border-white/10 bg-[--color-surface] p-4 text-sm text-[--color-foreground-muted]">
                {presetLoadError}
              </div>
            ) : null}

            {!isPresetLoading && !presetLoadError && selectedPreset ? (
              <GenerationForm preset={selectedPreset} inModal />
            ) : null}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isPresetModalOpen} onOpenChange={setIsPresetModalOpen}>
          <DialogContent className="max-w-[520px] overflow-hidden rounded-[24px] border-white/10 bg-[--color-background] p-0 text-white [&>button:last-child]:hidden">
            <button
              type="button"
              onClick={() => setIsPresetModalOpen(false)}
              aria-label="Закрыть окно шаблона"
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {isPresetLoading ? (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-[--color-foreground-muted]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка
                шаблона
              </div>
            ) : null}

            {!isPresetLoading && presetLoadError ? (
              <div className="rounded-[--radius-lg] border border-white/10 bg-[--color-surface] p-4 text-sm text-[--color-foreground-muted]">
                {presetLoadError}
              </div>
            ) : null}

            {!isPresetLoading && !presetLoadError && selectedPreset ? (
              <GenerationForm preset={selectedPreset} inModal />
            ) : null}
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Sheet open={isModeListOpen} onOpenChange={setIsModeListOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-[24px] border-white/10 bg-[#141414] px-3 pb-3 pt-5 text-white"
          >
            <div className="space-y-2">
              {MODE_CONFIGS.map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  className={cn(
                    "flex h-11 w-full items-center rounded-2xl px-3",
                    item.gradientClass,
                  )}
                  onClick={() => {
                    setMode(item.mode);
                    setIsModeListOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-5 w-5 text-white" />
                  <span className="flex-1 text-left text-[13px] leading-[116%]">
                    {item.title}
                  </span>
                  <span className="inline-flex h-[17px] items-center gap-1 rounded-full bg-black/20 px-1.5 text-[11px] text-white">
                    <Ticket
                      className="h-3 w-3 text-[color:var(--color-token)]"
                      style={{ color: "var(--color-token)" }}
                    />
                    {getModeCostLabel(item.mode)}
                  </span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      ) : null}

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
                        Выберите до {MAX_MODAL_PHOTOS} фото
                      </h3>
                      <p className="mt-3 text-[15px] font-medium leading-[112%] text-white/75">
                        У вас нет добавленных фотографий
                      </p>
                    </div>

                    <button
                      type="button"
                      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 text-[15px] font-semibold text-white"
                      onClick={() => emptyPickerInputRef.current?.click()}
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
                  ref={emptyPickerInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void uploadFiles(event.target.files);
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
                      Выберите до {MAX_MODAL_PHOTOS} фото
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                      {visibleAssets.map((asset) => {
                        const isSelected = effectiveSelectedPhotoIds.has(
                          asset.id,
                        );
                        const disabledSelect =
                          !isSelected &&
                          asset.status === "done" &&
                          effectiveSelectedPhotoIds.size >= config.maxImages;

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
                              onClick={() => removeAsset(asset.id)}
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
                                onClick={() => toggleSelection(asset.id)}
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
                        emptyPickerInputRef.current?.click();
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
                  ref={emptyPickerInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void uploadFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <DialogContent
            className={cn(
              "rounded-[24px] border-white/10 bg-[#141414] [&>button:last-child]:hidden",
              isPickerEmptyState
                ? "max-w-[720px] border-white/10 bg-[#141414] p-8"
                : "max-w-[720px] border-white/10 bg-[#141414] p-8",
            )}
          >
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
                    Выберите до {MAX_MODAL_PHOTOS} фото
                  </h3>
                  <p className="mt-3 text-[18px] font-normal leading-[112%] text-white/75">
                    У вас нет добавленных фотографий
                  </p>
                </div>

                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void uploadFiles(event.dataTransfer.files);
                  }}
                  className="flex h-[160px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/8"
                >
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 text-[18px] font-semibold text-white"
                    onClick={() => emptyPickerInputRef.current?.click()}
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
                  ref={emptyPickerInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void uploadFiles(event.target.files);
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
                    Выберите до {MAX_MODAL_PHOTOS} фото
                  </h3>
                  <p className="mt-3 text-[18px] font-normal leading-[112%] text-white/75">
                    У вас нет добавленных фотографий
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="grid grid-cols-5 gap-3">
                    {visibleAssets.map((asset) => {
                      const isSelected = effectiveSelectedPhotoIds.has(
                        asset.id,
                      );
                      const disabledSelect =
                        !isSelected &&
                        asset.status === "done" &&
                        effectiveSelectedPhotoIds.size >= config.maxImages;

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
                            onClick={() => removeAsset(asset.id)}
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
                              onClick={() => toggleSelection(asset.id)}
                              disabled={disabledSelect}
                              className={cn(
                                "absolute bottom-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[--color-background]",
                                isSelected && "border-[#5bcfff] bg-[#1f93e6]",
                                disabledSelect &&
                                  "cursor-not-allowed opacity-70",
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
                      void uploadFiles(event.dataTransfer.files);
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
                        emptyPickerInputRef.current?.click();
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
                  ref={emptyPickerInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void uploadFiles(event.target.files);
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
