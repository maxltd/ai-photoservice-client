"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertTriangle, Check, XCircle } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveStatusIndicator } from "@/components/admin/common/SaveStatusIndicator";
import { SeoFields } from "@/components/admin/common/SeoFields";
import { ContentEditor } from "@/components/admin/cms/ContentEditor";
import { FaqEditor } from "@/components/admin/cms/FaqEditor";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateCmsPage } from "@/lib/hooks/cms/useCmsAdmin";
import { useAutoSave, type SaveStatus } from "@/lib/hooks/useAutoSave";
import {
  type CmsPageResponse,
  type FaqPageContent,
  type UpdateCmsPageRequest,
} from "@/lib/api/contract";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CmsEditorProps {
  initialData: CmsPageResponse;
}

interface CmsEditorFormValues {
  title: string;
  slug: string;
  h1: string;
  isPublished: boolean;
  isVisible: boolean;
  sortOrder: number;
  content: Record<string, unknown>;
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  jsonLd: string;
}

interface SeoCheck {
  field: string;
  label: string;
  status: "ok" | "warn" | "error";
  message: string;
}

function parseJsonLd(value: string): Record<string, unknown> | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed: unknown = JSON.parse(trimmed);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON-LD должен быть объектом");
  }

  return parsed as Record<string, unknown>;
}

function aggregateStatus(
  ...statuses: Array<"idle" | "saving" | "saved" | "error">
): "idle" | "saving" | "saved" | "error" {
  if (statuses.includes("saving")) {
    return "saving";
  }

  if (statuses.includes("error")) {
    return "error";
  }

  if (statuses.includes("saved")) {
    return "saved";
  }

  return "idle";
}

