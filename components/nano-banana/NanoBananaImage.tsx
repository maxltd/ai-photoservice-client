import Image from "next/image";
import type { NanoBananaImage as ImageData } from "@/lib/api/contract";
import { getPreferredImageVariantUrl } from "@/lib/image-variants";

export function NanoBananaImage({
  image,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  image: ImageData;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      {getPreferredImageVariantUrl(image.variants, 400) ? (
        <source media="(max-width: 767px)" srcSet={getPreferredImageVariantUrl(image.variants, 400)} />
      ) : null}
      {getPreferredImageVariantUrl(image.variants, 1280) ? (
        <source media="(min-width: 768px) and (max-width: 1279px)" srcSet={getPreferredImageVariantUrl(image.variants, 1280)} />
      ) : null}
      {getPreferredImageVariantUrl(image.variants, 1920) ? (
        <source media="(min-width: 1280px)" srcSet={getPreferredImageVariantUrl(image.variants, 1920)} />
      ) : null}
      <Image
        src={image.url}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    </picture>
  );
}
