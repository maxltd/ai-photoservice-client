import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import { IdeaImage } from "../pages/ideas/idea-page-shared";

export interface BottomCtaData {
  title: string;
  text: string;
  images: readonly [string, string] | readonly [string, string, string];
  button: {
    text: string;
    href: string;
  };
}

export function BottomCtaSection({
  bottomCta,
}: {
  bottomCta: BottomCtaData;
}) {
  const [leftImage, rightImage] = bottomCta.images;
  const bottomImage = bottomCta.images.length === 3 ? bottomCta.images[2] : undefined;

  return (
    <section className="mx-auto w-full px-0 py-0 md:px-16 md:pb-0 md:pt-36">
      <div className="relative mx-auto grid min-h-[651px] w-full max-w-[1792px] grid-cols-1 items-end gap-6 overflow-hidden rounded-[36px] bg-black px-4 py-16 text-center md:block md:h-[596px] md:min-h-0 md:rounded-[64px] md:px-16 md:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[299px] w-[299px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[linear-gradient(90deg,#FFC400_0%,#00FF1E_100%)] opacity-60 blur-[80px] md:h-[442px] md:w-[442px] md:blur-[100px]" />

        <div className="relative z-10 h-[267px] w-full md:absolute md:left-1/2 md:top-1/2 md:h-[308px] md:w-[1238px] md:-translate-x-1/2 md:-translate-y-1/2">
          <div className="absolute left-0 top-0 h-[186.4px] w-[152.34px] overflow-hidden rounded-[36px] -rotate-[15deg] md:left-[90px] md:top-[-72px] md:h-[197px] md:aspect-auto md:w-[161px]">
            {leftImage ? (
              <IdeaImage
                src={leftImage}
                alt={`${bottomCta.title} — левая иллюстрация`}
                sizes="(max-width: 767px) 152px, 161px"
              />
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
          </div>

          <div className="absolute left-[164px] top-0 h-[186.4px] w-[152.34px] overflow-hidden rounded-[36px] rotate-[15deg] md:left-[980px] md:top-[-64px] md:h-[197px] md:aspect-auto md:w-[161px]">
            {rightImage ? (
              <IdeaImage
                src={rightImage}
                alt={`${bottomCta.title} — правая иллюстрация`}
                sizes="(max-width: 767px) 152px, 161px"
              />
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
          </div>

          {bottomCta.images.length === 3 ? (
            <div className="absolute left-[104px] top-[133px] h-[113.54px] w-[92.73px] overflow-hidden rounded-2xl rotate-[15deg] md:left-[297px] md:top-[224px] md:h-[120px] md:aspect-auto md:w-[98px]">
              {bottomImage ? (
                <IdeaImage
                  src={bottomImage}
                  alt={`${bottomCta.title} — нижняя иллюстрация`}
                  sizes="(max-width: 767px) 93px, 98px"
                />
              ) : (
                <div className="absolute inset-0 bg-surface" />
              )}
            </div>
          ) : null}
        </div>

        <div className="relative z-20 w-full max-w-[756px] justify-self-center space-y-6 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:space-y-11">
          <h2 className="text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em] md:text-white">
            {bottomCta.title}
          </h2>
          <p className="text-base font-normal leading-6 text-white/80 md:text-xl md:font-medium md:leading-7 md:text-white">
            {bottomCta.text}
          </p>
          <HeroCtaButton
            href={bottomCta.button.href}
            label={bottomCta.button.text}
            className="mx-auto h-[64px] w-full max-w-[343px] px-5 md:h-[64px] md:w-[278px] md:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
