"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ApiError,
  API_ROUTES,
  type CategoryResponse,
  type PresetResponse,
} from "@/lib/api/contract";
import { apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { useQueryClient } from "@tanstack/react-query";
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

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createPresetDraftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).regex(slugPattern),
  categoryId: z.string().trim().min(1),
  tokenCost: z.number().int().min(1),
  basePrompt: z.string().trim().min(1).max(5000),
  popular: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

type CreatePresetDraftInput = z.infer<typeof createPresetDraftSchema>;

interface CreatePresetDraftFormProps {
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

export function CreatePresetDraftForm({
  categories,
}: CreatePresetDraftFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const form = useForm<
    z.input<typeof createPresetDraftSchema>,
    unknown,
    CreatePresetDraftInput
  >({
    resolver: zodResolver(createPresetDraftSchema),
    defaultValues: {
      title: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      tokenCost: 1,
      basePrompt: "",
      popular: false,
      isVisible: true,
    },
  });

  const title = form.watch("title");

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    form.setValue("slug", slugify(title), { shouldValidate: true });
  }, [form, slugManuallyEdited, title]);

  async function onSubmit(values: CreatePresetDraftInput): Promise<void> {
    try {
      const created = await apiPost<
        { data: PresetResponse } | PresetResponse,
        CreatePresetDraftInput
      >(API_ROUTES.PRESETS, values);

      const preset = "data" in created ? created.data : created;

      queryClient.setQueryData(queryKeys.presets.byId(preset.id), preset);
      await queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.presets.all });

      router.push(`/admin/presets/${preset.id}/edit`);
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
        <Label htmlFor="tokenCost">Стоимость (токены)</Label>
        <Input
          id="tokenCost"
          type="number"
          min={1}
          {...form.register("tokenCost", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="basePrompt">Base prompt</Label>
        <Textarea
          id="basePrompt"
          className="min-h-32"
          {...form.register("basePrompt")}
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label htmlFor="popular">Популярный</Label>
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
        <Label htmlFor="isVisible">Видимый</Label>
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
