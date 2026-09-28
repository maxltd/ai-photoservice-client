import { SocialProof } from "@/components/main/SocialProof";
import { ContentImage, contentImageAlt } from "./ContentImage";
type HeroImage = {
  url: string;
  alt?: string;
  variants?: import("@/lib/api/contract").ImageVariants | null;
};
type HeroMobileData = { showRating?: boolean; rating?: string };

export function HeroMobileImageMarquee({
  title,
  images,
  hero,
}: {
  title: string;
  images: HeroImage[];
  hero: HeroMobileData;
}) {
  const loop = [...images, ...images];
  return (
    <div className="md:hidden">
      <div className="w-full overflow-hidden">
        <div className="animate-marquee flex w-max gap-2">
          {loop.map((image, index) => (
            <div
              key={`mobile-hero-${image.url}-${index}`}
              className="relative h-32 w-[104px] shrink-0 overflow-hidden rounded-lg"
            >
              {image.url ? (
                <ContentImage
                  src={image.url}
                  variants={image.variants}
                  alt={image.alt ?? `${title} — пример ИИ-фотосессии`}
                  priority={index === 0}
                  sizes="104px"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <SocialProof
        className="relative z-10 mt-8 flex w-full justify-start overflow-hidden md:hidden"
        text="Более 10 000+ пользователей уже создали свои нейрофото"
        classNames={{ root: "justify-start", textWrap: "w-[180px]" }}
        showRating={Boolean(hero.showRating)}
        rating={hero.rating}
      />
    </div>
  );
}
