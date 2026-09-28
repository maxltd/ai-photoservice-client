"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ApiError,
  API_ROUTES,
  PhotoSessionAudience,
  type CategoryResponse,
  type CreatePhotoSessionRequest,
  type PhotoSessionResponse,
} from "@/lib/api/contract";
import { apiPost } from "@/lib/api/client";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const audienceOptions = [
  { value: PhotoSessionAudience.FEMALE, label: "Женские" },
  { value: PhotoSessionAudience.MALE, label: "Мужские" },
  { value: PhotoSessionAudience.JOINT, label: "Совместные" },
  { value: PhotoSessionAudience.KIDS, label: "Детские" },
] as const;

const createPhotoSessionDraftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).regex(slugPattern),
  categoryId: z.string().trim().min(1),
  audience: z.nativeEnum(PhotoSessionAudience),
  tokenCostPerSlot: z.number().int().min(1),
  slot1Prompt: z.string().trim().min(1).max(5000),
  popular: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

type CreatePhotoSessionDraftInput = z.infer<
  typeof createPhotoSessionDraftSchema
>;

interface CreatePhotoSessionDraftFormProps {
  categories: CategoryResponse[];
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreatePhotoSessionDraftForm({
  categories,
}: CreatePhotoSessionDraftFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const form = useForm<
    z.input<typeof createPhotoSessionDraftSchema>,
    unknown,
    CreatePhotoSessionDraftInput
  >({
    resolver: zodResolver(createPhotoSessionDraftSchema),
    defaultValues: {
      title: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      audience: PhotoSessionAudience.JOINT,
      tokenCostPerSlot: 1,
      slot1Prompt: "",
      popular: false,
      isVisible: true,
    },
  });

  const title = useWatch({ control: form.control, name: "title" }) ?? "";

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    form.setValue("slug", slugify(title), { shouldValidate: true });
  }, [form, slugManuallyEdited, title]);

  async function onSubmit(values: CreatePhotoSessionDraftInput): Promise<void> {
    const payload: CreatePhotoSessionRequest = {
      slug: values.slug,
      title: values.title,
      tokenCostPerSlot: values.tokenCostPerSlot,
      categoryId: values.categoryId,
      audience: values.audience,
      popular: values.popular,
      isVisible: values.isVisible,
      slots: [
        {
          order: 1,
          basePrompt: values.slot1Prompt,
        },
      ],
    };

    try {
      const created = await apiPost<
        { data: PhotoSessionResponse } | PhotoSessionResponse,
        CreatePhotoSessionRequest
      >(API_ROUTES.PHOTO_SESSIONS, payload);

      const session = "data" in created ? created.data : created;

      queryClient.setQueryData(queryKeys.sessions.byId(session.id), session);
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.sessions.all });

      router.push(`/admin/sessions/${session.id}/edit`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        form.setError("slug", { message: "Slug уже занят" });
      }
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      className="space-y-6 rounded-lg border border-border bg-surface p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input id="title" {...form.register("title")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          {...form.register("slug", {
            onChange: () => setSlugManuallyEdited(true),
          })}
        />
        {form.formState.errors.slug ? (
          <p className="text-xs text-danger">
            {form.formState.errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Категория</Label>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
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

      <div className="space-y-2">
        <Label>Аудитория</Label>
        <Controller
          control={form.control}
          name="audience"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите аудиторию" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tokenCostPerSlot">Стоимость за слот (токены)</Label>
        <Input
          id="tokenCostPerSlot"
          type="number"
          min={1}
          {...form.register("tokenCostPerSlot", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slot1Prompt">Слот 1 — промпт</Label>
        <Textarea
          id="slot1Prompt"
          className="min-h-32"
          {...form.register("slot1Prompt")}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="popular">Популярная</Label>
        <Controller
          control={form.control}
          name="popular"
          render={({ field }) => (
            <Switch
              id="popular"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="isVisible">Видимая</Label>
        <Controller
          control={form.control}
          name="isVisible"
          render={({ field }) => (
            <Switch
              id="isVisible"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Создать и перейти к редактированию</Button>
      </div>
    </form>
  );
}
