"use client";

import Image from "next/image";
import type { ImageVariants } from "@/lib/api/contract";
import { getPreferredImageVariantUrl } from "@/lib/image-variants";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  variants?: ImageVariants | null;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  variants,
  priority = false,
  sizes,
  className = "object-cover",
}: ResponsiveImageProps) {
  return (
    <picture className="relative block h-full w-full">
      {getPreferredImageVariantUrl(variants, 400) ? (
        <source media="(max-width: 767px)" srcSet={getPreferredImageVariantUrl(variants, 400)} />
      ) : null}
      {getPreferredImageVariantUrl(variants, 1280) ? (
        <source media="(min-width: 768px) and (max-width: 1279px)" srcSet={getPreferredImageVariantUrl(variants, 1280)} />
      ) : null}
      {getPreferredImageVariantUrl(variants, 1920) ? (
        <source media="(min-width: 1280px)" srcSet={getPreferredImageVariantUrl(variants, 1920)} />
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    </picture>
  );
}