export function CmsEditor({ initialData }: CmsEditorProps) {
  const router = useRouter();
  const updateMutation = useUpdateCmsPage(initialData.id);
  const [contentStatus, setContentStatus] = useState<SaveStatus>("idle");

  const form = useForm<CmsEditorFormValues>({
    defaultValues: {
      title: initialData.title,
      slug: initialData.slug,
      h1: initialData.h1,
      isPublished: initialData.isPublished,
      isVisible: initialData.isVisible,
      sortOrder: initialData.sortOrder,
      content: initialData.content,
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

  const { register, setValue, getValues, formState, control } = form;

  const update = useCallback(
    (dto: UpdateCmsPageRequest) => updateMutation.mutateAsync(dto),
    [updateMutation],
  );

  const titleVal = useWatch({ control, name: "title" });
  const h1Val = useWatch({ control, name: "h1" });
  const sortOrderVal = useWatch({ control, name: "sortOrder" });
  const { status: mainStatus, retry: retryMain } = useAutoSave({
    value: {
      title: titleVal,
      h1: h1Val,
      sortOrder: sortOrderVal,
    },
    onSave: (value) => update(value),
    delay: 800,
  });

  const [
    seoTitle,
    seoDesc,
    canonical,
    ogTitle,
    ogDesc,
    ogImage,
    twitterCard,
    jsonLd,
  ] = useWatch({
    control,
    name: [
      "seoTitle",
      "seoDescription",
      "canonical",
      "ogTitle",
      "ogDescription",
      "ogImage",
      "twitterCard",
      "jsonLd",
    ],
  });

  const { status: seoStatus, retry: retrySeo } = useAutoSave({
    value: {
      seoTitle,
      seoDescription: seoDesc,
      canonical,
      ogTitle,
      ogDescription: ogDesc,
      ogImage,
      twitterCard,
      jsonLd,
    },
    onSave: async (value) => {
      await update({
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
  });

  const watchedTitle = useWatch({ control, name: "title" });
  const watchedIsPublished = useWatch({ control, name: "isPublished" });
  const watchedIsVisible = useWatch({ control, name: "isVisible" });
  const watchedContent = useWatch({ control, name: "content" });

  const saveStatus = aggregateStatus(mainStatus, seoStatus, contentStatus);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (formState.isDirty) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [formState.isDirty]);

  const seoChecks = useMemo<SeoCheck[]>(() => {
    const titleLength = (seoTitle ?? "").trim().length;
    const descLength = (seoDesc ?? "").trim().length;

    return [
      {
        field: "seoTitle",
        label: "SEO title",
        status:
          titleLength === 0
            ? "error"
            : titleLength >= 30 && titleLength <= 60
              ? "ok"
              : "warn",
        message:
          titleLength === 0
            ? "Пусто"
            : titleLength >= 30 && titleLength <= 60
              ? `${titleLength} символов`
              : `${titleLength} символов (рекомендуется 30–60)`,
      },
      {
        field: "seoDescription",
        label: "SEO description",
        status:
          descLength === 0
            ? "error"
            : descLength >= 100 && descLength <= 160
              ? "ok"
              : "warn",
        message:
          descLength === 0
            ? "Пусто"
            : descLength >= 100 && descLength <= 160
              ? `${descLength} символов`
              : `${descLength} символов (рекомендуется 100–160)`,
      },
      {
        field: "ogImage",
        label: "OG image",
        status: (ogImage ?? "").trim() ? "ok" : "error",
        message: (ogImage ?? "").trim() ? "Заполнено" : "Пусто",
      },
      {
        field: "canonical",
        label: "Canonical",
        status: (canonical ?? "").trim() ? "ok" : "warn",
        message: (canonical ?? "").trim() ? "Заполнено" : "Не задано",
      },
    ];
  }, [canonical, ogImage, seoDesc, seoTitle]);

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/admin/cms")}>
              ← К страницам
            </Button>
            <h1 className="truncate text-lg font-semibold">
              {watchedTitle || "Редактор страницы"}
            </h1>
            <Badge
              className={
                watchedIsPublished
                  ? "bg-[--color-success]/10 text-[--color-success] border border-[--color-success]/20"
                  : "bg-[--color-warning]/10 text-[--color-warning] border border-[--color-warning]/20"
              }
            >
              {watchedIsPublished ? "Опубликована" : "Черновик"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <SaveStatusIndicator
              status={saveStatus}
              onRetry={() => {
                retryMain();
                retrySeo();
              }}
            />
            <Button
              variant={watchedIsPublished ? "outline" : "default"}
              onClick={() => {
                const next = !getValues("isPublished");
                setValue("isPublished", next, { shouldDirty: true });
                void updateMutation.mutateAsync({ isPublished: next });
              }}
            >
              {watchedIsPublished ? "Снять с публикации" : "Опубликовать"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent
          value="basic"
          className="space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input id="title" {...register("title")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug", {
                onBlur: () => {
                  const value = getValues("slug");
                  if (value !== initialData.slug) {
                    void updateMutation.mutateAsync({ slug: value });
                  }
                },
              })}
            />
            <p className="text-xs text-[--color-foreground-muted]">
              Сохраняется при потере фокуса. Если страница опубликована —
              изменение slug автоматически создаст 301-редирект со старого
              адреса.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="h1">H1</Label>
            <Input id="h1" {...register("h1")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Порядок</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              {...register("sortOrder", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label htmlFor="isVisible">Видимая страница</Label>
            <Switch
              id="isVisible"
              checked={watchedIsVisible}
              onCheckedChange={(checked) => {
                setValue("isVisible", checked, { shouldDirty: true });
                void updateMutation.mutateAsync({ isVisible: checked });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="content"
          className="rounded-lg border border-border bg-surface p-4"
        >
          {initialData.slug === "faq" ? (
            <FaqEditor
              entityId={initialData.id}
              initialContent={watchedContent}
              onSave={(content) => update({ content })}
              onStatusChange={setContentStatus}
              onContentChange={(content: FaqPageContent) =>
                setValue("content", content, { shouldDirty: true })
              }
            />
          ) : (
            <ContentEditor
              entityId={initialData.id}
              initialContent={watchedContent}
              onSave={(content) => update({ content })}
              onStatusChange={setContentStatus}
              onContentChange={(content) =>
                setValue("content", content, { shouldDirty: true })
              }
            />
          )}
        </TabsContent>

        <TabsContent
          value="seo"
          className="space-y-4 rounded-lg border border-border bg-surface p-4"
        >
          <div className="space-y-2 rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
            {seoChecks.map((check) => (
              <div
                key={check.field}
                className="flex items-center gap-2 text-sm"
              >
                {check.status === "ok" ? (
                  <Check className="h-4 w-4 text-[--color-success]" />
                ) : null}
                {check.status === "warn" ? (
                  <AlertTriangle className="h-4 w-4 text-[--color-warning]" />
                ) : null}
                {check.status === "error" ? (
                  <XCircle className="h-4 w-4 text-[--color-danger]" />
                ) : null}
                <span className="text-[--color-foreground-muted]">
                  {check.label}:
                </span>
                <span
                  className={cn(
                    check.status === "ok" && "text-[--color-success]",
                    check.status === "warn" && "text-[--color-warning]",
                    check.status === "error" && "text-[--color-danger]",
                  )}
                >
                  {check.message}
                </span>
              </div>
            ))}
          </div>

          <SeoFields control={control} collapsible={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
