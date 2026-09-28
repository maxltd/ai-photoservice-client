import type { PhotoSessionIdeaContent } from "@/lib/api/contract";
import { contentImageAlt } from "./ContentImage";
import { ResponsiveImage } from "./ResponsiveImage";
import { HeroMobileImageMarquee } from "./HeroMobileImageMarquee";
import { HeroTextBlock } from "./HeroTextBlock";

interface HeroLayoutProps {
  title: string;
  hero: PhotoSessionIdeaContent["hero"];
  mainImage: string | null;
}

export function HeroLayout({ title, hero, mainImage }: HeroLayoutProps) {
  const baseImages = hero.images
    .filter((item) => Boolean(item.url))
    .slice(0, 7);
  const desktopHeroImages =
    baseImages.length > 0
      ? [
          ...baseImages,
          ...Array.from({ length: Math.max(0, 7 - baseImages.length) }, () => ({
            url: "",
            variants: null,
            alt: "",
            title: "",
          })),
        ]
      : mainImage
        ? [{ url: mainImage, variants: null, alt: contentImageAlt(title) }]
        : [];
  const desktopHeroLoop = [...desktopHeroImages, ...desktopHeroImages];
  const rightVisualImages =
    desktopHeroImages.length === 7
      ? [
          desktopHeroImages[6],
          desktopHeroImages[5],
          desktopHeroImages[4],
          desktopHeroImages[0],
          desktopHeroImages[2],
          desktopHeroImages[1],
          desktopHeroImages[3],
        ]
      : desktopHeroImages.slice().reverse();
  const desktopHeroRightImages =
    rightVisualImages.length > 0
      ? [rightVisualImages[0], ...rightVisualImages.slice(1).reverse()]
      : [];
  const desktopHeroReverseLoop = [
    ...desktopHeroRightImages,
    ...desktopHeroRightImages,
  ];
  return (
    <div className="grid w-full min-w-0 gap-8 md:grid-cols-[minmax(0,883px)_minmax(0,732px)] md:items-start md:gap-[177px]">
      <HeroTextBlock title={title} hero={hero} />
      <div className="order-2 md:absolute md:right-0 md:-top-8 md:bottom-0 md:h-auto md:w-[732px]">
        <HeroMobileImageMarquee
          title={title}
          images={desktopHeroImages}
          hero={hero}
        />
        <div className="relative hidden h-full grid-cols-2 gap-4 md:grid">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[200px] bg-gradient-to-t from-[#101010] to-transparent" />
          <div className="relative overflow-hidden rounded-[36px]">
            <div className="animate-ideas-marquee-y flex flex-col gap-4">
              {desktopHeroLoop.map((image, index) => (
                <div
                  key={`desktop-hero-left-${image.url}-${index}`}
                  className="relative aspect-[2/3] overflow-hidden rounded-[36px]"
                >
                  {image.url ? (
                    <ResponsiveImage
                      src={image.url}
                      alt={image.alt ?? contentImageAlt(title)}
                      priority={index < 2}
                      variants={image.variants}
                      sizes="358px"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[36px]">
            <div className="animate-ideas-marquee-y-reverse flex flex-col gap-4">
              {desktopHeroReverseLoop.map((image, index) => (
                <div
                  key={`desktop-hero-right-${image.url}-${index}`}
                  className="relative aspect-[2/3] overflow-hidden rounded-[36px]"
                >
                  {image.url ? (
                    <ResponsiveImage
                      src={image.url}
                      variants={image.variants}
                      alt={image.alt ?? contentImageAlt(title)}
                      sizes="170px"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
