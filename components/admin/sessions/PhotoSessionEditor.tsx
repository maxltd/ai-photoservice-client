"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import {
  ApiError,
  API_ROUTES,
  MediaEntityType,
  PhotoSessionAudience,
  type CategoryResponse,
  type CreateSlotRequest,
  type PhotoSessionResponse,
  type UpdatePhotoSessionRequest,
} from "@/lib/api/contract";
import { apiPatch } from "@/lib/api/client";
import { useAutoSave, type SaveStatus } from "@/lib/hooks/useAutoSave";
import { queryKeys } from "@/lib/query/keys";
import {
  createEmptyGroup,
  hasEmptyGroups,
  serializeParameterGroups,
  type LocalParameterGroup,
} from "@/lib/parameter-groups";
import { SaveStatusIndicator } from "@/components/admin/common/SaveStatusIndicator";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { ParameterGroupsEditor } from "@/components/admin/common/ParameterGroupsEditor";
import { PromptPreview } from "@/components/admin/common/PromptPreview";
import { SeoFields } from "@/components/admin/common/SeoFields";
import { PhotoSessionPreviewCard } from "@/components/admin/sessions/PhotoSessionPreviewCard";
import {
  SlotsEditor,
  type LocalSlot,
} from "@/components/admin/sessions/SlotsEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface PhotoSessionEditorProps {
  initialData: PhotoSessionResponse;
  categories: CategoryResponse[];
}

interface EditorFormValues {
  title: string;
  slug: string;
  categoryId: string;
  audience: PhotoSessionAudience;
  description: string;
  previewUrl: string;
  tokenCostPerSlot: number;
  sortOrder: number;
  featured: boolean;
  popular: boolean;
  isVisible: boolean;
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  jsonLd: string;
}

interface SeoAutoSaveValue {
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  jsonLd: string;
}

const audienceOptions = [
  { value: PhotoSessionAudience.FEMALE, label: "Женские" },
  { value: PhotoSessionAudience.MALE, label: "Мужские" },
  { value: PhotoSessionAudience.JOINT, label: "Совместные" },
  { value: PhotoSessionAudience.KIDS, label: "Детские" },
] as const;

const seoFieldNames: Array<keyof EditorFormValues> = [
  "seoTitle",
  "seoDescription",
  "canonical",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "twitterCard",
  "jsonLd",
];

function toLocalGroups(
  groups: PhotoSessionResponse["parameterGroups"],
): LocalParameterGroup[] {
  return groups.map((group) => ({
    localId: crypto.randomUUID(),
    question: group.question,
    isRequired: group.isRequired,
    options: group.options.map((option) => ({
      localId: crypto.randomUUID(),
      label: option.label,
      promptSnippet: option.promptSnippet,
      imageUrl: option.imageUrl ?? "",
    })),
  }));
}

function toLocalSlots(slots: PhotoSessionResponse["slots"]): LocalSlot[] {
  return slots.map((slot) => ({
    localId: crypto.randomUUID(),
    basePrompt: slot.basePrompt,
    previewUrl: slot.previewUrl ?? "",
  }));
}

function serializeSlots(slots: LocalSlot[]): CreateSlotRequest[] {
  return slots.map((slot, index) => ({
    order: index + 1,
    basePrompt: slot.basePrompt.trim(),
    ...(slot.previewUrl ? { previewUrl: slot.previewUrl } : {}),
  }));
}

function parseJsonLd(value: string): Record<string, unknown> | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("JSON-LD должен быть валидным JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON-LD должен быть объектом");
  }

  return parsed as Record<string, unknown>;
}

function getSlotsValidationError(slots: LocalSlot[]): string | undefined {
  if (slots.length < 1 || slots.length > 10) {
    return "Количество слотов должно быть от 1 до 10";
  }

  const emptyPromptIndex = slots.findIndex(
    (slot) => slot.basePrompt.trim().length === 0,
  );
  if (emptyPromptIndex !== -1) {
    return `Заполните промпт слота ${emptyPromptIndex + 1}`;
  }

  return undefined;
}

