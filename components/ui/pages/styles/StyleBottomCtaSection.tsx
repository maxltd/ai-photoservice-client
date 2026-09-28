import Image from "next/image";
import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import { getPreferredImageVariantUrl } from "@/lib/image-variants";
import type { PhotoSessionStyleContent } from "@/lib/api/contract";

type StyleBottomCtaSectionProps = {
  bottomCta: PhotoSessionStyleContent["bottomCta"];
};

export function StyleBottomCtaSection({ bottomCta }: StyleBottomCtaSectionProps) {
  return (
    <section className="px-3 py-0 md:px-6 md:pt-36 lg:px-16">
      <div className="relative mx-auto min-h-[634px] w-full max-w-[1792px] overflow-hidden rounded-[36px] bg-black md:h-[596px] md:min-h-0 md:rounded-[64px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[299px] w-[299px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-idea-section-glow blur-[80px] md:left-[calc(50%-279px)] md:top-[161px] md:h-[280px] md:w-[280px] md:translate-x-0 md:translate-y-0 md:rounded-2xl md:bg-idea-section-glow md:opacity-60 md:blur-[130px]"
        />

        <div className="relative z-10 flex h-full flex-col items-center px-4 pb-0 pt-14 text-center md:block md:px-16 md:pt-0 md:text-left">
          <div className="relative z-20 flex w-full max-w-[343px] flex-col items-center md:absolute md:left-16 md:top-1/2 md:w-[756px] md:max-w-none md:-translate-y-1/2 md:items-start">
            <h2 className="text-[32px] font-medium leading-9 tracking-[-0.02em] text-white md:text-[64px] md:leading-16 md:tracking-[-0.04em]">
              {bottomCta.title}
            </h2>
            <p className="mt-6 text-base font-normal leading-6 text-white md:mt-8 md:text-xl md:font-medium md:leading-7">
              {bottomCta.text}
            </p>
            <HeroCtaButton
              href={bottomCta.button.href}
              label={bottomCta.button.text}
              className="mt-6 h-16 w-full max-w-[343px] md:mt-8 md:w-[278px] md:max-w-none"
            />
          </div>

          <div className="relative z-10 mt-9 h-[278px] w-[520px] shrink-0 translate-x-[150px] md:absolute md:bottom-[-1px] md:right-[-80px] md:mt-0 md:h-[520px] md:w-[980px] md:translate-x-0">
            <picture>
              {getPreferredImageVariantUrl(bottomCta.image.variants, 400) ? (
                <source media="(max-width: 767px)" srcSet={getPreferredImageVariantUrl(bottomCta.image.variants, 400)} />
              ) : null}
              {getPreferredImageVariantUrl(bottomCta.image.variants, 1280) ? (
                <source media="(min-width: 768px) and (max-width: 1279px)" srcSet={getPreferredImageVariantUrl(bottomCta.image.variants, 1280)} />
              ) : null}
              {getPreferredImageVariantUrl(bottomCta.image.variants, 1920) ? (
                <source media="(min-width: 1280px)" srcSet={getPreferredImageVariantUrl(bottomCta.image.variants, 1920)} />
              ) : null}
              <Image
                src={bottomCta.image.url}
                alt={bottomCta.image.alt}
                title={bottomCta.image.title}
                fill
                sizes="(max-width: 767px) 520px, 980px"
                className="object-cover object-left-top"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
