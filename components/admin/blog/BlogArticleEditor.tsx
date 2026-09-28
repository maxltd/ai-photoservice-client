"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentEditor } from "@/components/admin/cms/ContentEditor";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import {
  useCreateBlogArticle,
  usePublishBlogArticle,
  useRestoreBlogArticle,
  useUnpublishBlogArticle,
  useUpdateBlogArticle,
} from "@/lib/hooks/blog/useBlogAdmin";
import { apiPost } from "@/lib/api/client";
import {
  ApiError,
  API_ROUTES,
  BlogArticleStatus,
  BlogCalloutVariant,
  MediaEntityType,
  type BlogArticleContent,
  type BlogArticleResponse,
  type CreateBlogArticleRequest,
  type UpdateBlogArticleRequest,
} from "@/lib/api/contract";

interface BlogArticleEditorProps {
  initialData?: BlogArticleResponse;
}

interface PublishValidationContext {
  slug: string;
  h1: string;
  mainImage: string;
  publishedAt: string;
  readingTimeMinutes: number;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  content: BlogArticleContent;
}

interface BlogArticleFormValues {
  internalName: string;
  slug: string;
  h1: string;
  content: BlogArticleContent;
  mainImage: string;
  readingTimeMinutes: number;
  publishedAt: string;
  isVisible: boolean;
  robotsIndex: boolean;
  robotsFollow: boolean;
  showInSitemap: boolean;
  showInHomepage: boolean;
  canonical: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeBlogContent(content: BlogArticleContent): BlogArticleContent {
  const blocks = Array.isArray(content.blocks) ? content.blocks : [];

  const normalizedBlocks = blocks
    .map((rawBlock): BlogArticleContent["blocks"][number] | null => {
      const block = rawBlock as unknown as Record<string, unknown>;
      const data = toRecord(block.data);
      const type = String(block.type ?? "");
      const from = (key: string): unknown => block[key] ?? data[key];

      if (type === "heading") {
        const levelRaw = Number(from("level"));
        const level =
          levelRaw >= 1 && levelRaw <= 6 && Number.isInteger(levelRaw)
            ? (levelRaw as 1 | 2 | 3 | 4 | 5 | 6)
            : 2;

        return {
          type: "heading" as const,
          level,
          text: toStringOrEmpty(from("text")),
        };
      }

      if (type === "paragraph") {
        return {
          type: "paragraph" as const,
          text: toStringOrEmpty(from("text")),
        };
      }

      if (type === "list") {
        const style = from("style") === "ordered" ? "ordered" : "unordered";
        const rawVariant = from("variant");

        return {
          type: "list" as const,
          style,
          variant:
            style === "unordered" &&
            (rawVariant === "positive" || rawVariant === "negative")
              ? rawVariant
              : "default",
          items: Array.isArray(from("items"))
            ? (from("items") as unknown[])
                .filter((item): item is string => typeof item === "string")
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
            : [],
        };
      }

      if (type === "quote") {
        return {
          type: "quote" as const,
          text: toStringOrEmpty(from("text")),
          author: toOptionalString(from("author")),
        };
      }

      if (type === "link") {
        return {
          type: "link" as const,
          text: toStringOrEmpty(from("text")),
          href: toStringOrEmpty(from("href")),
        };
      }

      if (type === "image") {
        return {
          type: "image" as const,
          url: toStringOrEmpty(from("url")),
          alt: toStringOrEmpty(from("alt")),
          title: toOptionalString(from("title")),
        };
      }

      if (type === "callout") {
        const variant = from("variant");
        return {
          type: "callout" as const,
          variant:
            variant === BlogCalloutVariant.SUCCESS
              ? BlogCalloutVariant.SUCCESS
              : variant === BlogCalloutVariant.DANGER
                ? BlogCalloutVariant.DANGER
                : BlogCalloutVariant.ACCENT,
          text: toStringOrEmpty(from("text")),
        };
      }

      if (type === "figure") {
        return {
          type: "figure" as const,
          url: toStringOrEmpty(from("url")),
          alt: toStringOrEmpty(from("alt")),
          title: toOptionalString(from("title")),
          caption: toStringOrEmpty(from("caption")),
          showInImageSitemap:
            typeof from("showInImageSitemap") === "boolean"
              ? (from("showInImageSitemap") as boolean)
              : true,
        };
      }

      return null;
    })
    .filter((block): block is BlogArticleContent["blocks"][number] => block !== null);

  return { blocks: normalizedBlocks };
}

function getPublishIssues(ctx: PublishValidationContext): string[] {
  const issues: string[] = [];

  if (!ctx.h1.trim()) issues.push("H1");
  if (!ctx.slug.trim()) issues.push("Slug");
  if (!ctx.mainImage.trim()) issues.push("Главное изображение");
  if (!ctx.publishedAt.trim()) issues.push("Дата публикации");
  if (!ctx.readingTimeMinutes || ctx.readingTimeMinutes < 1) {
    issues.push("Время чтения (мин)");
  }

  if (!ctx.seoTitle.trim()) issues.push("SEO title");
  if (!ctx.seoDescription.trim()) issues.push("SEO description");
  if (!ctx.ogTitle.trim()) issues.push("OG title");
  if (!ctx.ogDescription.trim()) issues.push("OG description");
  if (!ctx.ogImage.trim()) issues.push("OG image");

  const blocks = Array.isArray(ctx.content.blocks) ? ctx.content.blocks : [];

  const hasTextBlock = blocks.some((block) => {
    if (["paragraph", "heading", "quote", "link"].includes(String(block.type))) {
      return isNonEmptyString((block as { text?: string }).text);
    }

    if (block.type === "list") {
      return block.items.some((item) => item.trim().length > 0);
    }

    return false;
  });

  if (!hasTextBlock) {
    issues.push("Контент: минимум один текстовый блок");
  }

  const hasFigureBlock = blocks.some(
    (block) =>
      block.type === "figure" &&
      isNonEmptyString(block.url) &&
      isNonEmptyString(block.caption),
  );

  if (!hasFigureBlock) {
    issues.push("Контент: минимум один блок Figure с URL и подписью");
  }

  return issues;
}

function extractError(reason: unknown): string {
  if (reason instanceof ApiError) {
    if (Array.isArray(reason.details) && reason.details.length > 0) {
      return `${reason.message}: ${reason.details.join(", ")}`;
    }

    return reason.message;
  }

  if (reason instanceof Error) {
    return reason.message;
  }

  return "Не удалось выполнить операцию";
}

export function BlogArticleEditor({ initialData }: BlogArticleEditorProps) {
  const router = useRouter();

  const createMutation = useCreateBlogArticle();
  const updateMutation = useUpdateBlogArticle(initialData?.id ?? "");
  const publishMutation = usePublishBlogArticle(initialData?.id ?? "");
  const unpublishMutation = useUnpublishBlogArticle(initialData?.id ?? "");
  const restoreMutation = useRestoreBlogArticle(initialData?.id ?? "");

  const form = useForm<BlogArticleFormValues>({
    defaultValues: {
      internalName: initialData?.internalName ?? "",
      slug: initialData?.slug ?? "",
      h1: initialData?.h1 ?? "",
      content: initialData?.content ?? { blocks: [] },
      mainImage: initialData?.mainImage ?? "",
      readingTimeMinutes: initialData?.readingTimeMinutes ?? 5,
      publishedAt: toDatetimeLocal(initialData?.publishedAt ?? null),
      isVisible: initialData?.isVisible ?? true,
      robotsIndex: initialData?.robotsIndex ?? true,
      robotsFollow: initialData?.robotsFollow ?? true,
      showInSitemap: initialData?.showInSitemap ?? true,
      showInHomepage: initialData?.showInHomepage ?? false,
      canonical: initialData?.canonical ?? "",
      seoTitle: initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
      ogTitle: initialData?.ogTitle ?? "",
      ogDescription: initialData?.ogDescription ?? "",
      ogImage: initialData?.ogImage ?? "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [publishIssues, setPublishIssues] = useState<string[]>([]);

  const statusLabel = useMemo(() => {
    if (!initialData) return "Новая";
    switch (initialData.status) {
      case BlogArticleStatus.PUBLISHED:
        return "Опубликована";
      case BlogArticleStatus.ARCHIVED:
        return "Архив";
      default:
        return "Черновик";
    }
  }, [initialData]);

  async function save(options?: { publish?: boolean }): Promise<void> {
    setError(null);
    setPublishIssues([]);

    const values = form.getValues();
    const normalizedContent = normalizeBlogContent(values.content);

    if (options?.publish) {
      const issues = getPublishIssues({
        slug: values.slug,
        h1: values.h1,
        mainImage: values.mainImage,
        publishedAt: values.publishedAt,
        readingTimeMinutes: Number(values.readingTimeMinutes),
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        ogTitle: values.ogTitle,
        ogDescription: values.ogDescription,
        ogImage: values.ogImage,
        content: normalizedContent,
      });

      if (issues.length > 0) {
        setPublishIssues(issues);
        return;
      }
    }

    try {
      const basePayload: CreateBlogArticleRequest = {
        internalName: values.internalName,
        slug: values.slug,
        h1: values.h1,
        content: normalizedContent,
        mainImage: values.mainImage || undefined,
        readingTimeMinutes: Number(values.readingTimeMinutes) || undefined,
        publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
        isVisible: values.isVisible,
        robotsIndex: values.robotsIndex,
        robotsFollow: values.robotsFollow,
        showInSitemap: values.showInSitemap,
        showInHomepage: values.showInHomepage,
        canonical: values.canonical || undefined,
        seoTitle: values.seoTitle || undefined,
        seoDescription: values.seoDescription || undefined,
        ogTitle: values.ogTitle || undefined,
        ogDescription: values.ogDescription || undefined,
        ogImage: values.ogImage || undefined,
      };

      if (!initialData) {
        const created = await createMutation.mutateAsync(basePayload);
        if (options?.publish) {
          await apiPost(API_ROUTES.ADMIN_BLOG_PUBLISH(created.id), {});
        }
        router.push(`/admin/blog/${created.id}/edit`);
        return;
      }

      await updateMutation.mutateAsync(basePayload as UpdateBlogArticleRequest);

      if (options?.publish) {
        await publishMutation.mutateAsync();
      }

      form.reset(form.getValues());
    } catch (reason) {
      setError(extractError(reason));
    }
  }

  const { dialogOpen, requestNavigation, closeDialog, confirmNavigation } =
    useUnsavedChanges(form.formState.isDirty);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    restoreMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => requestNavigation(() => router.push("/admin/blog"))}
            >
              ← К блогу
            </Button>
            <h1 className="truncate text-lg font-semibold">
              {form.watch("internalName") || "Редактор статьи"}
            </h1>
            <span className="text-sm text-foreground-muted">{statusLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void save()} disabled={isPending}>
              Сохранить
            </Button>
            <Button onClick={() => void save({ publish: true })} disabled={isPending}>
              Сохранить и опубликовать
            </Button>
            {initialData?.status === BlogArticleStatus.PUBLISHED ? (
              <Button variant="outline" onClick={() => unpublishMutation.mutate()} disabled={isPending}>
                Снять с публикации
              </Button>
            ) : null}
            {initialData?.status === BlogArticleStatus.ARCHIVED ? (
              <Button variant="outline" onClick={() => restoreMutation.mutate()} disabled={isPending}>
                Восстановить
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <UnsavedChangesDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onLeave={confirmNavigation}
      />

      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-danger">
          {error}
        </p>
      ) : null}

      {publishIssues.length > 0 ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <p className="mb-2 font-medium">Нельзя опубликовать страницу. Заполните:</p>
          <ul className="list-disc space-y-1 pl-5">
            {publishIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 rounded-lg border border-border bg-surface p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Название (внутреннее)</Label>
              <Input {...form.register("internalName")} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input {...form.register("slug")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>H1</Label>
            <Input {...form.register("h1")} />
          </div>

          <ImageUpload
            value={form.watch("mainImage") || undefined}
            entityType={MediaEntityType.CMS}
            entityId={initialData?.id ?? "blog-draft"}
            label="Обложка"
            previewSize="184x260"
            onChange={(_assetId, url) => {
              form.setValue("mainImage", url ?? "", { shouldDirty: true });
            }}
            onClear={() => form.setValue("mainImage", "", { shouldDirty: true })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Дата публикации</Label>
              <Input type="datetime-local" {...form.register("publishedAt")} />
            </div>
            <div className="space-y-2">
              <Label>Время чтения (мин)</Label>
              <Input type="number" min={1} {...form.register("readingTimeMinutes", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["isVisible", "Видима на сайте"],
              ["robotsIndex", "Robots: index"],
              ["robotsFollow", "Robots: follow"],
              ["showInSitemap", "Показывать в sitemap"],
              ["showInHomepage", "Показывать на Главной"],
            ].map(([field, label]) => (
              <div key={field} className="flex items-center justify-between rounded-md border border-border p-3">
                <Label>{label}</Label>
                <Switch
                  checked={Boolean(form.watch(field as keyof BlogArticleFormValues))}
                  onCheckedChange={(checked) =>
                    form.setValue(field as keyof BlogArticleFormValues, checked as never, { shouldDirty: true })
                  }
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="rounded-lg border border-border bg-surface p-4">
          <ContentEditor
            entityId={initialData?.id ?? "blog-draft"}
            initialContent={form.watch("content")}
            onSave={async (content) => {
              form.setValue("content", content as unknown as BlogArticleContent, { shouldDirty: true });
              return Promise.resolve(content);
            }}
            onStatusChange={() => undefined}
            onContentChange={(content) =>
              form.setValue("content", content as unknown as BlogArticleContent, { shouldDirty: true })
            }
          />
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 rounded-lg border border-border bg-surface p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SEO title</Label>
              <Input {...form.register("seoTitle")} />
            </div>
            <div className="space-y-2">
              <Label>OG title</Label>
              <Input {...form.register("ogTitle")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>SEO description</Label>
            <Textarea {...form.register("seoDescription")} />
          </div>

          <div className="space-y-2">
            <Label>OG description</Label>
            <Textarea {...form.register("ogDescription")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Canonical</Label>
              <Input {...form.register("canonical")} />
            </div>
            <div className="space-y-2">
              <Label>OG image</Label>
              <Input {...form.register("ogImage")} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
