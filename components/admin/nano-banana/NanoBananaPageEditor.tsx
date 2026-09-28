"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { ConfirmDialog } from "@/components/admin/common/ConfirmDialog";
import {
  API_ROUTES,
  MediaEntityType,
  NanoBananaPageStatus,
  type CreateNanoBananaRequest,
  type NanoBananaContent,
  type NanoBananaImage,
  type NanoBananaPageResponse,
} from "@/lib/api/contract";
import { apiPost } from "@/lib/api/client";
import { useCategories } from "@/lib/hooks/categories/useCategories";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import {
  useCreateNanoBanana,
  useDeleteNanoBanana,
  usePublishNanoBanana,
  useRestoreNanoBanana,
  useUnpublishNanoBanana,
  useUpdateNanoBanana,
} from "@/lib/hooks/nano-banana/useNanoBananaPages";

function image(): NanoBananaImage {
  return {
    url: "",
    alt: "",
    caption: "",
    showInImageSitemap: true,
  };
}
function createContent(): NanoBananaContent {
  return {
    hero: {
      titleAccent: "",
      titlePlain: "",
      description: "",
      cta: { text: "", href: "" },
    },
    howItWorks: {
      titlePrefix: "",
      titleBrand: "Nano Banana",
      titleSuffix: "",
      description: "",
      steps: [
        { image: image(), title: "", description: "" },
        { image: image(), title: "", description: "" },
        { image: image(), title: "", description: "" },
      ],
      cta: { text: "", href: "" },
    },
    editor: {
      titleAccent: "",
      titlePlain: "",
      description: "",
      image: image(),
    },
    features: {
      title: "",
      items: [
        { image: image(), icon: "plus", title: "" },
        { image: image(), icon: "plus", title: "" },
        { image: image(), icon: "plus", title: "" },
        { image: image(), icon: "plus", title: "" },
        { image: image(), icon: "plus", title: "" },
      ],
      allToolsCta: { text: "", href: "" },
    },
    examples: {
      title: "",
      description: "",
      items: [
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
        image(),
      ],
      cta: { text: "", href: "" },
    },
    realism: {
      titleAccent: "",
      titlePlain: "",
      description: "",
      before: image(),
      after: image(),
      beforeLabel: "До",
      afterLabel: "После",
    },
    audiences: {
      title: "",
      items: [
        { image: image(), title: "", description: "" },
        { image: image(), title: "", description: "" },
        { image: image(), title: "", description: "" },
        { image: image(), title: "", description: "" },
      ],
    },
    faq: {
      title: "",
      items: [
        { question: "", answer: "" },
        { question: "", answer: "" },
        { question: "", answer: "" },
        { question: "", answer: "" },
        { question: "", answer: "" },
      ],
    },
    bottomCta: {
      images: [image(), image(), image()],
      title: "",
      description: "",
      cta: { text: "", href: "" },
    },
    seoText: {
      sections: [
        { heading: "", body: "" },
        { heading: "", body: "" },
      ],
    },
  };
}
function normalizeContent(value?: NanoBananaContent): NanoBananaContent {
  const fallback = createContent();
  if (!value) return fallback;
  return {
    ...fallback,
    ...value,
    hero: {
      ...fallback.hero,
      ...value.hero,
      cta: { ...fallback.hero.cta, ...value.hero?.cta },
    },
    howItWorks: {
      ...fallback.howItWorks,
      ...value.howItWorks,
      steps:
        value.howItWorks?.steps?.length === 3
          ? value.howItWorks.steps
          : fallback.howItWorks.steps,
      cta: { ...fallback.howItWorks.cta, ...value.howItWorks?.cta },
    },
    editor: { ...fallback.editor, ...value.editor },
    features: {
      ...fallback.features,
      ...value.features,
      items:
        value.features?.items?.length === 5
          ? value.features.items
          : fallback.features.items,
      allToolsCta: {
        ...fallback.features.allToolsCta,
        ...value.features?.allToolsCta,
      },
    },
    examples: {
      ...fallback.examples,
      ...value.examples,
      items:
        value.examples?.items?.length === 15
          ? value.examples.items
          : fallback.examples.items,
      cta: { ...fallback.examples.cta, ...value.examples?.cta },
    },
    realism: { ...fallback.realism, ...value.realism },
    audiences: {
      ...fallback.audiences,
      ...value.audiences,
      items:
        value.audiences?.items?.length === 4
          ? value.audiences.items
          : fallback.audiences.items,
    },
    faq: {
      ...fallback.faq,
      ...value.faq,
      items:
        value.faq?.items?.length >= 1
          ? value.faq.items.map((item) => ({
              question: item.question,
              answer: item.answer,
            }))
          : fallback.faq.items,
    },
    bottomCta: {
      ...fallback.bottomCta,
      ...value.bottomCta,
      images:
        value.bottomCta?.images?.length === 3
          ? value.bottomCta.images
          : fallback.bottomCta.images,
      cta: { ...fallback.bottomCta.cta, ...value.bottomCta?.cta },
    },
    seoText: {
      ...fallback.seoText,
      ...value.seoText,
      sections:
        value.seoText?.sections?.length === 2
          ? value.seoText.sections
          : fallback.seoText.sections,
    },
  };
}

