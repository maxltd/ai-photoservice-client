import Image from "next/image";
import type { ReactNode } from "react";
import { getPreferredImageVariantUrl } from "@/lib/image-variants";
import type {
  PhotoSessionStyleContent,
  PhotoSessionStyleStepPalette,
} from "@/lib/api/contract";

const paletteClasses: Record<PhotoSessionStyleStepPalette, string> = {
  purple: "bg-gradient-style-step-purple",
  blue: "bg-gradient-style-step-blue",
  green: "bg-gradient-style-step-green",
};

function renderTitleWithHighlightedLastWord(title: string): ReactNode {
  const normalizedTitle = title.trim();
  const lastSpaceIndex = normalizedTitle.lastIndexOf(" ");

  if (lastSpaceIndex < 0) {
    return <span className="text-white">{normalizedTitle}</span>;
  }

  return (
    <>
      <span className="text-white/30">
        {normalizedTitle.slice(0, lastSpaceIndex + 1)}
      </span>
      <span className="text-white">{normalizedTitle.slice(lastSpaceIndex + 1)}</span>
    </>
  );
}

export function StylePageHowGeneratorWorks({
  howGeneratorWorks,
}: {
  howGeneratorWorks: PhotoSessionStyleContent["howGeneratorWorks"];
}) {
  return (
    <section className="w-full bg-background px-4 py-16 md:px-16 md:py-36">
      <div className="mx-auto max-w-[1824px]">
        <h2 className="mx-auto max-w-[1186px] text-center text-[32px] font-medium leading-9 tracking-[-0.02em] md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">
          {renderTitleWithHighlightedLastWord(howGeneratorWorks.title)}
        </h2>

        <div className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain md:grid md:grid-cols-3 md:gap-10 md:overflow-visible">
          {howGeneratorWorks.steps.map((step, index) => {
            const palette = paletteClasses[step.palette] ?? paletteClasses.purple;
            const imageUrl = step.image?.url;
            const imageAlt = step.image?.alt || step.title;
            const imageTitle = step.image?.title || step.title;
            const mediaRatio = index === 0 ? "aspect-square max-w-[326px]" : "aspect-[485/326]";

            return (
              <article
                key={`${step.title}-${index}`}
                className="relative isolate flex h-[418px] w-[calc(100vw-32px)] shrink-0 snap-start flex-col items-center overflow-hidden rounded-[24px] bg-white/[0.08] px-6 py-8 md:h-[626px] md:w-auto md:rounded-[36px] md:px-12 md:py-12"
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-[-10%] bottom-[-18%] -z-10 h-[62%] rounded-full opacity-60 blur-[100px] ${palette}`}
                />

                <div className="z-10 flex flex-col items-center gap-3 text-center md:gap-4">
                  <span className="rounded-full bg-white/[0.08] px-3 py-2 text-[12px] font-bold leading-5 text-white md:px-3 md:py-3 md:text-sm">
                    Шаг {index + 1}
                  </span>
                  <h3 className={`bg-clip-text text-[28px] font-medium leading-8 tracking-[-0.02em] text-transparent md:text-[40px] md:leading-[44px] ${palette}`}>
                    {step.title}
                  </h3>
                  <p className="max-w-[485px] text-sm font-medium leading-5 text-white/70 md:text-xl md:leading-7">
                    {step.text}
                  </p>
                </div>

                {imageUrl ? (
                  <div className={`relative z-10 mt-auto w-full overflow-hidden ${mediaRatio}`}>
                    <picture>
                      {getPreferredImageVariantUrl(step.image.variants, 400) ? (
                        <source media="(max-width: 767px)" srcSet={getPreferredImageVariantUrl(step.image.variants, 400)} />
                      ) : null}
                      {getPreferredImageVariantUrl(step.image.variants, 1280) ? (
                        <source media="(min-width: 768px) and (max-width: 1279px)" srcSet={getPreferredImageVariantUrl(step.image.variants, 1280)} />
                      ) : null}
                      {getPreferredImageVariantUrl(step.image.variants, 1920) ? (
                        <source media="(min-width: 1280px)" srcSet={getPreferredImageVariantUrl(step.image.variants, 1920)} />
                      ) : null}
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        title={imageTitle}
                        fill
                        sizes="(min-width: 768px) 32vw, calc(100vw - 32px)"
                        className="object-contain"
                      />
                    </picture>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
