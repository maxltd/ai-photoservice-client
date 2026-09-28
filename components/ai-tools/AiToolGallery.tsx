import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import { ResponsiveImage } from "@/components/ui/shared/ResponsiveImage";
import type { AiToolPageContent } from "@/lib/api/contract";
export function AiToolGallery({
  section,
}: {
  section: AiToolPageContent["gallery"];
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1920px] flex-col items-center gap-9 rounded-[24px] bg-black px-4 py-16 md:gap-[60px] md:rounded-[60px] md:px-16 md:pb-0 md:pt-[144px]">
      <div className="flex w-full max-w-[343px] flex-col items-center gap-4 text-center md:max-w-[884px] md:gap-9">
        <h2 className="w-full text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">
          {section.title}
        </h2>
        <p className="w-full text-base font-normal leading-6 text-white/80 md:text-xl md:font-medium md:leading-7">
          {section.description}
        </p>
      </div>
      <div className="relative grid w-full grid-cols-2 gap-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-24 after:content-[''] after:bg-gradient-to-t after:from-black after:to-transparent md:grid-cols-5 md:gap-6 md:after:h-32">
        {section.items
          .filter((image) => image.url.trim().length > 0)
          .map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-[167/207] overflow-hidden rounded-2xl md:aspect-[339.2/420] md:rounded-[36px]"
            >
              <ResponsiveImage
                src={image.url}
                alt={image.alt}
                variants={image.variants}
                sizes="(max-width: 767px) 50vw, 20vw"
              />
            </div>
          ))}
      </div>
      <HeroCtaButton
        href="/app/create"
        label="Перейти в редактор"
        className="h-[68px] w-full max-w-[343px] md:h-16 md:w-[255px]"
      />
    </section>
  );
}
