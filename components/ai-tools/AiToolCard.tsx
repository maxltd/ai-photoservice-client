import Link from "next/link";
import type { AiToolPageCard } from "@/lib/api/contract";
import { getPreferredImageVariantUrl } from "@/lib/image-variants";

export function AiToolCard({ tool }: { tool: AiToolPageCard }) {
  const image = tool.image;
  const href = tool.href;
  return (
    <li className="min-w-0 overflow-hidden rounded-[16px] border border-white/[0.08] bg-black">
      <Link
        href={href}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        {image ? (
          <picture>
            {getPreferredImageVariantUrl(tool.imageVariants, 400) ? (
              <source
                media="(max-width: 767px)"
                srcSet={
                  getPreferredImageVariantUrl(tool.imageVariants, 400) ??
                  undefined
                }
              />
            ) : null}
            {getPreferredImageVariantUrl(tool.imageVariants, 1280) ? (
              <source
                media="(min-width: 768px)"
                srcSet={
                  getPreferredImageVariantUrl(tool.imageVariants, 1280) ??
                  undefined
                }
              />
            ) : null}
            <img
              src={image}
              alt={tool.title}
              className="block aspect-[0.78] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </picture>
        ) : (
          <div className="aspect-[0.78] bg-surface" />
        )}
        <div className="flex min-h-[64px] items-center justify-between gap-2 p-3">
          <h3 className="text-sm font-medium leading-5 text-foreground md:text-base">
            {tool.title}
          </h3>
        </div>
      </Link>
    </li>
  );
}
