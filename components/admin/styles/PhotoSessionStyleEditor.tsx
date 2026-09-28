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
  PhotoSessionStyleStatus,
  type PhotoSessionStyleContent,
  type PhotoSessionStyleResponse,
  type PhotoSessionStyleStepPalette,
} from "@/lib/api/contract";
import { apiPost } from "@/lib/api/client";
import {
  useCreatePhotoSessionStyle,
  useDeletePhotoSessionStyle,
  usePublishPhotoSessionStyle,
  useRestorePhotoSessionStyle,
  useUnpublishPhotoSessionStyle,
  useUpdatePhotoSessionStyle,
} from "@/lib/hooks/styles/usePhotoSessionStyles";
import { useCategories } from "@/lib/hooks/categories/useCategories";

interface PublishValidationContext {
  h1: string;
  slug: string;
  mainImage: string;
  primaryCategoryId: string;
  ctaText: string;
  ctaHref: string;
  content: PhotoSessionStyleContent;
  allowLegacyFiveHeroImages: boolean;
}

const STEP_PALETTES = ["purple", "blue", "green"] as const;

function createDefaultContent(): PhotoSessionStyleContent {
  return {
    styleTypes: [],
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
    },
    howGeneratorWorks: {
      title: "Как работает генератор изображений на основе ИИ от Нейрофото",
      steps: [
        { title: "", text: "", palette: "purple", image: { url: "", alt: "", title: "" } },
        { title: "", text: "", palette: "blue", image: { url: "", alt: "", title: "" } },
        { title: "", text: "", palette: "green", image: { url: "", alt: "", title: "" } },
      ],
    },
    trends: {
      title: "Последние ИИ-тренды",
      subtitle: "",
      cta: { text: "Смотреть все тренды", href: "/styles/" },
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
      image: { url: "", alt: "", title: "" },
      button: { text: "", href: "" },
    },
    seoText: {
      title: "",
      body: "",
      tags: [],
    },
  };
}

