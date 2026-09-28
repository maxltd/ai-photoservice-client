"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  type CategoryResponse,
  MediaEntityType,
  ApiError,
} from "@/lib/api/contract";
import {
  CreateCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validations/categories";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/lib/hooks/categories/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/common/ImageUpload";
import { UnsavedChangesDialog } from "@/components/admin/common/UnsavedChangesDialog";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";

interface CategoryFormProps {
  initialData?: CategoryResponse;
}

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
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
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function slugify(input: string): string {
  const transliterated = input
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("");

  return transliterated
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialData),
  );

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(initialData?.id ?? "");

  const isEditMode = Boolean(initialData);

  const form = useForm<
    z.input<typeof CreateCategorySchema>,
    unknown,
    CreateCategoryInput
  >({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      sortOrder: initialData?.sortOrder ?? 0,
      featured: initialData?.featured ?? false,
      isVisible: initialData?.isVisible ?? true,
    },
  });

  const name = form.watch("name");

  useEffect(() => {
    if (isEditMode || slugManuallyEdited) {
      return;
    }

    form.setValue("slug", slugify(name), { shouldValidate: true });
  }, [form, isEditMode, name, slugManuallyEdited]);

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const { dialogOpen, requestNavigation, closeDialog, confirmNavigation } =
    useUnsavedChanges(form.formState.isDirty);

  const slugWarningVisible = useMemo(() => {
    if (!initialData) {
      return false;
    }

    return initialData.isVisible && form.watch("slug") !== initialData.slug;
  }, [form, initialData]);

  async function onSubmit(values: CreateCategoryInput): Promise<void> {
    try {
      const payload = {
        ...values,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
      };

      if (isEditMode && initialData) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.code === "CONFLICT") {
        form.setError("slug", { message: "Slug уже занят" });
      }
      toast.error(error instanceof Error ? error.message : "Произошла ошибка");
    }
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={() => requestNavigation(() => router.back())}
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </Button>

      <form
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        className="space-y-6 rounded-lg border border-border bg-surface p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Название</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-danger">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...form.register("slug", {
                onChange: () => setSlugManuallyEdited(true),
              })}
            />
            {slugWarningVisible ? (
              <p className="text-xs text-warning">
                Смена slug создаст редирект
              </p>
            ) : null}
            {form.formState.errors.slug ? (
              <p className="text-xs text-danger">
                {form.formState.errors.slug.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description ? (
              <p className="text-xs text-danger">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Controller
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <ImageUpload
                  value={field.value || undefined}
                  entityType={MediaEntityType.SESSION}
                  entityId={initialData?.id ?? "category-draft"}
                  label="Изображение"
                  previewSize="184x260"
                  aspectRatio="1:1"
                  onChange={(_, publicUrl) => field.onChange(publicUrl ?? "")}
                  onClear={() => field.onChange("")}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Порядок</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              {...form.register("sortOrder", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label htmlFor="featured">Рекомендуемая</Label>
            <Controller
              control={form.control}
              name="featured"
              render={({ field }) => (
                <Switch
                  id="featured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-3 md:col-span-2">
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
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => requestNavigation(() => router.back())}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </form>
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
