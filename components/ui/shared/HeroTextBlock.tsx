import { SocialProof } from "@/components/main/SocialProof";
import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import { sanitizeHtml } from "@/lib/sanitize-html";
type HeroTextData = {
  description: string;
  cta: { text: string; href: string };
  showRating?: boolean;
  rating?: string;
};

export function HeroTextBlock({
  title,
  hero,
}: {
  title: string;
  hero: HeroTextData;
}) {
  return (
    <div className="order-1 w-full min-w-0 space-y-9 md:flex md:h-[592px] md:flex-col md:justify-between md:space-y-0">
      <div className="w-full min-w-0 space-y-9">
        <h1 className="w-full max-w-[343px] break-words text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-white/80 md:max-w-[883px] md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">
          {title}
        </h1>
        <div
          className="w-full max-w-[343px] break-words text-sm leading-5 text-white/70 md:max-w-[883px] md:text-base md:leading-6"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(hero.description) }}
        />
      </div>
      <HeroCtaButton
        href={hero.cta.href}
        label={hero.cta.text}
        className="h-[64px] w-full max-w-[343px] md:h-[68px] md:w-[256.7px]"
      />
      <SocialProof
        className="hidden md:mx-0 md:flex md:self-start"
        text="Более 10 000+ пользователей уже создали свои нейрофото"
        showRating={Boolean(hero.showRating)}
        rating={hero.rating}
      />
    </div>
  );
}