function normalizeContent(content: PhotoSessionStyleContent): PhotoSessionStyleContent {
  const fallback = createDefaultContent();
  const legacyBottomCta = content.bottomCta as PhotoSessionStyleContent["bottomCta"] & {
    images?: string[];
  };

  return {
    ...fallback,
    ...content,
    styleTypes: Array.isArray(content.styleTypes) ? content.styleTypes : [],
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
    },
    howGeneratorWorks: {
      ...fallback.howGeneratorWorks,
      ...content.howGeneratorWorks,
      steps:
        content.howGeneratorWorks?.steps && content.howGeneratorWorks.steps.length === 3
          ? content.howGeneratorWorks.steps.map((step, index) => ({
              ...fallback.howGeneratorWorks.steps[index],
              ...step,
              palette:
                step.palette === "purple" || step.palette === "blue" || step.palette === "green"
                  ? step.palette
                  : fallback.howGeneratorWorks.steps[index].palette,
              image: {
                ...fallback.howGeneratorWorks.steps[index].image,
                ...(step.image ?? {}),
              },
            }))
          : fallback.howGeneratorWorks.steps,

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
      image: content.bottomCta?.image
        ? { ...fallback.bottomCta.image, ...content.bottomCta.image }
        : legacyBottomCta.images?.[0]
          ? { ...fallback.bottomCta.image, url: legacyBottomCta.images[0] }
          : fallback.bottomCta.image,
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
  if (!ctx.ctaText.trim()) issues.push("Hero CTA: текст");
  if (!ctx.ctaHref.trim()) issues.push("Hero CTA: ссылка");

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

  if (ctx.content.howGeneratorWorks.steps.length !== 3) {
    issues.push("Как работает генератор: должно быть ровно 3 шага");
  }
  if (!ctx.content.howGeneratorWorks.title.trim()) {
    issues.push("Как работает генератор: заголовок");
  }
  if (
    ctx.content.howGeneratorWorks.steps.some(
      (step) =>
        !step.title.trim() ||
        !step.text.trim() ||
        !step.image.url.trim() ||
        !step.image.alt.trim() ||
        !step.image.title.trim(),
    )
  ) {
    issues.push(
      "Как работает генератор: заполните заголовок, текст, изображение, alt и title у всех 3 шагов",
    );
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
  if (!ctx.content.bottomCta.image.url.trim()) {
    issues.push("Нижний CTA: изображение");
  }
  if (!ctx.content.bottomCta.image.alt.trim()) {
    issues.push("Нижний CTA: ALT изображения");
  }
  if (!ctx.content.bottomCta.image.title.trim()) {
    issues.push("Нижний CTA: TITLE изображения");
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

export function PhotoSessionStyleEditor({ initialData }: { initialData?: PhotoSessionStyleResponse }) {
  const router = useRouter();

  const createMutation = useCreatePhotoSessionStyle();
  const updateMutation = useUpdatePhotoSessionStyle(initialData?.id ?? "");
  const publishMutation = usePublishPhotoSessionStyle(initialData?.id ?? "");
  const unpublishMutation = useUnpublishPhotoSessionStyle(initialData?.id ?? "");
  const restoreMutation = useRestorePhotoSessionStyle(initialData?.id ?? "");
  const deleteMutation = useDeletePhotoSessionStyle();

  const categoriesQuery = useCategories({ page: 1, pageSize: 100 });

  const [status, setStatus] = useState<PhotoSessionStyleStatus>(
    initialData?.status ?? PhotoSessionStyleStatus.DRAFT,
  );

  const [internalName, setInternalName] = useState(initialData?.internalName ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [h1, setH1] = useState(initialData?.h1 ?? "");
  const [mainImage, setMainImage] = useState(initialData?.mainImage ?? "");
  const [ctaText, setCtaText] = useState(initialData?.ctaText ?? "");
  const [ctaHref, setCtaHref] = useState(initialData?.ctaHref ?? "");
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

  const [styleTypesInput, setStyleTypesInput] = useState(
    (initialData?.content.styleTypes ?? []).join(", "),
  );
  const [seoTagsInput, setSeoTagsInput] = useState(
    (initialData?.content.seoText.tags ?? []).join(", "),
  );

  const [content, setContent] = useState<PhotoSessionStyleContent>(
    normalizeContent(initialData?.content ?? createDefaultContent()),
  );
  const allowLegacyFiveHeroImages = initialData?.content.hero.images.length === 5;

  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [publishIssues, setPublishIssues] = useState<string[]>([]);

  const isArchived = status === PhotoSessionStyleStatus.ARCHIVED;
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

  function updateContent(mutator: (next: PhotoSessionStyleContent) => void): void {
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
      styleTypes: normalizeCsv(styleTypesInput),
      seoText: {
        ...content.seoText,
        tags: normalizeCsv(seoTagsInput),
      },
    } satisfies PhotoSessionStyleContent;

    if (options?.publish) {
      const issues = getPublishIssues({
        h1,
        slug,
        mainImage,
        primaryCategoryId,
        ctaText,
        ctaHref,
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
        ctaText: ctaText || undefined,
        ctaHref: ctaHref || undefined,
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
          await apiPost(API_ROUTES.ADMIN_PHOTO_SESSION_STYLE_PUBLISH(created.id), {});
        }

        router.push(`/admin/styles/${created.id}/edit`);
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
      router.push("/admin/styles");
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
        title={initialData ? "Редактирование стиля" : "Новый стиль фотосессии"}
        description={metaLine}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => requestNavigation(() => router.push("/admin/styles"))}
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
                {status === PhotoSessionStyleStatus.PUBLISHED ? (
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
            placeholder="old-money"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="h1">H1</Label>
          <Input id="h1" value={h1} onChange={(event) => setH1(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Hero CTA текст</Label>
          <Input value={ctaText} onChange={(event) => setCtaText(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Hero CTA ссылка</Label>
          <Input value={ctaHref} onChange={(event) => setCtaHref(event.target.value)} />
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
        <h2 className="text-lg font-medium">Как работает генератор (3 шага)</h2>

        <div className="space-y-2">
          <Label>Заголовок блока</Label>
          <Input
            value={content.howGeneratorWorks.title}
            onChange={(event) =>
              updateContent((next) => {
                next.howGeneratorWorks.title = event.target.value;
              })
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {content.howGeneratorWorks.steps.map((step, index) => (
            <div key={`step-${index}`} className="space-y-2 rounded-md border border-border p-3">
              <p className="text-sm font-medium">Шаг {String(index + 1).padStart(2, "0")}</p>
              <Input
                value={step.title}
                placeholder="Заголовок"
                onChange={(event) =>
                  updateContent((next) => {
                    next.howGeneratorWorks.steps[index].title = event.target.value;
                  })
                }
              />
              <Textarea
                value={step.text}
                placeholder="Текст"
                onChange={(event) =>
                  updateContent((next) => {
                    next.howGeneratorWorks.steps[index].text = event.target.value;
                  })
                }
              />
              <ImageUpload
                label="Композиция шага"
                entityType={MediaEntityType.CMS}
                entityId={initialData?.id}
                value={step.image.url || undefined}
                aspectRatio="4:3"
                onChange={(storageKey, publicUrl) =>
                  updateContent((next) => {
                    next.howGeneratorWorks.steps[index].image.url =
                      (publicUrl ?? storageKey) as string;
                  })
                }
                onClear={() =>
                  updateContent((next) => {
                    next.howGeneratorWorks.steps[index].image.url = "";
                  })
                }
              />
              <Input
                value={step.image.alt}
                placeholder="ALT изображения"
                onChange={(event) =>
                  updateContent((next) => {
                    next.howGeneratorWorks.steps[index].image.alt = event.target.value;
                  })
                }
              />
              <Input
                value={step.image.title}
                placeholder="TITLE изображения"
                onChange={(event) =>
                  updateContent((next) => {
                    next.howGeneratorWorks.steps[index].image.title = event.target.value;
                  })
                }
              />
              <Select
                value={step.palette}
                onValueChange={(value) =>
                  updateContent((next) => {
                    if (
                      value === "purple" ||
                      value === "blue" ||
                      value === "green"
                    ) {
                      next.howGeneratorWorks.steps[index].palette =
                        value as PhotoSessionStyleStepPalette;
                    }
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
            label="Скриншот интерфейса CTA"
            entityType={MediaEntityType.CMS}
            entityId={initialData?.id}
            value={content.bottomCta.image.url || undefined}
            previewSize="auto"
            onChange={(storageKey, publicUrl) =>
              updateContent((next) => {
                next.bottomCta.image.url = (publicUrl ?? storageKey) as string;
              })
            }
            onClear={() =>
              updateContent((next) => {
                next.bottomCta.image.url = "";
              })
            }
          />

          <div className="space-y-2">
            <Label>ALT изображения</Label>
            <Input
              value={content.bottomCta.image.alt}
              onChange={(event) =>
                updateContent((next) => {
                  next.bottomCta.image.alt = event.target.value;
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>TITLE изображения</Label>
            <Input
              value={content.bottomCta.image.title}
              onChange={(event) =>
                updateContent((next) => {
                  next.bottomCta.image.title = event.target.value;
                })
              }
            />
          </div>

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
            placeholder="ретро, old money, портрет"
          />
        </div>

        <div className="space-y-2">
          <Label>Типы стиля (через запятую)</Label>
          <Input
            value={styleTypesInput}
            onChange={(event) => setStyleTypesInput(event.target.value)}
            placeholder="ретро, эпоха, кино"
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
