import type { ImageVariants } from "@/lib/api/contract";

export function getPreferredImageVariantUrl(
  variants: ImageVariants | null | undefined,
  targetWidth: 400 | 1280 | 1920,
): string | undefined {
  const widths = targetWidth === 400
    ? [400, 640, 1280, 1920]
    : targetWidth === 1280
      ? [1280, 640, 1920, 400]
      : [1920, 1280, 640, 400];

  for (const width of widths) {
    const url = variants?.[`width${width}Url` as keyof ImageVariants];
    if (url) return url;
  }

  return undefined;
}

export function buildImageVariantSrcSet(
  variants: ImageVariants | null | undefined,
): string | undefined {
  const entries = [
    [variants?.width400Url, 400],
    [variants?.width640Url, 640],
    [variants?.width1280Url, 1280],
    [variants?.width1920Url, 1920],
  ] as const;

  const srcSet = entries
    .filter(([url]) => Boolean(url))
    .map(([url, width]) => `${url as string} ${width}w`)
    .join(", ");

  return srcSet || undefined;
}