function ImageFields({
  image: value,
  label,
  entityId,
  h1,
  onChange,
}: {
  image: NanoBananaImage;
  label: string;
  entityId?: string;
  h1?: string;
  onChange: (value: NanoBananaImage) => void;
}) {
  function patch(patch: Partial<NanoBananaImage>) {
    onChange({ ...value, ...patch });
  }
  return (
    <div className="space-y-2 rounded-md border border-border p-2">
      <div className="flex items-center gap-3">
        <ImageUpload
        label="Файл"
        entityType={MediaEntityType.CMS}
        entityId={entityId}
        value={value.url || undefined}
        onChange={(_key, url) => patch({ url: url ?? "" })}
        onClear={() => patch({ url: "" })}
        aspectRatio="1:1"
        previewSize="compact"
      />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <details>
        <summary className="cursor-pointer text-xs text-foreground-muted">
          Метаданные изображения
        </summary>
        <div className="mt-2 space-y-2">
      <Input
        required
        value={value.alt}
        placeholder="ALT (обязательно)"
        onChange={(event) => patch({ alt: event.target.value })}
        onBlur={() => {
          if (!value.alt.trim())
            patch({ alt: `${h1 ?? "H1"} — пример ИИ-фотосессии` });
        }}
      />
      <Input
        value={value.caption ?? ""}
        placeholder="Caption"
        onChange={(event) => patch({ caption: event.target.value })}
      />
        <div className="flex items-center justify-between">
          <Label>В image sitemap</Label>
          <Switch
            checked={value.showInImageSitemap}
            onCheckedChange={(checked) => patch({ showInImageSitemap: checked })}
          />
        </div>
        </div>
      </details>
    </div>
  );
}
function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24"
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

