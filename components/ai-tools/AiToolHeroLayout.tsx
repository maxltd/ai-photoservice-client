import type { ReactNode } from "react";
import { HeroTextBlock } from "@/components/ui/shared/HeroTextBlock";
import { HeroMobileImageMarquee } from "@/components/ui/shared/HeroMobileImageMarquee";
import { ResponsiveImage } from "@/components/ui/shared/ResponsiveImage";
import type { AiToolPageContent } from "@/lib/api/contract";

export function AiToolHeroLayout({
  title,
  hero,
  breadcrumbs,
}: {
  title: string;
  hero: AiToolPageContent["hero"];
  breadcrumbs?: ReactNode;
}) {
  const images = hero.images.filter((image) => image.url);
  const loop = [...images, ...images];
  return (
    <section className="relative mx-auto w-full overflow-hidden rounded-t-[24px] px-4 pb-16 pt-6 md:rounded-[60px] md:px-16 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8 z-0 overflow-hidden">
        <div className="absolute inset-0 rounded-t-[24px] bg-[linear-gradient(180deg,#003DF3_0%,rgba(0,61,243,0)_100%)] opacity-20 md:left-1/2 md:w-[1920px] md:-translate-x-1/2 md:rounded-[60px]" />
        <div className="absolute -left-8 -top-12 h-40 w-40 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[50px] md:left-[calc(50%_-_240px_+_313px)] md:top-[calc(50%_-_240px)] md:h-[480px] md:w-[480px] md:blur-[100px]" />
        <div className="absolute -left-8 -top-12 hidden h-40 w-40 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[50px] md:left-[calc(50%_-_240px_-_967px)] md:top-[calc(50%_-_240px_-_400px)] md:h-[480px] md:w-[480px] md:blur-[100px] md:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1792px]">
        {breadcrumbs}
        <div className="grid w-full min-w-0 gap-8 md:grid-cols-[minmax(0,883px)_minmax(0,732px)] md:items-start md:gap-[177px]">
          <HeroTextBlock title={title} hero={hero} />
          <div className="order-2 md:absolute md:right-0 md:-top-8 md:bottom-0 md:h-auto md:w-[732px]">
            <HeroMobileImageMarquee title={title} images={images} hero={hero} />
            <div className="relative hidden h-full overflow-hidden rounded-[36px] md:block">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[200px] bg-gradient-to-t from-page-surface to-transparent" />
              <div className="animate-ideas-marquee-y flex flex-col gap-4">
                {loop.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="relative aspect-[2/3] overflow-hidden rounded-[36px]"
                  >
                    <ResponsiveImage
                      src={image.url}
                      alt={image.alt || `${title} — пример работы`}
                      variants={image.variants}
                      priority={index < 2}
                      sizes="732px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
