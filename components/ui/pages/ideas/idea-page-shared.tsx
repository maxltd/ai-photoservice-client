import Image from "next/image";
import { Flame, Sparkles, Zap } from "lucide-react";
import type { ImageVariants } from "@/lib/api/contract";
import { getPreferredImageVariantUrl } from "@/lib/image-variants";

export function paletteClass(palette: string): string {
  if (palette === "blue") {
    return "bg-[linear-gradient(100.9deg,#5BCFFF_2.38%,rgba(11,127,210,0.8)_100%)]";
  }

  if (palette === "violet") {
    return "bg-[linear-gradient(101.17deg,#DE7CFF_0%,#732CD7_100%)]";
  }

  return "bg-[radial-gradient(100%_100%_at_0%_0%,#F6F930_0%,#FF3C3C_100%)]";
}

export function IdeaImage({
  src,
  alt,
  variants,
  priority = false,
  sizes,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  variants?: ImageVariants | null;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <picture>
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

export function trendCardAlt(title: string): string {
  return `${title} — пример ИИ-фотосессии`;
}

export const TrendStarsIcon = ({ size = 20 }: { size?: number }) => (
  <Image
    src="/icons/ideas/Stars.svg"
    alt=""
    width={size}
    height={size}
    aria-hidden="true"
    className="shrink-0"
  />
);

export function IdeaTagIcon({ icon }: { icon?: "bolt" | "fire" }) {
  if (icon === "fire") {
    return <Flame className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />;
  }

  if (icon === "bolt") {
    return <Zap className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />;
  }

  return <Sparkles className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />;
}