function validation(
  content: NanoBananaContent,
  internalName: string,
  h1: string,
  slug: string,
  mainImage: NanoBananaImage,
  canonical: string,
  hasPublishedCategories: boolean,
  primaryCategoryId: string,
): string[] {
  const issues: string[] = [];
  const required = (value: string | undefined, label: string) => {
    if (!value?.trim()) issues.push(label);
  };
  const validUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };
  required(internalName, "Основное: внутреннее название");
  required(slug, "Основное: slug");
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    issues.push("Основное: slug должен быть в kebab-case");
  required(h1, "Основное: H1");
  if (hasPublishedCategories && !primaryCategoryId)
    issues.push("Основное: основная категория обязательна");
  if (canonical && !validUrl(canonical))
    issues.push("SEO: canonical должен быть URL");
  const normalizedH1 = `${content.hero.titleAccent} ${content.hero.titlePlain}`
    .replace(/\s+/g, " ")
    .trim();
  if (normalizedH1 !== h1.replace(/\s+/g, " ").trim())
    issues.push("Основное: H1 должен совпадать с Hero accent + plain");
  if (
    !mainImage.url.trim() ||
    !validUrl(mainImage.url) ||
    !mainImage.alt.trim()
  )
    issues.push("Основное: главное изображение, URL и ALT");
  const images: NanoBananaImage[] = [
    content.editor.image,
    content.realism.before,
    content.realism.after,
    ...content.howItWorks.steps.map((x) => x.image),
    ...content.features.items.map((x) => x.image),
    ...content.examples.items,
    ...content.audiences.items.map((x) => x.image),
    ...content.bottomCta.images,
  ];
  images.forEach((item, index) => {
    if (!item.url.trim() || !validUrl(item.url) || !item.alt.trim())
      issues.push(`Изображение ${index + 1}: корректный URL и ALT`);
  });
  required(content.hero.titleAccent, "Hero: accent");
  required(content.hero.titlePlain, "Hero: plain");
  required(content.hero.description, "Hero: описание");
  required(content.hero.cta.text, "Hero: CTA текст");
  required(content.hero.cta.href, "Hero: CTA ссылка");
  required(content.howItWorks.titlePrefix, "Как работает: prefix");
  required(content.howItWorks.titleBrand, "Как работает: brand");
  required(content.howItWorks.titleSuffix, "Как работает: suffix");
  required(content.howItWorks.description, "Как работает: описание");
  required(content.howItWorks.cta.text, "Как работает: CTA текст");
  required(content.howItWorks.cta.href, "Как работает: CTA ссылка");
  required(content.editor.titleAccent, "Редактор: accent");
  required(content.editor.titlePlain, "Редактор: plain");
  required(content.editor.description, "Редактор: описание");
  required(content.features.title, "Возможности: заголовок");
  content.features.items.forEach((item, index) => {
    required(item.title, `Возможность ${index + 1}: название`);
    if (
      !["plus", "maximize", "sticker", "mask", "sparkles"].includes(item.icon)
    )
      issues.push(`Возможность ${index + 1}: недопустимая иконка`);
  });
  required(content.features.allToolsCta.text, "Возможности: CTA текст");
  required(content.features.allToolsCta.href, "Возможности: CTA ссылка");
  required(content.examples.title, "Примеры: заголовок");
  required(content.examples.description, "Примеры: описание");
  required(content.examples.cta.text, "Примеры: CTA текст");
  required(content.examples.cta.href, "Примеры: CTA ссылка");
  required(content.realism.titleAccent, "Реализм: accent");
  required(content.realism.titlePlain, "Реализм: plain");
  required(content.realism.description, "Реализм: описание");
  required(content.realism.beforeLabel, "Реализм: подпись До");
  required(content.realism.afterLabel, "Реализм: подпись После");
  required(content.audiences.title, "Аудитории: заголовок");
  content.audiences.items.forEach((item, index) => {
    required(item.title, `Аудитория ${index + 1}: заголовок`);
    required(item.description, `Аудитория ${index + 1}: описание`);
  });
  required(content.faq.title, "FAQ: заголовок");
content.faq.items.forEach((item, index) => {
    required(item.question, `FAQ ${index + 1}: вопрос`);
    required(item.answer, `FAQ ${index + 1}: ответ`);
  });
  if (!content.faq.items[0]?.question.trim())
    issues.push("FAQ: первый вопрос обязателен");
  required(content.bottomCta.title, "Нижний CTA: заголовок");
  required(content.bottomCta.description, "Нижний CTA: описание");
  required(content.bottomCta.cta.text, "Нижний CTA: текст");
  required(content.bottomCta.cta.href, "Нижний CTA: ссылка");
  content.seoText.sections.forEach((item, index) => {
    required(item.heading, `SEO text ${index + 1}: заголовок`);
    required(item.body, `SEO text ${index + 1}: текст`);
  });
  if (
    content.howItWorks.steps.length !== 3 ||
    content.features.items.length !== 5 ||
    content.examples.items.length !== 15 ||
    content.audiences.items.length !== 4 ||

    content.bottomCta.images.length !== 3 ||
    content.seoText.sections.length !== 2
  )
    issues.push(
      "Структура content JSON не соответствует фиксированным размерам",
    );
  return issues;
}

