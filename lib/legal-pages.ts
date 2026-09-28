export const LEGAL_PAGE_SLUGS = [
  "rules",
  "privacy-policy",
  "personal-data-policy",
  "cookie-policy",
] as const;

export type LegalPageSlug = (typeof LEGAL_PAGE_SLUGS)[number];

export interface LegalPageDefinition {
  slug: LegalPageSlug;
  label: string;
  title: string;
  description: string;
  h1: string;
}

export const LEGAL_PAGE_DEFINITIONS: readonly LegalPageDefinition[] = [
  {
    slug: "rules",
    label: "Правила использования сервиса",
    title: "Правила использования сервиса — NeiroPhoto",
    description:
      "Правила использования сервиса NeiroPhoto: условия оплаты, генерации ИИ-фото и видео, возврата средств, права и обязанности пользователей.",
    h1: "Правила использования сервиса",
  },
  {
    slug: "privacy-policy",
    label: "Политика конфиденциальности",
    title: "Политика конфиденциальности — NeiroPhoto",
    description:
      "Политика конфиденциальности сервиса NeiroPhoto: какие данные мы собираем, как их используем и защищаем.",
    h1: "Политика конфиденциальности",
  },
  {
    slug: "personal-data-policy",
    label: "Политика обработки персональных данных",
    title: "Политика обработки персональных данных — NeiroPhoto",
    description:
      "Политика обработки персональных данных NeiroPhoto в соответствии с 152-ФЗ: цели, сроки и условия обработки персональных данных пользователей.",
    h1: "Политика обработки персональных данных",
  },
  {
    slug: "cookie-policy",
    label: "Политика использования Cookie",
    title: "Политика использования файлов Cookie — NeiroPhoto",
    description:
      "Как сервис NeiroPhoto использует файлы cookie, для чего они нужны и как ими управлять.",
    h1: "Политика использования файлов Cookie",
  },
];

export function isLegalPageSlug(value: string): value is LegalPageSlug {
  return (LEGAL_PAGE_SLUGS as readonly string[]).includes(value);
}

export function getLegalPageDefinition(
  slug: string,
): LegalPageDefinition | undefined {
  return LEGAL_PAGE_DEFINITIONS.find((page) => page.slug === slug);
}
