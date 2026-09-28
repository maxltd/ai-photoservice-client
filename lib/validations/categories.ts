import { z } from "zod";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Название обязательно")
    .max(120, "Максимум 120 символов"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug обязателен")
    .regex(slugPattern, "Некорректный slug"),
  description: z
    .string()
    .max(1000, "Максимум 1000 символов")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().url("Некорректный URL").optional().or(z.literal("")),
  sortOrder: z.number().int().min(0, "Минимум 0").default(0),
  featured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
