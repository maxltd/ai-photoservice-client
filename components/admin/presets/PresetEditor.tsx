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
  type CategoryResponse,
  type PresetResponse,
  type UpdatePresetRequest,
} from "@/lib/api/contract";
import { apiPatch } from "@/lib/api/client";
import { SaveStatusIndicator } from "@/components/admin/common/SaveStatusIndicator";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { SeoFields } from "@/components/admin/common/SeoFields";
import { ParameterGroupsEditor } from "@/components/admin/common/ParameterGroupsEditor";
import { PresetPreviewCard } from "@/components/admin/presets/PresetPreviewCard";
import { PromptPreview } from "@/components/admin/common/PromptPreview";
import {
  hasEmptyGroups,
  serializeParameterGroups,
  type LocalParameterGroup,
} from "@/lib/parameter-groups";
import { useAutoSave, type SaveStatus } from "@/lib/hooks/useAutoSave";
import { queryKeys } from "@/lib/query/keys";
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

interface PresetEditorProps {
  initialData: PresetResponse;
  categories: CategoryResponse[];
}

interface EditorFormValues {
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  previewUrl: string;
  tokenCost: number;
  basePrompt: string;
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
  groups: PresetResponse["parameterGroups"],
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

export function PresetEditor({ initialData, categories }: PresetEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [groups, setGroups] = useState<LocalParameterGroup[]>(() =>
    toLocalGroups(initialData.parameterGroups),
  );
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugDraft, setSlugDraft] = useState(initialData.slug);

  const [manualStatus, setManualStatus] = useState<SaveStatus>("idle");
  const [manualErrorMessage, setManualErrorMessage] = useState<
    string | undefined
  >(undefined);
  const manualSavedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastManualPayloadRef = useRef<UpdatePresetRequest | null>(null);

  const methods = useForm<EditorFormValues>({
    defaultValues: {
      title: initialData.title,
      slug: initialData.slug,
      categoryId: initialData.categoryId,
      description: initialData.description ?? "",
      previewUrl: initialData.previewUrl ?? "",
      tokenCost: initialData.tokenCost,
      basePrompt: initialData.basePrompt,
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
  const tokenCost =
    useWatch({ control: methods.control, name: "tokenCost" }) ?? 1;
  const basePrompt =
    useWatch({ control: methods.control, name: "basePrompt" }) ?? "";
  const sortOrder =
    useWatch({ control: methods.control, name: "sortOrder" }) ?? 0;
  const featured =
    useWatch({ control: methods.control, name: "featured" }) ?? false;
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

  const hasInvalidGroups = hasEmptyGroups(groups);

  const clearManualSavedResetTimer = useCallback(() => {
    if (manualSavedResetTimerRef.current) {
      clearTimeout(manualSavedResetTimerRef.current);
      manualSavedResetTimerRef.current = null;
    }
  }, []);

  const patchPreset = useCallback(
    async (payload: UpdatePresetRequest): Promise<void> => {
      await apiPatch<
        PresetResponse | { data: PresetResponse },
        UpdatePresetRequest
      >(API_ROUTES.PRESET_BY_ID(initialData.id), payload);
      await queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.presets.all });
    },
    [initialData.id, queryClient],
  );

  const immediateSave = useCallback(
    async (payload: UpdatePresetRequest): Promise<boolean> => {
      clearManualSavedResetTimer();
      setManualStatus("saving");
      setManualErrorMessage(undefined);
      lastManualPayloadRef.current = payload;

      try {
        await patchPreset(payload);
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
    [clearManualSavedResetTimer, patchPreset],
  );

  useEffect(() => {
    return () => {
      clearManualSavedResetTimer();
    };
  }, [clearManualSavedResetTimer]);

  const titleAutoSave = useAutoSave({
    value: title,
    onSave: async (value) => patchPreset({ title: value }),
    delay: 800,
    enabled: false,
  });

  const descriptionAutoSave = useAutoSave({
    value: description,
    onSave: async (value) => patchPreset({ description: value || undefined }),
    delay: 800,
    enabled: false,
  });

  const tokenCostAutoSave = useAutoSave({
    value: tokenCost,
    onSave: async (value) => patchPreset({ tokenCost: value }),
    delay: 800,
    enabled: false,
  });

  const basePromptAutoSave = useAutoSave({
    value: basePrompt,
    onSave: async (value) => patchPreset({ basePrompt: value }),
    delay: 800,
    enabled: false,
  });

  const sortOrderAutoSave = useAutoSave({
    value: sortOrder,
    onSave: async (value) => patchPreset({ sortOrder: value }),
    delay: 800,
    enabled: false,
  });

  const seoAutoSave = useAutoSave({
    value: seoValue,
    onSave: async (value) => {
      await patchPreset({
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

  const parametersAutoSave = useAutoSave({
    value: groups,
    onSave: async (value) => {
      if (value.some((group) => group.options.length === 0)) {
        throw new Error("Есть незаполненные группы параметров");
      }

      await patchPreset({ parameterGroups: serializeParameterGroups(value) });
    },
    delay: 1200,
    enabled: false,
  });

  const autoSaveStatuses = [
    titleAutoSave,
    descriptionAutoSave,
    tokenCostAutoSave,
    basePromptAutoSave,
    sortOrderAutoSave,
    seoAutoSave,
    parametersAutoSave,
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

  const saveStatus: SaveStatus = hasInvalidGroups
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
  const saveErrorMessage = hasInvalidGroups
    ? "Есть незаполненные группы параметров"
    : manualErrorMessage || autoSaveErrorMessage;

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

  const tokenCostRegister = methods.register("tokenCost", {
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
    if (hasInvalidGroups) {
      setManualStatus("error");
      setManualErrorMessage("Есть незаполненные группы параметров");
      return;
    }

    const values = methods.getValues();

    const payload: UpdatePresetRequest = {
      title: values.title,
      slug: values.slug,
      categoryId: values.categoryId,
      description: values.description || undefined,
      previewUrl: values.previewUrl || undefined,
      tokenCost: values.tokenCost,
      basePrompt: values.basePrompt,
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
      jsonLd: parseJsonLd(values.jsonLd),
      parameterGroups: serializeParameterGroups(groups),
    };

    const saved = await immediateSave(payload);
    if (saved) {
      router.push("/admin/presets");
      router.refresh();
    }
  }

  const isSaveDisabled = manualStatus === "saving" || hasInvalidGroups;

  return (
    <FormProvider {...methods}>
      <div className="space-y-4">
        <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => requestNavigation(() => router.push("/admin/presets"))}
            >
              ← К списку
            </Button>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {title || "Редактор пресета"}
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
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <PresetPreviewCard
                  title={title}
                  previewUrl={previewUrl || undefined}
                  categoryName={categoryName}
                  tokenCost={tokenCost}
                  featured={featured}
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
                      пресет опубликован, изменение slug создаст 301-редирект со
                      старого адреса.
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
                          entityType={MediaEntityType.PRESET}
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
                    <Label>Стоимость (токены)</Label>
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

                  <div className="space-y-2 md:col-span-2">
                    <Label>Base prompt</Label>
                    <Textarea
                      className="min-h-40"
                      {...methods.register("basePrompt")}
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
                    <Label>Популярный</Label>
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
                    <Label>Видимый</Label>
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
                  onStructuralChange={parametersAutoSave.flush}
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <SeoFields control={methods.control} collapsible={false} />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-4">
              <PromptPreview basePrompt={basePrompt} parameterGroups={groups} />
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
              <PromptPreview basePrompt={basePrompt} parameterGroups={groups} />
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
