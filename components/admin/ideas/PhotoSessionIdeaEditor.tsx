"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import {
  ApiError,
  API_ROUTES,
  MediaEntityType,
  PhotoSessionIdeaStatus,
  type PhotoSessionIdeaContent,
  type PhotoSessionIdeaResponse,
} from "@/lib/api/contract";
import { apiPost } from "@/lib/api/client";
import {
  useCreatePhotoSessionIdea,
  useDeletePhotoSessionIdea,
  usePublishPhotoSessionIdea,
  useRestorePhotoSessionIdea,
  useUnpublishPhotoSessionIdea,
  useUpdatePhotoSessionIdea,
} from "@/lib/hooks/ideas/usePhotoSessionIdeas";
import { useCategories } from "@/lib/hooks/categories/useCategories";

interface PublishValidationContext {
  h1: string;
  slug: string;
  mainImage: string;
  primaryCategoryId: string;

  content: PhotoSessionIdeaContent;
  allowLegacyFiveHeroImages: boolean;
}

const STEP_PALETTES = ["orange", "blue", "violet", "green"] as const;

function createDefaultContent(): PhotoSessionIdeaContent {
  return {
    ideaTypes: [],
    hero: {
      description: "",
      images: [
        { url: "", alt: "", title: "" },
        { url: "", alt: "", title: "" },
        { url: "", alt: "", title: "" },
        { url: "", alt: "", title: "" },
        { url: "", alt: "", title: "" },
        { url: "", alt: "", title: "" },
        { url: "", alt: "", title: "" },
      ],
      showRating: false,
      rating: "",
      cta: { text: "", href: "" },
    },
    howToCreate: {
      title: "",
      steps: [
        { title: "", text: "", palette: "orange" },
        { title: "", text: "", palette: "blue" },
        { title: "", text: "", palette: "violet" },
      ],
      cta: { text: "", href: "" },
    },
    trends: {
      title: "Последние ИИ-тренды",
      subtitle: "",
      cta: { text: "Смотреть все тренды", href: "/ideas/" },
    },
    moreIdeas: {
      title: "Больше идей для фотосессий",
      cta: { text: "Смотреть все идеи", href: "/ideas/" },
    },
    faq: {
      title: "Отвечаем на популярные вопросы",
      items: [{ question: "", answer: "" }],
    },
    bottomCta: {
      title: "",
      text: "",
      images: ["", "", ""],
      button: { text: "", href: "" },
    },
    seoText: {
      title: "",
      body: "",
      tags: [],
    },
  };
}

function normalizeContent(content: PhotoSessionIdeaContent): PhotoSessionIdeaContent {
  const fallback = createDefaultContent();

  return {
    ...fallback,
    ...content,
    ideaTypes: Array.isArray(content.ideaTypes) ? content.ideaTypes : [],
    hero: {
      ...fallback.hero,
      ...content.hero,
      images:
        content.hero?.images?.length === 7
          ? content.hero.images
          : content.hero?.images?.length === 5
            ? [
                ...content.hero.images,
                { url: "", alt: "", title: "" },
                { url: "", alt: "", title: "" },
              ]
            : fallback.hero.images,
      cta: {
        ...fallback.hero.cta,
        ...(content.hero?.cta ?? {}),
      },
    },
    howToCreate: {
      ...fallback.howToCreate,
      ...content.howToCreate,
      steps:
        content.howToCreate?.steps && content.howToCreate.steps.length === 3
          ? content.howToCreate.steps
          : fallback.howToCreate.steps,
      cta: {
        ...fallback.howToCreate.cta,
        ...(content.howToCreate?.cta ?? {}),
      },
    },
    trends: {
      ...fallback.trends,
      ...content.trends,
      cta: {
        ...fallback.trends.cta,
        ...(content.trends?.cta ?? {}),
      },
    },
    moreIdeas: {
      ...fallback.moreIdeas,
      ...content.moreIdeas,
      cta: {
        ...fallback.moreIdeas.cta,
        ...(content.moreIdeas?.cta ?? {}),
      },
    },
    faq: {
      ...fallback.faq,
      ...content.faq,
      items:
        content.faq?.items && content.faq.items.length > 0
          ? content.faq.items
          : fallback.faq.items,
    },
    bottomCta: {
      ...fallback.bottomCta,
      ...content.bottomCta,
      images:
        content.bottomCta?.images && content.bottomCta.images.length === 3
          ? content.bottomCta.images
          : [
              content.bottomCta?.images?.[0] ?? "",
              content.bottomCta?.images?.[1] ?? "",
              "",
            ],
      button: {
        ...fallback.bottomCta.button,
        ...(content.bottomCta?.button ?? {}),
      },
    },
    seoText: {
      ...fallback.seoText,
      ...content.seoText,
      tags: Array.isArray(content.seoText?.tags) ? content.seoText.tags : [],
    },
  };
}

function normalizeCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function getPublishIssues(ctx: PublishValidationContext): string[] {
  const issues: string[] = [];

  if (!ctx.h1.trim()) issues.push("H1");
  if (!ctx.slug.trim()) issues.push("Slug");
  if (!ctx.mainImage.trim()) issues.push("Главное изображение");
  if (!ctx.primaryCategoryId.trim()) issues.push("Основная категория");



  const validHeroImageCount =
    ctx.content.hero.images.length === 7 ||
    (ctx.allowLegacyFiveHeroImages && ctx.content.hero.images.length === 5);
  if (!validHeroImageCount) {
    issues.push(
      ctx.allowLegacyFiveHeroImages
        ? "Hero: должно быть ровно 7 изображений для новой страницы"
        : "Hero: должно быть ровно 7 изображений",
    );
  }
  if (ctx.content.hero.images.some((image) => !image.url.trim())) {
    issues.push(`Hero: заполните все ${ctx.content.hero.images.length} изображений`);
  }
  if (!ctx.content.hero.description.trim()) issues.push("Hero: описание");
  if (!ctx.content.hero.cta.text.trim()) issues.push("Hero CTA: текст");
  if (!ctx.content.hero.cta.href.trim()) issues.push("Hero CTA: ссылка");

  if (ctx.content.howToCreate.steps.length !== 3) {
    issues.push("Как создать: должно быть ровно 3 шага");
  }
  if (!ctx.content.howToCreate.title.trim()) issues.push("Как создать: заголовок");
  if (
    ctx.content.howToCreate.steps.some(
      (step) => !step.title.trim() || !step.text.trim(),
    )
  ) {
    issues.push("Как создать: заполните заголовок и текст у всех 3 шагов");
  }
  if (!ctx.content.howToCreate.cta.text.trim()) {
    issues.push("Как создать: текст кнопки");
  }
  if (!ctx.content.howToCreate.cta.href.trim()) {
    issues.push("Как создать: ссылка кнопки");
  }

  if (!ctx.content.faq.title.trim()) issues.push("FAQ: заголовок");
  if (ctx.content.faq.items.length < 1) issues.push("FAQ: минимум 1 пара");
  if (
    ctx.content.faq.items.some(
      (item) => !item.question.trim() || !item.answer.trim(),
    )
  ) {
    issues.push("FAQ: заполните вопрос и ответ у всех пунктов");
  }

  if (!ctx.content.bottomCta.title.trim()) issues.push("Нижний CTA: заголовок");
  if (!ctx.content.bottomCta.text.trim()) issues.push("Нижний CTA: текст");
  if (ctx.content.bottomCta.images.some((image) => !image.trim())) {
    issues.push("Нижний CTA: 3 изображения");
  }
  if (!ctx.content.bottomCta.button.text.trim()) {
    issues.push("Нижний CTA: текст кнопки");
  }
  if (!ctx.content.bottomCta.button.href.trim()) {
    issues.push("Нижний CTA: ссылка кнопки");
  }

  if (!ctx.content.seoText.title.trim()) issues.push("SEO-текст: заголовок");
  if (!ctx.content.seoText.body.trim()) issues.push("SEO-текст: текст");

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

export function PhotoSessionIdeaEditor({ initialData }: { initialData?: PhotoSessionIdeaResponse }) {
  const router = useRouter();

  const createMutation = useCreatePhotoSessionIdea();
  const updateMutation = useUpdatePhotoSessionIdea(initialData?.id ?? "");
  const publishMutation = usePublishPhotoSessionIdea(initialData?.id ?? "");
  const unpublishMutation = useUnpublishPhotoSessionIdea(initialData?.id ?? "");
  const restoreMutation = useRestorePhotoSessionIdea(initialData?.id ?? "");
  const deleteMutation = useDeletePhotoSessionIdea();

  const categoriesQuery = useCategories({ page: 1, pageSize: 100 });

  const [status, setStatus] = useState<PhotoSessionIdeaStatus>(
    initialData?.status ?? PhotoSessionIdeaStatus.DRAFT,
  );

  const [internalName, setInternalName] = useState(initialData?.internalName ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [h1, setH1] = useState(initialData?.h1 ?? "");
  const [mainImage, setMainImage] = useState(initialData?.mainImage ?? "");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    initialData?.primaryCategoryId ?? "",
  );
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? false);
  const [robotsIndex, setRobotsIndex] = useState(initialData?.robotsIndex ?? true);
  const [robotsFollow, setRobotsFollow] = useState(
    initialData?.robotsFollow ?? true,
  );
  const [showInSitemap, setShowInSitemap] = useState(
    initialData?.showInSitemap ?? true,
  );
  const [showInMenu, setShowInMenu] = useState(initialData?.showInMenu ?? false);
  const [showInHomepage, setShowInHomepage] = useState(initialData?.showInHomepage ?? false);
  const [showInSearch, setShowInSearch] = useState(
    initialData?.showInSearch ?? true,
  );
  const [isAdultSensitive, setIsAdultSensitive] = useState(
    initialData?.isAdultSensitive ?? false,
  );
  const [isBrandPopCulture, setIsBrandPopCulture] = useState(
    initialData?.isBrandPopCulture ?? false,
  );

  const [canonical, setCanonical] = useState(initialData?.canonical ?? "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription ?? "",
  );
  const [ogTitle, setOgTitle] = useState(initialData?.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(
    initialData?.ogDescription ?? "",
  );
  const [ogImage, setOgImage] = useState(initialData?.ogImage ?? "");

  const [ideaTypesInput, setIdeaTypesInput] = useState(
    (initialData?.content.ideaTypes ?? []).join(", "),
  );
  const [seoTagsInput, setSeoTagsInput] = useState(
    (initialData?.content.seoText.tags ?? []).join(", "),
  );

  const [content, setContent] = useState<PhotoSessionIdeaContent>(
    normalizeContent(initialData?.content ?? createDefaultContent()),
  );
  const allowLegacyFiveHeroImages = initialData?.content.hero.images.length === 5;

  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [publishIssues, setPublishIssues] = useState<string[]>([]);

  const isArchived = status === PhotoSessionIdeaStatus.ARCHIVED;
  const {
    dialogOpen,
    requestNavigation,
    closeDialog,
    confirmNavigation,
  } = useUnsavedChanges(hasUnsavedChanges);

  const metaLine = useMemo(() => {
    if (!initialData) return "Новая страница";

    const parts = [
      `Статус: ${status}`,
      `Обновлено: ${new Date(initialData.updatedAt).toLocaleString()}`,
    ];

    if (initialData.lastEditedByName) {
      parts.push(`Автор: ${initialData.lastEditedByName}`);
    }

    return parts.join(" • ");
  }, [initialData, status]);

  function updateContent(mutator: (next: PhotoSessionIdeaContent) => void): void {
    setContent((previous) => {
      const next = structuredClone(previous);
      mutator(next);
      return next;
    });
  }

  function setHeroImageAt(index: number, url: string): void {
    updateContent((next) => {
      next.hero.images[index].url = url;
    });
  }

  function moveHeroImage(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= content.hero.images.length) return;

    updateContent((next) => {
      const copy = [...next.hero.images];
      const [moved] = copy.splice(index, 1);
      if (!moved) return;
      copy.splice(target, 0, moved);
      next.hero.images = copy;
    });
  }

  function moveFaqItem(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= content.faq.items.length) return;

    updateContent((next) => {
      const copy = [...next.faq.items];
      const [moved] = copy.splice(index, 1);
      if (!moved) return;
      copy.splice(target, 0, moved);
      next.faq.items = copy;
    });
  }

  async function save(options?: { publish?: boolean }): Promise<void> {
    setError(null);
    setPublishIssues([]);

    const nextContent = {
      ...content,
      ideaTypes: normalizeCsv(ideaTypesInput),
      seoText: {
        ...content.seoText,
        tags: normalizeCsv(seoTagsInput),
      },
    } satisfies PhotoSessionIdeaContent;

    if (options?.publish) {
      const issues = getPublishIssues({
        h1,
        slug,
        mainImage,
        primaryCategoryId,
        content: nextContent,
        allowLegacyFiveHeroImages,
      });

      if (issues.length > 0) {
        setPublishIssues(issues);
        return;
      }
    }

    try {
      const payload = {
        internalName,
        slug,
        h1,
        mainImage: mainImage || undefined,
        primaryCategoryId: primaryCategoryId || undefined,
        sortOrder,
        featured,
        isVisible,
        robotsIndex,
        robotsFollow,
        showInSitemap,
        showInMenu,
        showInHomepage,
        showInSearch,
        isAdultSensitive,
        isBrandPopCulture,
        canonical: canonical || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        ogTitle: ogTitle || undefined,
        ogDescription: ogDescription || undefined,
        ogImage: ogImage || undefined,
        content: nextContent,
      };

      if (!initialData) {
        const created = await createMutation.mutateAsync(payload);

        if (options?.publish) {
          await apiPost(API_ROUTES.ADMIN_PHOTO_SESSION_IDEA_PUBLISH(created.id), {});
        }

        router.push(`/admin/ideas/${created.id}/edit`);
        return;
      }

      const updated = await updateMutation.mutateAsync(payload);
      setStatus(updated.status);
      setHasUnsavedChanges(false);

      if (!options?.publish) return;

      const published = await publishMutation.mutateAsync();
      setStatus(published.status);
    } catch (reason) {
      setError(extractError(reason));
    }
  }

  async function handleArchive(): Promise<void> {
    if (!initialData) return;

    try {
      await deleteMutation.mutateAsync(initialData.id);
      setArchiveDialogOpen(false);
      router.push("/admin/ideas");
    } catch (reason) {
      setError(extractError(reason));
    }
  }

  return (
    <div
      className="space-y-6 p-6"
      onChange={() => setHasUnsavedChanges(true)}
    >
      <PageHeader
        title={initialData ? "Редактирование идеи" : "Новая идея фотосессии"}
        description={metaLine}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => requestNavigation(() => router.push("/admin/ideas"))}
            >
              Назад
            </Button>
            <Button variant="outline" onClick={() => void save()}>
              Сохранить
            </Button>

            {isArchived ? (
              <Button
                onClick={async () => {
                  const restored = await restoreMutation.mutateAsync();
                  setStatus(restored.status);
                }}
                disabled={restoreMutation.isPending}
              >
                Восстановить
              </Button>
            ) : (
              <>
                {status === PhotoSessionIdeaStatus.PUBLISHED ? (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const unpublished = await unpublishMutation.mutateAsync();
                      setStatus(unpublished.status);
                    }}
                    disabled={unpublishMutation.isPending}
                  >
                    Снять с публикации
                  </Button>
                ) : (
                  <Button onClick={() => void save({ publish: true })}>
                    Опубликовать
                  </Button>
                )}

                {initialData ? (
                  <Button
                    variant="outline"
                    className="border-danger/40 text-danger hover:bg-danger/10"
                    onClick={() => setArchiveDialogOpen(true)}
                  >
                    В архив
                  </Button>
                ) : null}
              </>
            )}
          </div>
        }
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

      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-medium">Основное</h2>

        <div className="space-y-2">
          <Label htmlFor="internalName">Название в админке</Label>
          <Input
            id="internalName"
            value={internalName}
            onChange={(event) => setInternalName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="sportivnyj-minimalizm"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="h1">H1</Label>
          <Input id="h1" value={h1} onChange={(event) => setH1(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Основная категория</Label>
          <Select
            value={primaryCategoryId || "none"}
            onValueChange={(value) => setPrimaryCategoryId(value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без категории</SelectItem>
              {(categoriesQuery.data?.data ?? []).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Порядок вывода</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
          />
        </div>

        <ImageUpload
          label="Главное изображение"
          entityType={MediaEntityType.CMS}
          entityId={initialData?.id}
          value={mainImage || undefined}
          onChange={(storageKey, publicUrl) =>
            setMainImage((publicUrl ?? storageKey) as string)
          }
          onClear={() => setMainImage("")}
          previewSize="184x260"
        />

        <div className="grid gap-3 rounded-md border border-border p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Рекомендуемая</Label>
            <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isVisible">Показывать на сайте</Label>
            <Switch id="isVisible" checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">Hero</h2>

        <div className="space-y-2">
          <Label>Описание Hero (rich text HTML)</Label>
          <Textarea
            value={content.hero.description}
            onChange={(event) =>
              updateContent((next) => {
                next.hero.description = event.target.value;
              })
            }
            className="min-h-32"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>CTA текст</Label>
            <Input
              value={content.hero.cta.text}
              onChange={(event) =>
                updateContent((next) => {
                  next.hero.cta.text = event.target.value;
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>CTA ссылка</Label>
            <Input
              value={content.hero.cta.href}
              onChange={(event) =>
                updateContent((next) => {
                  next.hero.cta.href = event.target.value;
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <Label htmlFor="heroShowRating">Показывать рейтинг</Label>
          <Switch
            id="heroShowRating"
            checked={Boolean(content.hero.showRating)}
            onCheckedChange={(value) =>
              updateContent((next) => {
                next.hero.showRating = value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Рейтинг (опционально)</Label>
          <Input
            value={content.hero.rating ?? ""}
            onChange={(event) =>
              updateContent((next) => {
                next.hero.rating = event.target.value;
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {content.hero.images.map((image, index) => (
            <div key={`hero-image-${index}`} className="space-y-3 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Фото #{index + 1}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveHeroImage(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === content.hero.images.length - 1}
                    onClick={() => moveHeroImage(index, 1)}
                  >
                    ↓
                  </Button>
                </div>
              </div>

              <ImageUpload
                label="Изображение"
                entityType={MediaEntityType.CMS}
                entityId={initialData?.id}
                value={image.url || undefined}
                previewSize="184x260"
                onChange={(storageKey, publicUrl) =>
                  setHeroImageAt(index, (publicUrl ?? storageKey) as string)
                }
                onClear={() => setHeroImageAt(index, "")}
                aspectRatio="1:1"
              />

              <Input
                value={image.alt ?? ""}
                placeholder="ALT"
                onChange={(event) =>
                  updateContent((next) => {
                    next.hero.images[index].alt = event.target.value;
                  })
                }
              />
              <Input
                value={image.title ?? ""}
                placeholder="TITLE"
                onChange={(event) =>
                  updateContent((next) => {
                    next.hero.images[index].title = event.target.value;
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">Как создать (3 шага)</h2>

        <div className="space-y-2">
          <Label>Заголовок блока</Label>
          <Input
            value={content.howToCreate.title}
            onChange={(event) =>
              updateContent((next) => {
                next.howToCreate.title = event.target.value;
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {content.howToCreate.steps.map((step, index) => (
            <div key={`step-${index}`} className="space-y-2 rounded-md border border-border p-3">
              <p className="text-sm font-medium">Шаг {String(index + 1).padStart(2, "0")}</p>
              <Input
                value={step.title}
                placeholder="Заголовок"
                onChange={(event) =>
                  updateContent((next) => {
                    next.howToCreate.steps[index].title = event.target.value;
                  })
                }
              />
              <Textarea
                value={step.text}
                placeholder="Текст"
                onChange={(event) =>
                  updateContent((next) => {
                    next.howToCreate.steps[index].text = event.target.value;
                  })
                }
              />
              <Select
                value={step.palette}
                onValueChange={(value) =>
                  updateContent((next) => {
                    next.howToCreate.steps[index].palette = value;
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Палитра" />
                </SelectTrigger>
                <SelectContent>
                  {STEP_PALETTES.map((palette) => (
                    <SelectItem key={palette} value={palette}>
                      {palette}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Кнопка: текст</Label>
            <Input
              value={content.howToCreate.cta.text}
              onChange={(event) =>
                updateContent((next) => {
                  next.howToCreate.cta.text = event.target.value;
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Кнопка: ссылка</Label>
            <Input
              value={content.howToCreate.cta.href}
              onChange={(event) =>
                updateContent((next) => {
                  next.howToCreate.cta.href = event.target.value;
                })
              }
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-medium">Тренды и больше идей</h2>

        <div className="space-y-2 md:col-span-2">
          <Label>Последние ИИ-тренды: заголовок</Label>
          <Input
            value={content.trends.title}
            onChange={(event) =>
              updateContent((next) => {
                next.trends.title = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Последние ИИ-тренды: подзаголовок</Label>
          <Textarea
            value={content.trends.subtitle}
            onChange={(event) =>
              updateContent((next) => {
                next.trends.subtitle = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Кнопка трендов: текст</Label>
          <Input
            value={content.trends.cta.text}
            onChange={(event) =>
              updateContent((next) => {
                next.trends.cta.text = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Кнопка трендов: ссылка</Label>
          <Input
            value={content.trends.cta.href}
            onChange={(event) =>
              updateContent((next) => {
                next.trends.cta.href = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Больше идей: заголовок</Label>
          <Input
            value={content.moreIdeas.title}
            onChange={(event) =>
              updateContent((next) => {
                next.moreIdeas.title = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Больше идей: кнопка текст</Label>
          <Input
            value={content.moreIdeas.cta.text}
            onChange={(event) =>
              updateContent((next) => {
                next.moreIdeas.cta.text = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Больше идей: кнопка ссылка</Label>
          <Input
            value={content.moreIdeas.cta.href}
            onChange={(event) =>
              updateContent((next) => {
                next.moreIdeas.cta.href = event.target.value;
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">FAQ</h2>
          <Button
            variant="outline"
            onClick={() =>
              updateContent((next) => {
                next.faq.items.push({ question: "", answer: "" });
              })
            }
          >
            Добавить вопрос
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Заголовок FAQ</Label>
          <Input
            value={content.faq.title}
            onChange={(event) =>
              updateContent((next) => {
                next.faq.title = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-3">
          {content.faq.items.map((item, index) => (
            <div key={`faq-item-${index}`} className="space-y-2 rounded-md border border-border p-3">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => moveFaqItem(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === content.faq.items.length - 1}
                  onClick={() => moveFaqItem(index, 1)}
                >
                  ↓
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={content.faq.items.length <= 1}
                  onClick={() =>
                    updateContent((next) => {
                      next.faq.items = next.faq.items.filter((_, i) => i !== index);
                    })
                  }
                >
                  Удалить
                </Button>
              </div>

              <Input
                value={item.question}
                placeholder="Вопрос"
                onChange={(event) =>
                  updateContent((next) => {
                    next.faq.items[index].question = event.target.value;
                  })
                }
              />
              <Textarea
                value={item.answer}
                placeholder="Ответ (rich text HTML)"
                className="min-h-24"
                onChange={(event) =>
                  updateContent((next) => {
                    next.faq.items[index].answer = event.target.value;
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">Нижний CTA</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Заголовок</Label>
            <Input
              value={content.bottomCta.title}
              onChange={(event) =>
                updateContent((next) => {
                  next.bottomCta.title = event.target.value;
                })
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Текст</Label>
            <Textarea
              value={content.bottomCta.text}
              onChange={(event) =>
                updateContent((next) => {
                  next.bottomCta.text = event.target.value;
                })
              }
            />
          </div>

          <ImageUpload
            label="Иллюстрация 1"
            entityType={MediaEntityType.CMS}
            entityId={initialData?.id}
            value={content.bottomCta.images[0] || undefined}
            previewSize="184x260"
            onChange={(storageKey, publicUrl) =>
              updateContent((next) => {
                next.bottomCta.images[0] = (publicUrl ?? storageKey) as string;
              })
            }
            onClear={() =>
              updateContent((next) => {
                next.bottomCta.images[0] = "";
              })
            }
            aspectRatio="4:3"
          />

          <ImageUpload
            label="Иллюстрация 2"
            entityType={MediaEntityType.CMS}
            entityId={initialData?.id}
            value={content.bottomCta.images[1] || undefined}
            previewSize="184x260"
            onChange={(storageKey, publicUrl) =>
              updateContent((next) => {
                next.bottomCta.images[1] = (publicUrl ?? storageKey) as string;
              })
            }
            onClear={() =>
              updateContent((next) => {
                next.bottomCta.images[1] = "";
              })
            }
            aspectRatio="4:3"
          />

          <ImageUpload
            label="Иллюстрация 3 (нижняя)"
            entityType={MediaEntityType.CMS}
            entityId={initialData?.id}
            value={content.bottomCta.images[2] || undefined}
            previewSize="compact"
            onChange={(storageKey, publicUrl) =>
              updateContent((next) => {
                next.bottomCta.images[2] = (publicUrl ?? storageKey) as string;
              })
            }
            onClear={() =>
              updateContent((next) => {
                next.bottomCta.images[2] = "";
              })
            }
            aspectRatio="1:1"
          />

          <div className="space-y-2">
            <Label>Текст кнопки</Label>
            <Input
              value={content.bottomCta.button.text}
              onChange={(event) =>
                updateContent((next) => {
                  next.bottomCta.button.text = event.target.value;
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Ссылка кнопки</Label>
            <Input
              value={content.bottomCta.button.href}
              onChange={(event) =>
                updateContent((next) => {
                  next.bottomCta.button.href = event.target.value;
                })
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">SEO-текст и теги</h2>

        <div className="space-y-2">
          <Label>Заголовок SEO-блока</Label>
          <Input
            value={content.seoText.title}
            onChange={(event) =>
              updateContent((next) => {
                next.seoText.title = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Текст SEO-блока (rich text HTML)</Label>
          <Textarea
            value={content.seoText.body}
            className="min-h-40"
            onChange={(event) =>
              updateContent((next) => {
                next.seoText.body = event.target.value;
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Теги (через запятую)</Label>
          <Input
            value={seoTagsInput}
            onChange={(event) => setSeoTagsInput(event.target.value)}
            placeholder="семья, новый год, портрет"
          />
        </div>

        <div className="space-y-2">
          <Label>Типы идеи (через запятую)</Label>
          <Input
            value={ideaTypesInput}
            onChange={(event) => setIdeaTypesInput(event.target.value)}
            placeholder="место, одежда, сезон"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">SEO / Robots / Sitemap</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Canonical URL</Label>
            <Input value={canonical} onChange={(event) => setCanonical(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>SEO title</Label>
            <Input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>SEO description</Label>
            <Textarea
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>OG title</Label>
            <Input value={ogTitle} onChange={(event) => setOgTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>OG image</Label>
            <Input value={ogImage} onChange={(event) => setOgImage(event.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>OG description</Label>
            <Textarea
              value={ogDescription}
              onChange={(event) => setOgDescription(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="robotsIndex">Robots: index</Label>
            <Switch id="robotsIndex" checked={robotsIndex} onCheckedChange={setRobotsIndex} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="robotsFollow">Robots: follow</Label>
            <Switch id="robotsFollow" checked={robotsFollow} onCheckedChange={setRobotsFollow} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showInSitemap">Показывать в sitemap</Label>
            <Switch id="showInSitemap" checked={showInSitemap} onCheckedChange={setShowInSitemap} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showInMenu">Показывать в меню</Label>
            <Switch id="showInMenu" checked={showInMenu} onCheckedChange={setShowInMenu} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showInHomepage">Показывать на Главной</Label>
            <Switch id="showInHomepage" checked={showInHomepage} onCheckedChange={setShowInHomepage} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showInSearch">Показывать в поиске</Label>
            <Switch id="showInSearch" checked={showInSearch} onCheckedChange={setShowInSearch} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isAdultSensitive">Adult / Sensitive</Label>
            <Switch
              id="isAdultSensitive"
              checked={isAdultSensitive}
              onCheckedChange={setIsAdultSensitive}
            />
          </div>
          <div className="flex items-center justify-between md:col-span-2">
            <Label htmlFor="isBrandPopCulture">Brand / Pop culture</Label>
            <Switch
              id="isBrandPopCulture"
              checked={isBrandPopCulture}
              onCheckedChange={setIsBrandPopCulture}
            />
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Отправить страницу в архив?"
        description="Страница будет снята с публикации и исключена из выдачи."
        confirmLabel="Отправить в архив"
        onConfirm={() => {
          void handleArchive();
        }}
      />
      <UnsavedChangesDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onLeave={confirmNavigation}
      />
    </div>
  );
}