export function PhotoSessionEditor({
  initialData,
  categories,
}: PhotoSessionEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [slots, setSlots] = useState<LocalSlot[]>(() =>
    toLocalSlots(initialData.slots),
  );
  const [groups, setGroups] = useState<LocalParameterGroup[]>(() =>
    toLocalGroups(initialData.parameterGroups),
  );
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugDraft, setSlugDraft] = useState(initialData.slug);

  const [manualStatus, setManualStatus] = useState<SaveStatus>("idle");
  const [manualErrorMessage, setManualErrorMessage] = useState<
    string | undefined
  >(undefined);
  const manualSavedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastManualPayloadRef = useRef<UpdatePhotoSessionRequest | null>(null);

  const methods = useForm<EditorFormValues>({
    defaultValues: {
      title: initialData.title,
      slug: initialData.slug,
      categoryId: initialData.categoryId,
      audience: initialData.audience,
      description: initialData.description ?? "",
      previewUrl: initialData.previewUrl ?? "",
      tokenCostPerSlot: initialData.tokenCostPerSlot,
      sortOrder: initialData.sortOrder,
      featured: initialData.featured,
      popular: initialData.popular,
      isVisible: initialData.isVisible,
      seoTitle: initialData.seoTitle ?? "",
      seoDescription: initialData.seoDescription ?? "",
      canonical: initialData.canonical ?? "",
      ogTitle: initialData.ogTitle ?? "",
      ogDescription: initialData.ogDescription ?? "",
      ogImage: initialData.ogImage ?? "",
      twitterCard: initialData.twitterCard ?? "",
      jsonLd: initialData.jsonLd
        ? JSON.stringify(initialData.jsonLd, null, 2)
        : "",
    },
  });

  const title = useWatch({ control: methods.control, name: "title" }) ?? "";
  const slug = useWatch({ control: methods.control, name: "slug" }) ?? "";
  const categoryId =
    useWatch({ control: methods.control, name: "categoryId" }) ?? "";
  const description =
    useWatch({ control: methods.control, name: "description" }) ?? "";
  const previewUrl =
    useWatch({ control: methods.control, name: "previewUrl" }) ?? "";
  const tokenCostPerSlot =
    useWatch({ control: methods.control, name: "tokenCostPerSlot" }) ?? 1;
  const sortOrder =
    useWatch({ control: methods.control, name: "sortOrder" }) ?? 0;
  const featured =
    useWatch({ control: methods.control, name: "featured" }) ?? false;
  const popular =
    useWatch({ control: methods.control, name: "popular" }) ?? false;
  const seoValuesArray = useWatch({
    control: methods.control,
    name: seoFieldNames,
  });

  const seoValue = {
    seoTitle: String(seoValuesArray[0] ?? ""),
    seoDescription: String(seoValuesArray[1] ?? ""),
    canonical: String(seoValuesArray[2] ?? ""),
    ogTitle: String(seoValuesArray[3] ?? ""),
    ogDescription: String(seoValuesArray[4] ?? ""),
    ogImage: String(seoValuesArray[5] ?? ""),
    twitterCard: String(seoValuesArray[6] ?? ""),
    jsonLd: String(seoValuesArray[7] ?? ""),
  } as SeoAutoSaveValue;

  const categoryName = useMemo(
    () => categories.find((category) => category.id === categoryId)?.name,
    [categories, categoryId],
  );

  const slotsErrorMessage = useMemo(
    () => getSlotsValidationError(slots),
    [slots],
  );
  const groupsErrorMessage = useMemo(() => {
    return hasEmptyGroups(groups)
      ? "В общих параметрах есть группа без вариантов"
      : undefined;
  }, [groups]);
  const activeSlot =
    slots[Math.min(activeSlotIndex, Math.max(slots.length - 1, 0))];

  const clearManualSavedResetTimer = useCallback(() => {
    if (manualSavedResetTimerRef.current) {
      clearTimeout(manualSavedResetTimerRef.current);
      manualSavedResetTimerRef.current = null;
    }
  }, []);

  const patchPhotoSession = useCallback(
    async (payload: UpdatePhotoSessionRequest): Promise<void> => {
      await apiPatch<
        PhotoSessionResponse | { data: PhotoSessionResponse },
        UpdatePhotoSessionRequest
      >(API_ROUTES.PHOTO_SESSION_BY_ID(initialData.id), payload);
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.sessions.all });
    },
    [initialData.id, queryClient],
  );

  const immediateSave = useCallback(
    async (payload: UpdatePhotoSessionRequest): Promise<boolean> => {
      clearManualSavedResetTimer();
      setManualStatus("saving");
      setManualErrorMessage(undefined);
      lastManualPayloadRef.current = payload;

      try {
        await patchPhotoSession(payload);
        setManualStatus("saved");
        manualSavedResetTimerRef.current = setTimeout(() => {
          setManualStatus("idle");
        }, 2000);
        return true;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Ошибка сохранения";

        setManualStatus("error");
        setManualErrorMessage(message);
        return false;
      }
    },
    [clearManualSavedResetTimer, patchPhotoSession],
  );

  useEffect(() => {
    return () => {
      clearManualSavedResetTimer();
    };
  }, [clearManualSavedResetTimer]);

  const titleAutoSave = useAutoSave({
    value: title,
    onSave: async (value) => patchPhotoSession({ title: value }),
    delay: 800,
    enabled: false,
  });

  const descriptionAutoSave = useAutoSave({
    value: description,
    onSave: async (value) =>
      patchPhotoSession({ description: value || undefined }),
    delay: 800,
    enabled: false,
  });

  const tokenCostAutoSave = useAutoSave({
    value: tokenCostPerSlot,
    onSave: async (value) => patchPhotoSession({ tokenCostPerSlot: value }),
    delay: 800,
    enabled: false,
  });

  const sortOrderAutoSave = useAutoSave({
    value: sortOrder,
    onSave: async (value) => patchPhotoSession({ sortOrder: value }),
    delay: 800,
    enabled: false,
  });

  const seoAutoSave = useAutoSave({
    value: seoValue,
    onSave: async (value) => {
      await patchPhotoSession({
        seoTitle: value.seoTitle || undefined,
        seoDescription: value.seoDescription || undefined,
        canonical: value.canonical || undefined,
        ogTitle: value.ogTitle || undefined,
        ogDescription: value.ogDescription || undefined,
        ogImage: value.ogImage || undefined,
        twitterCard: value.twitterCard || undefined,
        jsonLd: parseJsonLd(value.jsonLd),
      });
    },
    delay: 800,
    enabled: false,
  });

  const groupsAutoSave = useAutoSave({
    value: groups,
    onSave: async (value) => {
      if (hasEmptyGroups(value)) {
        throw new Error("В общих параметрах есть группа без вариантов");
      }

      await patchPhotoSession({
        parameterGroups:
          value.length > 0 ? serializeParameterGroups(value) : undefined,
      });
    },
    delay: 1200,
    enabled: false,
  });

  const slotsAutoSave = useAutoSave({
    value: slots,
    onSave: async (value) => {
      const error = getSlotsValidationError(value);
      if (error) {
        throw new Error(error);
      }

      await patchPhotoSession({ slots: serializeSlots(value) });
    },
    delay: 1500,
    enabled: false,
  });

  const autoSaveStatuses = [
    titleAutoSave,
    descriptionAutoSave,
    tokenCostAutoSave,
    sortOrderAutoSave,
    seoAutoSave,
    groupsAutoSave,
    slotsAutoSave,
  ];

  const hasAutoError = autoSaveStatuses.some(
    (entry) => entry.status === "error",
  );
  const hasAutoSaving = autoSaveStatuses.some(
    (entry) => entry.status === "saving",
  );
  const hasAutoSaved = autoSaveStatuses.some(
    (entry) => entry.status === "saved",
  );

  const saveStatus: SaveStatus =
    slotsErrorMessage || groupsErrorMessage
      ? "error"
      : hasAutoError || manualStatus === "error"
        ? "error"
        : hasAutoSaving || manualStatus === "saving"
          ? "saving"
          : hasAutoSaved || manualStatus === "saved"
            ? "saved"
            : "idle";

  const autoSaveErrorMessage = autoSaveStatuses.find(
    (entry) => entry.status === "error",
  )?.errorMessage;
  const saveErrorMessage =
    slotsErrorMessage ||
    groupsErrorMessage ||
    manualErrorMessage ||
    autoSaveErrorMessage;

  const hasPendingWork =
    autoSaveStatuses.some(
      (entry) => entry.hasPending || entry.status === "saving",
    ) || manualStatus === "saving";

  const {
    dialogOpen,
    requestNavigation,
    closeDialog,
    confirmNavigation,
  } = useUnsavedChanges(hasPendingWork);

  const tokenCostRegister = methods.register("tokenCostPerSlot", {
    valueAsNumber: true,
  });
  const sortOrderRegister = methods.register("sortOrder", {
    valueAsNumber: true,
  });

  function retrySave(): void {
    autoSaveStatuses.forEach((entry) => {
      if (entry.status === "error") {
        entry.retry();
      }
    });

    if (manualStatus === "error" && lastManualPayloadRef.current) {
      void immediateSave(lastManualPayloadRef.current);
    }
  }

  async function handleSaveAll(): Promise<void> {
    if (groupsErrorMessage || slotsErrorMessage) {
      setManualStatus("error");
      setManualErrorMessage(groupsErrorMessage ?? slotsErrorMessage);
      return;
    }

    const values = methods.getValues();

    let jsonLd: Record<string, unknown> | undefined;
    try {
      jsonLd = parseJsonLd(values.jsonLd);
    } catch (error) {
      setManualStatus("error");
      setManualErrorMessage(
        error instanceof Error ? error.message : "Ошибка в JSON-LD",
      );
      return;
    }

    const payload: UpdatePhotoSessionRequest = {
      title: values.title,
      slug: values.slug,
      categoryId: values.categoryId,
      audience: values.audience,
      description: values.description || undefined,
      previewUrl: values.previewUrl || undefined,
      tokenCostPerSlot: values.tokenCostPerSlot,
      sortOrder: values.sortOrder,
      featured: values.featured,
      popular: values.popular,
      isVisible: values.isVisible,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      canonical: values.canonical || undefined,
      ogTitle: values.ogTitle || undefined,
      ogDescription: values.ogDescription || undefined,
      ogImage: values.ogImage || undefined,
      twitterCard: values.twitterCard || undefined,
      jsonLd,
      parameterGroups:
        groups.length > 0 ? serializeParameterGroups(groups) : undefined,
      slots: serializeSlots(slots),
    };

    const saved = await immediateSave(payload);
    if (saved) {
      router.push("/admin/sessions");
      router.refresh();
    }
  }

  const isSaveDisabled =
    manualStatus === "saving" ||
    Boolean(groupsErrorMessage || slotsErrorMessage);

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => requestNavigation(() => router.push("/admin/sessions"))}
            >
              ← К списку
            </Button>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {title || "Редактор фотосессии"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => void handleSaveAll()}
              disabled={isSaveDisabled}
            >
              {manualStatus === "saving" ? "Сохранение..." : "Сохранить"}
            </Button>
            <SaveStatusIndicator
              status={saveStatus}
              errorMessage={saveErrorMessage}
              onRetry={retrySave}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="parameters">Параметры</TabsTrigger>
                <TabsTrigger value="slots">Слоты</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <PhotoSessionPreviewCard
                  title={title}
                  previewUrl={previewUrl || undefined}
                  categoryName={categoryName}
                  tokenCostPerSlot={tokenCostPerSlot}
                  slotsCount={slots.length}
                  featured={featured}
                  popular={popular}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Название</Label>
                    <Input {...methods.register("title")} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Slug</Label>
                    <Input
                      value={slugEditing ? slugDraft : slug}
                      onFocus={() => {
                        setSlugEditing(true);
                        setSlugDraft(slug);
                      }}
                      onChange={(event) => setSlugDraft(event.target.value)}
                      onBlur={() => {
                        setSlugEditing(false);
                        methods.setValue("slug", slugDraft, {
                          shouldDirty: true,
                        });
                      }}
                    />
                    <p className="text-xs text-[--color-foreground-muted]">
                      Изменение slug применится после нажатия «Сохранить». Если
                      фотосессия опубликована, изменение slug создаст
                      301-редирект со старого адреса.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Категория</Label>
                    <Controller
                      control={methods.control}
                      name="categoryId"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(nextValue) => {
                            field.onChange(nextValue);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Аудитория</Label>
                    <Controller
                      control={methods.control}
                      name="audience"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(nextValue) => {
                            const audience = nextValue as PhotoSessionAudience;
                            field.onChange(audience);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите аудиторию" />
                          </SelectTrigger>
                          <SelectContent>
                            {audienceOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Описание</Label>
                    <Textarea {...methods.register("description")} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Controller
                      control={methods.control}
                      name="previewUrl"
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value || undefined}
                          entityType={MediaEntityType.SESSION}
                          entityId={initialData.id}
                          previewSize="184x260"
                          onChange={(_, publicUrl) => {
                            const nextValue = publicUrl ?? "";
                            field.onChange(nextValue);
                          }}
                          onClear={() => {
                            field.onChange("");
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Стоимость за слот (токены)</Label>
                    <Input
                      type="number"
                      min={1}
                      {...tokenCostRegister}
                      onBlur={(event) => {
                        tokenCostRegister.onBlur(event);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Порядок</Label>
                    <Input
                      type="number"
                      {...sortOrderRegister}
                      onBlur={(event) => {
                        sortOrderRegister.onBlur(event);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <Label>Featured</Label>
                    <Controller
                      control={methods.control}
                      name="featured"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <Label>Популярная</Label>
                    <Controller
                      control={methods.control}
                      name="popular"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <Label>Видимая</Label>
                    <Controller
                      control={methods.control}
                      name="isVisible"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="parameters" className="space-y-4">
                <ParameterGroupsEditor
                  value={groups}
                  entityId={initialData.id}
                  onChange={setGroups}
                  onStructuralChange={groupsAutoSave.flush}
                />
                {groups.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGroups([createEmptyGroup()]);
                      groupsAutoSave.flush();
                    }}
                  >
                    Добавить группу параметров
                  </Button>
                ) : null}
              </TabsContent>

              <TabsContent value="slots" className="space-y-4">
                <SlotsEditor
                  photoSessionId={initialData.id}
                  slots={slots}
                  activeSlotIndex={activeSlotIndex}
                  onActiveSlotChange={setActiveSlotIndex}
                  onChange={setSlots}
                  onStructuralChange={slotsAutoSave.flush}
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <SeoFields control={methods.control} collapsible={false} />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-4">
              <PromptPreview
                title={`Превью промпта — Слот ${Math.min(activeSlotIndex, Math.max(slots.length - 1, 0)) + 1}`}
                basePrompt={activeSlot?.basePrompt ?? ""}
                parameterGroups={groups}
              />
            </div>
          </aside>
        </div>

        <div className="xl:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                className="fixed bottom-20 right-4 z-30 bg-[--color-primary] text-white hover:bg-[--color-primary]/90"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto rounded-t-[--radius-lg] border-[--color-border] p-4"
            >
              <PromptPreview
                title={`Превью промпта — Слот ${Math.min(activeSlotIndex, Math.max(slots.length - 1, 0)) + 1}`}
                basePrompt={activeSlot?.basePrompt ?? ""}
                parameterGroups={groups}
              />
            </SheetContent>
          </Sheet>
        </div>
        <UnsavedChangesDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          onLeave={confirmNavigation}
        />
      </div>
    </FormProvider>
  );
}
