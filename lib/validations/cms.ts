import { z } from "zod";

const slugPattern = /^[a-z0-9-/]+$/;

export const CreateCmsPageSchema = z.object({
  title: z
    .string()
    .min(1, "Обязательное поле")
    .max(200, "Максимум 200 символов"),
  slug: z
    .string()
    .min(1, "Обязательное поле")
    .max(200, "Максимум 200 символов")
    .regex(slugPattern, "Только строчные буквы, цифры, дефисы и /"),
  h1: z.string().min(1, "Обязательное поле").max(200, "Максимум 200 символов"),
  description: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  isVisible: z.boolean().default(true),
});

export const UpdateCmsPageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(slugPattern).optional(),
  h1: z.string().min(1).max(200).optional(),
  isPublished: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(320).optional(),
  canonical: z.string().max(500).optional(),
  ogTitle: z.string().max(120).optional(),
  ogDescription: z.string().max(320).optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
  jsonLd: z.record(z.string(), z.unknown()).optional(),
});

export type CreateCmsPageFormValues = z.infer<typeof CreateCmsPageSchema>;
export type UpdateCmsPageFormValues = z.infer<typeof UpdateCmsPageSchema>;