export function NanoBananaPageEditor({
  initialData,
}: {
  initialData?: NanoBananaPageResponse;
}) {
  const router = useRouter();
  const createMutation = useCreateNanoBanana();
  const updateMutation = useUpdateNanoBanana(initialData?.id ?? "");
  const publishMutation = usePublishNanoBanana(initialData?.id ?? "");
  const unpublishMutation = useUnpublishNanoBanana(initialData?.id ?? "");
  const restoreMutation = useRestoreNanoBanana(initialData?.id ?? "");
  const deleteMutation = useDeleteNanoBanana();
  const categoriesQuery = useCategories({ page: 1, pageSize: 100 });
  const [status, setStatus] = useState(
    initialData?.status ?? NanoBananaPageStatus.DRAFT,
  );
  const [internalName, setInternalName] = useState(
    initialData?.internalName ?? "",
  );
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [h1, setH1] = useState(initialData?.h1 ?? "");
  const [mainImage, setMainImage] = useState<NanoBananaImage>(
    initialData?.mainImage ?? image(),
  );
  const [content, setContent] = useState<NanoBananaContent>(() =>
    normalizeContent(initialData?.content),
  );
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    initialData?.primaryCategoryId ?? "",
  );
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? false);
  const [robotsIndex, setRobotsIndex] = useState(
    initialData?.robotsIndex ?? true,
  );
  const [robotsFollow, setRobotsFollow] = useState(
    initialData?.robotsFollow ?? true,
  );
  const [showInSitemap, setShowInSitemap] = useState(
    initialData?.showInSitemap ?? true,
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
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archived = status === NanoBananaPageStatus.ARCHIVED;
  const patchContent = (mutator: (next: NanoBananaContent) => void) =>
    setContent((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      return next;
    });
  const savePayload: CreateNanoBananaRequest = {
    internalName,
    slug,
    h1,
    content,
    mainImage,
    primaryCategoryId: primaryCategoryId || undefined,
    sortOrder,
    featured,
    isVisible,
    robotsIndex,
    robotsFollow,
    showInSitemap,
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
    ogTitle: ogTitle || undefined,
    ogDescription: ogDescription || undefined,
    ogImage: ogImage || undefined,
    canonical: canonical || undefined,
  };
  const currentSnapshot = JSON.stringify(savePayload);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => currentSnapshot);
  const isDirty = savedSnapshot !== currentSnapshot;
  const {
    dialogOpen,
    requestNavigation,
    closeDialog,
    confirmNavigation,
  } = useUnsavedChanges(isDirty);
  async function save(publish = false) {
    setError(null);
    const nextIssues = validation(
      content,
      internalName,
      h1,
      slug,
      mainImage,
      canonical,
      (categoriesQuery.data?.data.length ?? 0) > 0,
      primaryCategoryId,
    );
    setIssues(nextIssues);
    if (nextIssues.length) return;
    try {
      if (!initialData) {
        const created = await createMutation.mutateAsync(savePayload);
        if (publish)
          await apiPost(API_ROUTES.ADMIN_NANO_BANANA_PUBLISH(created.id), {});
        router.push(`/admin/nano-banana/${created.id}/edit`);
        return;
      }
      const updated = await updateMutation.mutateAsync(savePayload);
      setSavedSnapshot(currentSnapshot);
      setStatus(updated.status);
      if (publish) setStatus((await publishMutation.mutateAsync()).status);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Не удалось сохранить страницу",
      );
    }
  }
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    restoreMutation.isPending;
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={
          initialData
            ? "Редактирование Nano Banana"
            : "Новая страница Nano Banana"
        }
        description={
          initialData
            ? `Статус: ${status}`
            : "Заполните все обязательные поля перед публикацией"
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                requestNavigation(() => router.push("/admin/nano-banana"))
              }
            >
              Назад
            </Button>
            <Button
              variant="outline"
              onClick={() => void save()}
              disabled={busy}
            >
              Сохранить
            </Button>
            {archived ? (
              <Button
                onClick={() =>
                  void restoreMutation
                    .mutateAsync()
                    .then((page) => setStatus(page.status))
                }
                disabled={busy}
              >
                Восстановить
              </Button>
            ) : status === NanoBananaPageStatus.PUBLISHED ? (
              <Button
                variant="outline"
                onClick={() =>
                  void unpublishMutation
                    .mutateAsync()
                    .then((page) => setStatus(page.status))
                }
                disabled={busy}
              >
                Снять с публикации
              </Button>
            ) : (
              <Button onClick={() => void save(true)} disabled={busy}>
                Опубликовать
              </Button>
            )}
            {initialData && !archived ? (
              <Button
                variant="outline"
                className="text-danger"
                onClick={() => setArchiveOpen(true)}
              >
                В архив
              </Button>
            ) : null}
          </div>
        }
      />
      {error ? (
        <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-danger">
          {error}
        </p>
      ) : null}
      {issues.length ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-warning">
          <p className="font-medium">Нельзя опубликовать:</p>
          <ul className="list-disc pl-5">
            {issues.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-medium">1. Основное</h2>
        <TextField
          label="Внутреннее название"
          value={internalName}
          onChange={setInternalName}
        />
        <TextField label="Slug" value={slug} onChange={setSlug} />
        <TextField label="H1" value={h1} onChange={setH1} />
        <div className="space-y-2">
          <Label>Основная категория</Label>
          <Select
            value={primaryCategoryId || "none"}
            onValueChange={(value) =>
              setPrimaryCategoryId(value === "none" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Без категории" />
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
        <ImageFields
          h1={h1}
          label="Главное изображение"
          image={mainImage}
          entityId={initialData?.id}
          onChange={setMainImage}
        />
        <TextField
          label="Порядок"
          value={String(sortOrder)}
          onChange={(value) => setSortOrder(Number(value) || 0)}
        />
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex justify-between">
            <Label>Featured</Label>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
          <div className="flex justify-between">
            <Label>Показывать на сайте</Label>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">2. Hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Accent"
            value={content.hero.titleAccent}
            onChange={(value) => {
              patchContent((next) => {
                next.hero.titleAccent = value;
              });
              setH1(
                `${value} ${content.hero.titlePlain}`
                  .replace(/\s+/g, " ")
                  .trim(),
              );
            }}
          />
          <TextField
            label="Plain"
            value={content.hero.titlePlain}
            onChange={(value) => {
              patchContent((next) => {
                next.hero.titlePlain = value;
              });
              setH1(
                `${content.hero.titleAccent} ${value}`
                  .replace(/\s+/g, " ")
                  .trim(),
              );
            }}
          />
          <TextField
            label="Описание"
            value={content.hero.description}
            onChange={(value) =>
              patchContent((next) => {
                next.hero.description = value;
              })
            }
            multiline
          />
          <TextField
            label="CTA текст"
            value={content.hero.cta.text}
            onChange={(value) =>
              patchContent((next) => {
                next.hero.cta.text = value;
              })
            }
          />
          <TextField
            label="CTA ссылка"
            value={content.hero.cta.href}
            onChange={(value) =>
              patchContent((next) => {
                next.hero.cta.href = value;
              })
            }
          />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">3. Как работает — 3 карточки</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {content.howItWorks.steps.map((step, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-border p-3"
            >
              <ImageFields
                h1={h1}
                label={`Шаг ${index + 1}`}
                image={step.image}
                entityId={initialData?.id}
                onChange={(value) =>
                  patchContent((next) => {
                    next.howItWorks.steps[index].image = value;
                  })
                }
              />
              <TextField
                label="Заголовок"
                value={step.title}
                onChange={(value) =>
                  patchContent((next) => {
                    next.howItWorks.steps[index].title = value;
                  })
                }
              />
              <TextField
                label="Описание"
                value={step.description}
                onChange={(value) =>
                  patchContent((next) => {
                    next.howItWorks.steps[index].description = value;
                  })
                }
                multiline
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Заголовок: prefix"
            value={content.howItWorks.titlePrefix}
            onChange={(value) =>
              patchContent((next) => {
                next.howItWorks.titlePrefix = value;
              })
            }
          />
          <TextField
            label="Заголовок: suffix"
            value={content.howItWorks.titleSuffix}
            onChange={(value) =>
              patchContent((next) => {
                next.howItWorks.titleSuffix = value;
              })
            }
          />
          <TextField
            label="Описание блока"
            value={content.howItWorks.description}
            onChange={(value) =>
              patchContent((next) => {
                next.howItWorks.description = value;
              })
            }
            multiline
          />
          <TextField
            label="CTA"
            value={content.howItWorks.cta.text}
            onChange={(value) =>
              patchContent((next) => {
                next.howItWorks.cta.text = value;
              })
            }
          />
          <TextField
            label="CTA href"
            value={content.howItWorks.cta.href}
            onChange={(value) =>
              patchContent((next) => {
                next.howItWorks.cta.href = value;
              })
            }
          />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">4. Редактор</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Accent"
            value={content.editor.titleAccent}
            onChange={(value) =>
              patchContent((next) => {
                next.editor.titleAccent = value;
              })
            }
          />
          <TextField
            label="Plain"
            value={content.editor.titlePlain}
            onChange={(value) =>
              patchContent((next) => {
                next.editor.titlePlain = value;
              })
            }
          />
          <TextField
            label="Описание"
            value={content.editor.description}
            onChange={(value) =>
              patchContent((next) => {
                next.editor.description = value;
              })
            }
            multiline
          />
        </div>
        <ImageFields
          h1={h1}
          label="Изображение редактора"
          image={content.editor.image}
          entityId={initialData?.id}
          onChange={(value) =>
            patchContent((next) => {
              next.editor.image = value;
            })
          }
        />
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">5. Возможности — 5 карточек</h2>
        <TextField
          label="Заголовок"
          value={content.features.title}
          onChange={(value) =>
            patchContent((next) => {
              next.features.title = value;
            })
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {content.features.items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-border p-3"
            >
              <ImageFields
                h1={h1}
                label={`Возможность ${index + 1}`}
                image={item.image}
                entityId={initialData?.id}
                onChange={(value) =>
                  patchContent((next) => {
                    next.features.items[index].image = value;
                  })
                }
              />
              <TextField
                label="Название"
                value={item.title}
                onChange={(value) =>
                  patchContent((next) => {
                    next.features.items[index].title = value;
                  })
                }
              />
              <div className="space-y-2">
                <Label>Иконка</Label>
                <Select
                  value={item.icon}
                  onValueChange={(value) =>
                    patchContent((next) => {
                      next.features.items[index].icon =
                        value as (typeof next.features.items)[number]["icon"];
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plus">plus</SelectItem>
                    <SelectItem value="maximize">maximize</SelectItem>
                    <SelectItem value="sticker">sticker</SelectItem>
                    <SelectItem value="mask">mask</SelectItem>
                    <SelectItem value="sparkles">sparkles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="CTA"
            value={content.features.allToolsCta.text}
            onChange={(value) =>
              patchContent((next) => {
                next.features.allToolsCta.text = value;
              })
            }
          />
          <TextField
            label="CTA href"
            value={content.features.allToolsCta.href}
            onChange={(value) =>
              patchContent((next) => {
                next.features.allToolsCta.href = value;
              })
            }
          />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">6. Примеры — 15 изображений</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {content.examples.items.map((item, index) => (
            <ImageFields
              key={index}
              h1={h1}
              label={`Пример ${index + 1}`}
              image={item}
              entityId={initialData?.id}
              onChange={(value) =>
                patchContent((next) => {
                  next.examples.items[index] = value;
                })
              }
            />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Заголовок"
            value={content.examples.title}
            onChange={(value) =>
              patchContent((next) => {
                next.examples.title = value;
              })
            }
          />
          <TextField
            label="Описание"
            value={content.examples.description}
            onChange={(value) =>
              patchContent((next) => {
                next.examples.description = value;
              })
            }
            multiline
          />
          <TextField
            label="CTA"
            value={content.examples.cta.text}
            onChange={(value) =>
              patchContent((next) => {
                next.examples.cta.text = value;
              })
            }
          />
          <TextField
            label="CTA href"
            value={content.examples.cta.href}
            onChange={(value) =>
              patchContent((next) => {
                next.examples.cta.href = value;
              })
            }
          />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">7. Реализм</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Accent"
            value={content.realism.titleAccent}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.titleAccent = value;
              })
            }
          />
          <TextField
            label="Plain"
            value={content.realism.titlePlain}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.titlePlain = value;
              })
            }
          />
          <TextField
            label="Описание"
            value={content.realism.description}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.description = value;
              })
            }
            multiline
          />
          <TextField
            label="Подпись До"
            value={content.realism.beforeLabel}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.beforeLabel = value;
              })
            }
          />
          <TextField
            label="Подпись После"
            value={content.realism.afterLabel}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.afterLabel = value;
              })
            }
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ImageFields
            h1={h1}
            label="До"
            image={content.realism.before}
            entityId={initialData?.id}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.before = value;
              })
            }
          />
          <ImageFields
            h1={h1}
            label="После"
            image={content.realism.after}
            entityId={initialData?.id}
            onChange={(value) =>
              patchContent((next) => {
                next.realism.after = value;
              })
            }
          />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">8. Аудитории — 4 карточки</h2>
        <TextField
          label="Заголовок"
          value={content.audiences.title}
          onChange={(value) =>
            patchContent((next) => {
              next.audiences.title = value;
            })
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {content.audiences.items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-md border border-border p-3"
            >
              <ImageFields
                h1={h1}
                label={`Аудитория ${index + 1}`}
                image={item.image}
                entityId={initialData?.id}
                onChange={(value) =>
                  patchContent((next) => {
                    next.audiences.items[index].image = value;
                  })
                }
              />
              <TextField
                label="Заголовок"
                value={item.title}
                onChange={(value) =>
                  patchContent((next) => {
                    next.audiences.items[index].title = value;
                  })
                }
              />
              <TextField
                label="Описание"
                value={item.description}
                onChange={(value) =>
                  patchContent((next) => {
                    next.audiences.items[index].description = value;
                  })
                }
                multiline
              />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">9. FAQ — динамический список</h2>
        <TextField
          label="Заголовок"
          value={content.faq.title}
          onChange={(value) =>
            patchContent((next) => {
              next.faq.title = value;
            })
          }
        />
        <div className="space-y-3">
          {content.faq.items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[auto_1fr_1fr]"
            >

              <TextField
                label={`Вопрос ${index + 1}`}
                value={item.question}
                onChange={(value) =>
                  patchContent((next) => {
                    next.faq.items[index].question = value;
                  })
                }
              />
              <TextField
                label="Ответ"
                value={item.answer}
                onChange={(value) =>
                  patchContent((next) => {
                    next.faq.items[index].answer = value;
                  })
                }
                multiline
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                patchContent((next) => {
                  next.faq.items.push({
                    question: "",
                    answer: "",
                  });
                })
              }
            >
              Добавить вопрос
            </Button>
            {content.faq.items.length > 1 ? (
              <Button
                variant="ghost"
                onClick={() =>
                  patchContent((next) => {
                    next.faq.items.pop();
                  })
                }
              >
                Удалить последний
              </Button>
            ) : null}
          </div>
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">10. Нижний CTA — 3 изображения</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {content.bottomCta.images.map((item, index) => (
            <ImageFields
              key={index}
              h1={h1}
              label={`CTA изображение ${index + 1}`}
              image={item}
              entityId={initialData?.id}
              onChange={(value) =>
                patchContent((next) => {
                  next.bottomCta.images[index] = value;
                })
              }
            />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Заголовок"
            value={content.bottomCta.title}
            onChange={(value) =>
              patchContent((next) => {
                next.bottomCta.title = value;
              })
            }
          />
          <TextField
            label="Описание"
            value={content.bottomCta.description}
            onChange={(value) =>
              patchContent((next) => {
                next.bottomCta.description = value;
              })
            }
            multiline
          />
          <TextField
            label="CTA"
            value={content.bottomCta.cta.text}
            onChange={(value) =>
              patchContent((next) => {
                next.bottomCta.cta.text = value;
              })
            }
          />
          <TextField
            label="CTA href"
            value={content.bottomCta.cta.href}
            onChange={(value) =>
              patchContent((next) => {
                next.bottomCta.cta.href = value;
              })
            }
          />
        </div>
      </section>
      <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-medium">11. SEO text</h2>
        {content.seoText.sections.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-2"
          >
            <TextField
              label={`Заголовок ${index + 1}`}
              value={item.heading}
              onChange={(value) =>
                patchContent((next) => {
                  next.seoText.sections[index].heading = value;
                })
              }
            />
            <TextField
              label="Текст"
              value={item.body}
              onChange={(value) =>
                patchContent((next) => {
                  next.seoText.sections[index].body = value;
                })
              }
              multiline
            />
          </div>
        ))}
      </section>
      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-2">
        <h2 className="md:col-span-2 text-lg font-medium">
          12. SEO / Robots / Sitemap
        </h2>
        <TextField
          label="Canonical"
          value={canonical}
          onChange={setCanonical}
        />
        <TextField label="SEO title" value={seoTitle} onChange={setSeoTitle} />
        <TextField
          label="SEO description"
          value={seoDescription}
          onChange={setSeoDescription}
          multiline
        />
        <TextField label="OG title" value={ogTitle} onChange={setOgTitle} />
        <TextField
          label="OG description"
          value={ogDescription}
          onChange={setOgDescription}
          multiline
        />
        <TextField label="OG image URL" value={ogImage} onChange={setOgImage} />
        <div className="space-y-3 rounded-md border border-border p-3">
          <div className="flex justify-between">
            <Label>Robots index</Label>
            <Switch checked={robotsIndex} onCheckedChange={setRobotsIndex} />
          </div>
          <div className="flex justify-between">
            <Label>Robots follow</Label>
            <Switch checked={robotsFollow} onCheckedChange={setRobotsFollow} />
          </div>
          <div className="flex justify-between">
            <Label>Показывать в sitemap</Label>
            <Switch
              checked={showInSitemap}
              onCheckedChange={setShowInSitemap}
            />
          </div>
        </div>
      </section>
      <UnsavedChangesDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        onLeave={confirmNavigation}
      />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Архивировать страницу?"
        description="Страница перестанет быть доступна публично."
        confirmLabel="В архив"
        onConfirm={() => {
          if (!initialData) return;
          void deleteMutation
            .mutateAsync(initialData.id)
            .then(() => router.push("/admin/nano-banana"));
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
