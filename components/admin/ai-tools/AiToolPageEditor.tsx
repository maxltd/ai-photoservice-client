"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import {
  API_ROUTES,
  AiToolPageStatus,
  MediaEntityType,
  type AiToolImage,
  type AiToolPageContent,
  type AiToolPageResponse,
  type BlogArticleResponse,
  type CreateAiToolPageRequest,
} from "@/lib/api/contract";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";

type FormState = Omit<CreateAiToolPageRequest, "content"> & {
  content: AiToolPageContent;
  relationIds: string[];
};

const image = (): AiToolImage => ({ url: "", alt: "", title: "" });
const initialContent = (): AiToolPageContent => ({
  hero: {
    title: "",
    description: "",
    cta: { text: "", href: "/app/create" },
    images: [image()],
  },
  gallery: { title: "", description: "", items: [] },
  howTo: {
    title: "",
    steps: [
      { title: "", text: "" },
      { title: "", text: "" },
      { title: "", text: "" },
    ],
    cta: { text: "", href: "/app/create" },
  },
  usage: {
    title: "",
    description: "",
    items: [{ title: "", text: "" }],
    image: image(),
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
  features: {
    title: "",
    items: [
      { title: "", text: "" },
      { title: "", text: "" },
      { title: "", text: "" },
      { title: "", text: "" },
    ],
  },
  tryLook: { title: "" },
  faq: { title: "", items: [{ question: "", answer: "" }] },
  bottomCta: {
    title: "",
    text: "",
    images: ["", "", ""],
    button: { text: "", href: "/app/create" },
  },
  seoText: { title: "", body: "", tags: [] },
});

function normalizeContent(content?: AiToolPageContent): AiToolPageContent {
  const fallback = initialContent();
  return {
    ...fallback,
    ...content,
    hero: {
      ...fallback.hero,
      ...content?.hero,
      cta: { ...fallback.hero.cta, ...content?.hero?.cta },
      images: content?.hero?.images?.length
        ? content.hero.images
        : fallback.hero.images,
    },
    gallery: { ...fallback.gallery, ...content?.gallery },
    howTo: {
      ...fallback.howTo,
      ...content?.howTo,
      cta: { ...fallback.howTo.cta, ...content?.howTo?.cta },
      steps: content?.howTo?.steps?.length
        ? content.howTo.steps
        : fallback.howTo.steps,
    },
    usage: {
      ...fallback.usage,
      ...content?.usage,
      image: { ...fallback.usage.image, ...content?.usage?.image },
      items: content?.usage?.items?.length
        ? content.usage.items
        : fallback.usage.items,
    },
    realism: {
      ...fallback.realism,
      ...content?.realism,
      before: { ...fallback.realism.before, ...content?.realism?.before },
      after: { ...fallback.realism.after, ...content?.realism?.after },
    },
    features: {
      ...fallback.features,
      ...content?.features,
      items: content?.features?.items?.length
        ? content.features.items
        : fallback.features.items,
    },
    tryLook: { title: content?.tryLook?.title ?? fallback.tryLook?.title ?? "" },
    faq: {
      ...fallback.faq,
      ...content?.faq,
      items: content?.faq?.items?.length
        ? content.faq.items
        : fallback.faq.items,
    },
    bottomCta: {
      ...fallback.bottomCta,
      ...content?.bottomCta,
      button: { ...fallback.bottomCta.button, ...content?.bottomCta?.button },
    },
    seoText: { ...fallback.seoText, ...content?.seoText },
  };
}

function ImageFields({
  value,
  onChange,
  entityId,
  label,
}: {
  value: AiToolImage;
  onChange: (value: AiToolImage) => void;
  entityId?: string;
  label: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[220px_1fr]">
      <ImageUpload
        value={value.url}
        entityType={MediaEntityType.AI_TOOL}
        entityId={entityId}
        label={label}
        aspectRatio="4:3"
        onChange={(_key, url) => onChange({ ...value, url: url ?? "" })}
        onClear={() => onChange({ ...value, url: "" })}
      />
      <div className="space-y-3">
        <Input
          placeholder="Alt — обязательно"
          value={value.alt}
          onChange={(event) => onChange({ ...value, alt: event.target.value })}
          required
        />
        <Input
          placeholder="Title — опционально"
          value={value.title ?? ""}
          onChange={(event) =>
            onChange({ ...value, title: event.target.value })
          }
        />
      </div>
    </div>
  );
}

export function AiToolPageEditor({
  initial,
}: {
  initial?: AiToolPageResponse;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishRequested, setPublishRequested] = useState(false);
  const [status, setStatus] = useState<AiToolPageStatus>(
    initial?.status ?? AiToolPageStatus.DRAFT,
  );
  const [articles, setArticles] = useState<BlogArticleResponse[]>([]);
  const [value, setValue] = useState<FormState>(() => ({
    internalName: initial?.internalName ?? "",
    slug: initial?.slug ?? "",
    h1: initial?.h1 ?? "",
    mainImage: initial?.mainImage ?? image(),
    content: normalizeContent(initial?.content),
    relationIds:
      initial?.relations.map((relation) => relation.blogArticleId) ?? [],
    seoTitle: initial?.seoTitle ?? undefined,
    seoDescription: initial?.seoDescription ?? undefined,
    canonical: initial?.canonical ?? undefined,
    ogTitle: initial?.ogTitle ?? undefined,
    ogDescription: initial?.ogDescription ?? undefined,
    ogImage: initial?.ogImage ?? undefined,
    robotsIndex: initial?.robotsIndex ?? true,
    robotsFollow: initial?.robotsFollow ?? true,
    showInSitemap: initial?.showInSitemap ?? true,
    showInMenu: initial?.showInMenu ?? false,
    showInSearch: initial?.showInSearch ?? true,
  }));
  const [seoTagsText, setSeoTagsText] = useState(
    () => initial?.content?.seoText?.tags?.join(", ") ?? "",
  );
  useEffect(() => {
    void apiGet<{ data: BlogArticleResponse[] }>(API_ROUTES.ADMIN_BLOG, {
      page: 1,
      pageSize: 100,
      status: "PUBLISHED",
    })
      .then((result) => setArticles(result.data))
      .catch(() => setArticles([]));
  }, []);
  const setContent = (
    next: (content: AiToolPageContent) => AiToolPageContent,
  ) => setValue((current) => ({ ...current, content: next(current.content) }));
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setSaving(true);
    try {
      const { relationIds, ...payload } = value;
      const shouldPublish = publishRequested;
      setPublishRequested(false);
      const content = {
        ...payload.content,
        gallery: {
          ...payload.content.gallery,
          items: payload.content.hero.images,
        },
      };
      const response = (await (initial ? apiPatch : apiPost)(
        initial
          ? API_ROUTES.ADMIN_AI_TOOL_PAGE_BY_ID(initial.id)
          : API_ROUTES.ADMIN_AI_TOOL_PAGES,
        {
          ...payload,
          content,
          relations: relationIds.map((blogArticleId, sortOrder) => ({
            blogArticleId,
            sortOrder,
          })),
        },
      )) as AiToolPageResponse | { data: AiToolPageResponse };
      const saved = "data" in response ? response.data : response;
      if (shouldPublish) {
        const published = await apiPost<AiToolPageResponse>(
          API_ROUTES.ADMIN_AI_TOOL_PAGE_PUBLISH(saved.id),
          {},
        );
        setStatus(published.status);
      }
      router.push(`/admin/ai-tools/pages/${saved.id}/edit`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-8 p-6">
      <PageHeader
        title={
          initial ? "Редактирование AI-инструмента" : "Новый AI-инструмент"
        }
        description={
          initial
            ? `Статус: ${status} • Обновлено: ${new Date(initial.updatedAt).toLocaleString()}`
            : "Новая страница"
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/ai-tools")}
            >
              Назад
            </Button>
            <Button type="submit" variant="outline" disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </Button>
            {initial && status === AiToolPageStatus.ARCHIVED ? (
              <Button
                type="button"
                onClick={async () => {
                  const updated = await apiPost<AiToolPageResponse>(
                    API_ROUTES.ADMIN_AI_TOOL_PAGE_RESTORE(initial.id),
                    {},
                  );
                  setStatus(updated.status);
                }}
              >
                Восстановить
              </Button>
            ) : initial && status === AiToolPageStatus.PUBLISHED ? (
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const updated = await apiPost<AiToolPageResponse>(
                    API_ROUTES.ADMIN_AI_TOOL_PAGE_UNPUBLISH(initial.id),
                    {},
                  );
                  setStatus(updated.status);
                }}
              >
                Снять с публикации
              </Button>
            ) : (
              <Button type="submit" onClick={() => setPublishRequested(true)}>
                Опубликовать
              </Button>
            )}
            {initial ? (
              <Button
                type="button"
                variant="outline"
                className="border-danger/40 text-danger"
                onClick={async () => {
                  await apiDelete(
                    API_ROUTES.ADMIN_AI_TOOL_PAGE_BY_ID(initial.id),
                  );
                  router.push("/admin/ai-tools");
                }}
              >
                В архив
              </Button>
            ) : null}
          </div>
        }
      />
      <p className="text-sm text-foreground-muted">
        Все изображения требуют Alt-текст.
      </p>
      <section className="grid gap-3 rounded-xl border border-border bg-surface p-5 md:grid-cols-3">
        <Input
          placeholder="Внутреннее имя"
          value={value.internalName}
          onChange={(event) =>
            setValue({ ...value, internalName: event.target.value })
          }
          required
        />
        <Input
          placeholder="Slug"
          value={value.slug}
          onChange={(event) => setValue({ ...value, slug: event.target.value })}
          required
        />
        <Input
          placeholder="H1"
          value={value.h1}
          onChange={(event) => setValue({ ...value, h1: event.target.value })}
          required
        />
      </section>
      <ImageFields
        label="Главное изображение"
        value={value.mainImage}
        entityId={initial?.id}
        onChange={(mainImage) => setValue({ ...value, mainImage })}
      />
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Hero</h2>
        <Input
          placeholder="Заголовок hero"
          value={value.content.hero.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              hero: { ...content.hero, title: event.target.value },
            }))
          }
        />
        <Textarea
          placeholder="Описание hero"
          value={value.content.hero.description}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              hero: { ...content.hero, description: event.target.value },
            }))
          }
        />
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm">Показывать рейтинг</span>
          <Switch
            checked={Boolean(value.content.hero.showRating)}
            onCheckedChange={(showRating) =>
              setContent((content) => ({
                ...content,
                hero: { ...content.hero, showRating },
              }))
            }
          />
        </div>
        <Input
          placeholder="Рейтинг"
          value={value.content.hero.rating ?? ""}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              hero: { ...content.hero, rating: event.target.value },
            }))
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="CTA текст"
            value={value.content.hero.cta.text}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                hero: {
                  ...content.hero,
                  cta: { ...content.hero.cta, text: event.target.value },
                },
              }))
            }
          />
          <Input
            placeholder="CTA URL"
            value={value.content.hero.cta.href}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                hero: {
                  ...content.hero,
                  cta: { ...content.hero.cta, href: event.target.value },
                },
              }))
            }
          />
        </div>
        {value.content.hero.images.map((item, index) => (
          <ImageFields
            key={index}
            label={`Hero изображение ${index + 1}`}
            value={item}
            entityId={initial?.id}
            onChange={(next) =>
              setContent((content) => ({
                ...content,
                hero: {
                  ...content.hero,
                  images: content.hero.images.map((imageItem, imageIndex) =>
                    imageIndex === index ? next : imageItem,
                  ),
                },
              }))
            }
          />
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={value.content.hero.images.length >= 10}
          onClick={() =>
            setContent((content) => ({
              ...content,
              hero: {
                ...content.hero,
                images: [...content.hero.images, image()],
              },
            }))
          }
        >
          Добавить изображение hero
        </Button>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Gallery</h2>
        <Input
          placeholder="Заголовок"
          value={value.content.gallery.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              gallery: { ...content.gallery, title: event.target.value },
            }))
          }
        />
        <Textarea
          placeholder="Описание"
          value={value.content.gallery.description}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              gallery: { ...content.gallery, description: event.target.value },
            }))
          }
        />
        <p className="text-sm text-foreground-muted">
          Gallery использует те же изображения, что и Hero.
        </p>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Как это работает</h2>
        <Input
          placeholder="Заголовок"
          value={value.content.howTo.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              howTo: { ...content.howTo, title: event.target.value },
            }))
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="CTA текст"
            value={value.content.howTo.cta.text}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                howTo: {
                  ...content.howTo,
                  cta: { ...content.howTo.cta, text: event.target.value },
                },
              }))
            }
          />
          <Input
            placeholder="CTA URL"
            value={value.content.howTo.cta.href}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                howTo: {
                  ...content.howTo,
                  cta: { ...content.howTo.cta, href: event.target.value },
                },
              }))
            }
          />
        </div>
        {value.content.howTo.steps.map((step, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder={`Шаг ${index + 1}`}
              value={step.title}
              onChange={(event) =>
                setContent((content) => ({
                  ...content,
                  howTo: {
                    ...content.howTo,
                    steps: content.howTo.steps.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, title: event.target.value }
                        : item,
                    ),
                  },
                }))
              }
            />
            <Textarea
              placeholder="Текст шага"
              value={step.text}
              onChange={(event) =>
                setContent((content) => ({
                  ...content,
                  howTo: {
                    ...content.howTo,
                    steps: content.howTo.steps.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, text: event.target.value }
                        : item,
                    ),
                  },
                }))
              }
            />
          </div>
        ))}
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Usage</h2>
        <Input
          placeholder="Заголовок"
          value={value.content.usage.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              usage: { ...content.usage, title: event.target.value },
            }))
          }
        />
        <Textarea
          placeholder="Описание"
          value={value.content.usage.description}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              usage: { ...content.usage, description: event.target.value },
            }))
          }
        />
        <ImageFields
          label="Usage изображение"
          value={value.content.usage.image}
          entityId={initial?.id}
          onChange={(imageValue) =>
            setContent((content) => ({
              ...content,
              usage: { ...content.usage, image: imageValue },
            }))
          }
        />
        {value.content.usage.items.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Заголовок пункта"
              value={item.title}
              onChange={(event) =>
                setContent((content) => ({
                  ...content,
                  usage: {
                    ...content.usage,
                    items: content.usage.items.map((current, currentIndex) =>
                      currentIndex === index
                        ? { ...current, title: event.target.value }
                        : current,
                    ),
                  },
                }))
              }
            />
            <Textarea
              placeholder="Текст пункта"
              value={item.text}
              onChange={(event) =>
                setContent((content) => ({
                  ...content,
                  usage: {
                    ...content.usage,
                    items: content.usage.items.map((current, currentIndex) =>
                      currentIndex === index
                        ? { ...current, text: event.target.value }
                        : current,
                    ),
                  },
                }))
              }
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={value.content.usage.items.length >= 6}
            onClick={() =>
              setContent((content) => ({
                ...content,
                usage: {
                  ...content.usage,
                  items: [...content.usage.items, { title: "", text: "" }],
                },
              }))
            }
          >
            Добавить пункт
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={value.content.usage.items.length <= 1}
            onClick={() =>
              setContent((content) => ({
                ...content,
                usage: {
                  ...content.usage,
                  items: content.usage.items.slice(0, -1),
                },
              }))
            }
          >
            Удалить последний
          </Button>
        </div>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Realism</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Акцент заголовка"
            value={value.content.realism.titleAccent}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                realism: {
                  ...content.realism,
                  titleAccent: event.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Обычный заголовок"
            value={value.content.realism.titlePlain}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                realism: { ...content.realism, titlePlain: event.target.value },
              }))
            }
          />
        </div>
        <Textarea
          placeholder="Описание"
          value={value.content.realism.description}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              realism: { ...content.realism, description: event.target.value },
            }))
          }
        />
        <ImageFields
          label="Realism — До"
          value={value.content.realism.before}
          entityId={initial?.id}
          onChange={(before) =>
            setContent((content) => ({
              ...content,
              realism: { ...content.realism, before },
            }))
          }
        />
        <ImageFields
          label="Realism — После"
          value={value.content.realism.after}
          entityId={initial?.id}
          onChange={(after) =>
            setContent((content) => ({
              ...content,
              realism: { ...content.realism, after },
            }))
          }
        />
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Features</h2>
        <Input
          placeholder="Заголовок"
          value={value.content.features.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              features: { ...content.features, title: event.target.value },
            }))
          }
        />
        {value.content.features.items.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Название"
              value={item.title}
              onChange={(event) =>
                setContent((content) => ({
                  ...content,
                  features: {
                    ...content.features,
                    items: content.features.items.map(
                      (current, currentIndex) =>
                        currentIndex === index
                          ? { ...current, title: event.target.value }
                          : current,
                    ),
                  },
                }))
              }
            />
            <Textarea
              placeholder="Описание"
              value={item.text}
              onChange={(event) =>
                setContent((content) => ({
                  ...content,
                  features: {
                    ...content.features,
                    items: content.features.items.map(
                      (current, currentIndex) =>
                        currentIndex === index
                          ? { ...current, text: event.target.value }
                          : current,
                    ),
                  },
                }))
              }
            />
          </div>
        ))}
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Попробуйте себя в новом образе</h2>
        <Input
          placeholder="Заголовок секции"
          value={value.content.tryLook?.title ?? ""}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              tryLook: { title: event.target.value },
            }))
          }
        />
        <p className="text-sm text-foreground-muted">
          Идеи и стили подгружаются автоматически по опубликованному контенту.
        </p>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">FAQ</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setContent((content) => ({
                ...content,
                faq: {
                  ...content.faq,
                  items: [...content.faq.items, { question: "", answer: "" }],
                },
              }))
            }
          >
            Добавить вопрос
          </Button>
        </div>
        <Input
          placeholder="Заголовок"
          value={value.content.faq.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              faq: { ...content.faq, title: event.target.value },
            }))
          }
        />
        <div className="space-y-3">
          {value.content.faq.items.map((item, index) => (
            <div
              key={`faq-item-${index}`}
              className="space-y-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Вопрос {index + 1}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() =>
                      setContent((content) => {
                        const items = [...content.faq.items];
                        [items[index - 1], items[index]] = [
                          items[index],
                          items[index - 1],
                        ];
                        return { ...content, faq: { ...content.faq, items } };
                      })
                    }
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === value.content.faq.items.length - 1}
                    onClick={() =>
                      setContent((content) => {
                        const items = [...content.faq.items];
                        [items[index], items[index + 1]] = [
                          items[index + 1],
                          items[index],
                        ];
                        return { ...content, faq: { ...content.faq, items } };
                      })
                    }
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={value.content.faq.items.length <= 1}
                    onClick={() =>
                      setContent((content) => ({
                        ...content,
                        faq: {
                          ...content.faq,
                          items: content.faq.items.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        },
                      }))
                    }
                  >
                    Удалить
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Вопрос"
                value={item.question}
                onChange={(event) =>
                  setContent((content) => ({
                    ...content,
                    faq: {
                      ...content.faq,
                      items: content.faq.items.map((current, currentIndex) =>
                        currentIndex === index
                          ? { ...current, question: event.target.value }
                          : current,
                      ),
                    },
                  }))
                }
              />
              <Textarea
                placeholder="Ответ"
                value={item.answer}
                onChange={(event) =>
                  setContent((content) => ({
                    ...content,
                    faq: {
                      ...content.faq,
                      items: content.faq.items.map((current, currentIndex) =>
                        currentIndex === index
                          ? { ...current, answer: event.target.value }
                          : current,
                      ),
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Bottom CTA</h2>
        <Input
          placeholder="Заголовок"
          value={value.content.bottomCta.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              bottomCta: { ...content.bottomCta, title: event.target.value },
            }))
          }
        />
        <Textarea
          placeholder="Описание"
          value={value.content.bottomCta.text}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              bottomCta: { ...content.bottomCta, text: event.target.value },
            }))
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="CTA текст"
            value={value.content.bottomCta.button.text}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                bottomCta: {
                  ...content.bottomCta,
                  button: {
                    ...content.bottomCta.button,
                    text: event.target.value,
                  },
                },
              }))
            }
          />
          <Input
            placeholder="CTA URL"
            value={value.content.bottomCta.button.href}
            onChange={(event) =>
              setContent((content) => ({
                ...content,
                bottomCta: {
                  ...content.bottomCta,
                  button: {
                    ...content.bottomCta.button,
                    href: event.target.value,
                  },
                },
              }))
            }
          />
        </div>
        {value.content.bottomCta.images.map((url, index) => (
          <ImageUpload
            key={index}
            label={`Иллюстрация ${index + 1}`}
            entityType={MediaEntityType.AI_TOOL}
            entityId={initial?.id}
            value={url || undefined}
            previewSize={index === 2 ? "compact" : "184x260"}
            onChange={(_storageKey, publicUrl) =>
              setContent((content) => ({
                ...content,
                bottomCta: {
                  ...content.bottomCta,
                  images: content.bottomCta.images.map(
                    (current, currentIndex) =>
                      currentIndex === index ? publicUrl ?? "" : current,
                  ) as [string, string, string],
                },
              }))
            }
            onClear={() =>
              setContent((content) => ({
                ...content,
                bottomCta: {
                  ...content.bottomCta,
                  images: content.bottomCta.images.map(
                    (current, currentIndex) =>
                      currentIndex === index ? "" : current,
                  ) as [string, string, string],
                },
              }))
            }
          />
        ))}
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">SEO-текст и теги</h2>
        <Input
          placeholder="Заголовок"
          value={value.content.seoText.title}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              seoText: { ...content.seoText, title: event.target.value },
            }))
          }
        />
        <Textarea
          placeholder="Rich text body"
          value={value.content.seoText.body}
          onChange={(event) =>
            setContent((content) => ({
              ...content,
              seoText: { ...content.seoText, body: event.target.value },
            }))
          }
        />
        <Input
          placeholder="Теги через запятую"
          value={seoTagsText}
          onChange={(event) => {
            const rawValue = event.target.value;
            setSeoTagsText(rawValue);
            setContent((content) => ({
              ...content,
              seoText: {
                ...content.seoText,
                tags: rawValue
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              },
            }));
          }}
          onBlur={() => {
            const normalized = seoTagsText
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .join(", ");
            setSeoTagsText(normalized);
          }}
        />
      </section>
      <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Статьи по теме</h2>
        {articles.map((article) => (
          <label key={article.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.relationIds.includes(article.id)}
              onChange={(event) =>
                setValue({
                  ...value,
                  relationIds: event.target.checked
                    ? [...value.relationIds, article.id]
                    : value.relationIds.filter((id) => id !== article.id),
                })
              }
            />
            {article.h1}
          </label>
        ))}
      </section>
      <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Technical SEO</h2>
        <Input
          placeholder="SEO title"
          value={value.seoTitle ?? ""}
          onChange={(event) =>
            setValue({ ...value, seoTitle: event.target.value })
          }
        />
        <Textarea
          placeholder="SEO description"
          value={value.seoDescription ?? ""}
          onChange={(event) =>
            setValue({ ...value, seoDescription: event.target.value })
          }
        />
        <Input
          placeholder="Canonical"
          value={value.canonical ?? ""}
          onChange={(event) =>
            setValue({ ...value, canonical: event.target.value })
          }
        />
        <Input
          placeholder="OG title"
          value={value.ogTitle ?? ""}
          onChange={(event) =>
            setValue({ ...value, ogTitle: event.target.value })
          }
        />
        <Input
          placeholder="OG description"
          value={value.ogDescription ?? ""}
          onChange={(event) =>
            setValue({ ...value, ogDescription: event.target.value })
          }
        />

        <Input
          placeholder="OG image URL"
          value={value.ogImage ?? ""}
          onChange={(event) =>
            setValue({ ...value, ogImage: event.target.value })
          }
        />
        <div className="grid gap-3 text-sm md:grid-cols-2">
          {(
            [
              ["robotsIndex", "Индексировать"],
              ["robotsFollow", "Переходить по ссылкам"],
              ["showInSitemap", "Показывать в sitemap"],
              ["showInMenu", "Показывать в меню"],
              ["showInSearch", "Показывать в поиске"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3">
              {label}
              <Switch
                checked={Boolean(value[key])}
                onCheckedChange={(checked) =>
                  setValue({ ...value, [key]: checked })
                }
              />
            </label>
          ))}
        </div>
      </section>
      <Button type="submit" disabled={saving}>
        {saving ? "Сохранение…" : "Сохранить"}
      </Button>
    </form>
  );
}
