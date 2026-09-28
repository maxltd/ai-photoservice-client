"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import type { CreateCmsPageFormValues } from "@/lib/validations/cms";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/contract";
import { useCreateCmsPage } from "@/lib/hooks/cms/useCmsAdmin";
import { queryKeys } from "@/lib/query/keys";
import { CreateCmsPageSchema } from "@/lib/validations/cms";

function slugify(text: string): string {
  const ruMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "j",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((c) => ruMap[c] ?? c)
    .join("")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

interface CreateCmsPageFormProps {
  isFaq?: boolean;
}

interface FaqDraftItem {
  question: string;
  answer: string;
}

export function CreateCmsPageForm({ isFaq = false }: CreateCmsPageFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slugTouched, setSlugTouched] = useState(false);
  const [faqItems, setFaqItems] = useState<FaqDraftItem[]>([
    { question: "", answer: "" },
  ]);
  const { mutateAsync: create, isPending } = useCreateCmsPage();

  const form = useForm<
    z.input<typeof CreateCmsPageSchema>,
    unknown,
    CreateCmsPageFormValues
  >({
    resolver: zodResolver(CreateCmsPageSchema),
    defaultValues: {
      title: "",
      slug: isFaq ? "faq" : "",
      h1: "",
      description: "",
      question: "",
      answer: "",
      isVisible: true,
    },
  });

  const isVisible = useWatch({ control: form.control, name: "isVisible" });

  async function onSubmit(values: CreateCmsPageFormValues): Promise<void> {
    try {
      if (isFaq) {
        if (!values.description?.trim()) {
          form.setError("description", { message: "Обязательное поле" });
          return;
        }
        if (faqItems.length < 1) {
          toast.error("Добавьте хотя бы одну пару вопрос–ответ");
          return;
        }
        if (faqItems.some((item) => !item.question.trim() || !item.answer.trim())) {
          toast.error("Заполните вопрос и ответ у всех пунктов");
          return;
        }
      }

      const created = await create({
        title: values.title,
        slug: isFaq ? "faq" : values.slug,
        h1: values.h1,
        content: isFaq
          ? {
              description: values.description?.trim() ?? "",
              items: faqItems.map((item) => ({
                question: item.question.trim(),
                answer: item.answer.trim(),
              })),
            }
          : { blocks: [] },
        isPublished: false,
        isVisible: values.isVisible,
      });

      queryClient.setQueryData(
        queryKeys.cms.adminPageById(created.id),
        created,
      );
      router.push(isFaq ? "/admin/faq" : `/admin/cms/${created.id}/edit`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        form.setError("slug", {
          message: "Страница с этим slug уже существует",
        });
        return;
      }

      toast.error(error instanceof Error ? error.message : "Ошибка создания");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      className="space-y-6 rounded-lg border border-border bg-surface p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Заголовок</Label>
        <Input
          id="title"
          {...form.register("title", {
            onChange: (event) => {
              if (!slugTouched) {
                form.setValue("slug", slugify(event.target.value), {
                  shouldValidate: true,
                });
              }
            },
          })}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-[--color-danger]">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      {!isFaq ? (
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          {...form.register("slug", {
            onChange: () => setSlugTouched(true),
          })}
        />
        <p className="text-xs text-[--color-foreground-muted]">
          Допускается / для вложенных путей (например, blog/my-article)
        </p>
        {form.formState.errors.slug ? (
          <p className="text-xs text-[--color-danger]">
            {form.formState.errors.slug.message}
          </p>
        ) : null}
      </div>
      ) : (
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value="faq" readOnly />
          <p className="text-xs text-[--color-foreground-muted]">Slug FAQ фиксирован.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="h1">H1</Label>
        <Input id="h1" {...form.register("h1")} />
        {form.formState.errors.h1 ? (
          <p className="text-xs text-[--color-danger]">
            {form.formState.errors.h1.message}
          </p>
        ) : null}
      </div>

      {isFaq ? (
        <div className="space-y-4 rounded-md border border-border p-4">
          <div className="space-y-2">
            <Label htmlFor="description">Описание hero</Label>
            <Input id="description" {...form.register("description")} />
            {form.formState.errors.description ? <p className="text-xs text-[--color-danger]">{form.formState.errors.description.message}</p> : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label>Вопросы и ответы</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFaqItems((items) => [...items, { question: "", answer: "" }])}
            >
              <Plus className="mr-2 h-4 w-4" /> Добавить вопрос
            </Button>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={`faq-draft-${index}`} className="space-y-2 rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground-muted">Вопрос {index + 1}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => setFaqItems((items) => { const next = [...items]; const [moved] = next.splice(index, 1); if (moved) next.splice(index - 1, 0, moved); return next; })} aria-label="Переместить выше">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" disabled={index === faqItems.length - 1} onClick={() => setFaqItems((items) => { const next = [...items]; const [moved] = next.splice(index, 1); if (moved) next.splice(index + 1, 0, moved); return next; })} aria-label="Переместить ниже">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" disabled={faqItems.length === 1} onClick={() => setFaqItems((items) => items.filter((_, itemIndex) => itemIndex !== index))} aria-label="Удалить вопрос">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
                <Input
                  value={item.question}
                  placeholder="Вопрос"
                  onChange={(event) => setFaqItems((items) => items.map((current, itemIndex) => itemIndex === index ? { ...current, question: event.target.value } : current))}
                />
                <Textarea
                  value={item.answer}
                  placeholder="Ответ"
                  onChange={(event) => setFaqItems((items) => items.map((current, itemIndex) => itemIndex === index ? { ...current, answer: event.target.value } : current))}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="isVisible">Видимая страница</Label>
        <Switch
          id="isVisible"
          checked={isVisible}
          onCheckedChange={(checked) => form.setValue("isVisible", checked)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Создание...
            </>
          ) : (
            "Создать черновик"
          )}
        </Button>
      </div>
    </form>
  );
}
