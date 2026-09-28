import { z } from "zod";
import { slugPattern } from "@/lib/validations/categories";

export const ParameterOptionSchema = z.object({
  id: z.string().optional(),
  label: z
    .string()
    .trim()
    .min(1, "Метка обязательна")
    .max(120, "Максимум 120 символов"),
  promptSnippet: z
    .string()
    .trim()
    .min(1, "Prompt snippet обязателен")
    .max(2000, "Максимум 2000 символов"),
  imageUrl: z.string().url("Некорректный URL").optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
});

export const ParameterGroupSchema = z.object({
  id: z.string().optional(),
  question: z
    .string()
    .trim()
    .min(1, "Вопрос обязателен")
    .max(500, "Максимум 500 символов"),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  options: z
    .array(ParameterOptionSchema)
    .min(1, "Добавьте минимум один вариант"),
});

export const CreatePresetSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Название обязательно")
    .max(120, "Максимум 120 символов"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug обязателен")
    .regex(slugPattern, "Некорректный slug"),
  categoryId: z.string().trim().min(1, "Категория обязательна"),
  description: z
    .string()
    .max(1000, "Максимум 1000 символов")
    .optional()
    .or(z.literal("")),
  previewUrl: z.string().url("Некорректный URL").optional().or(z.literal("")),
  tokenCost: z.number().int().min(1, "Минимум 1 токен"),
  basePrompt: z
    .string()
    .trim()
    .min(1, "Base prompt обязателен")
    .max(5000, "Максимум 5000 символов"),
  sortOrder: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  canonical: z.string().url().optional().or(z.literal("")),
  ogTitle: z.string().max(120).optional().or(z.literal("")),
  ogDescription: z.string().max(320).optional().or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
  twitterCard: z.string().max(40).optional().or(z.literal("")),
  jsonLd: z.string().optional().or(z.literal("")),
  parameterGroups: z.array(ParameterGroupSchema).default([]),
});

export const UpdatePresetSchema = CreatePresetSchema.partial();

export type CreatePresetInput = z.infer<typeof CreatePresetSchema>;
export type UpdatePresetInput = z.infer<typeof UpdatePresetSchema>;
