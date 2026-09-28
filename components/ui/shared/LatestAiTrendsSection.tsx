import Link from "next/link";
import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import type { PhotoSessionIdeaCard, PhotoSessionIdeaContent } from "@/lib/api/contract";
import { IdeaImage, TrendStarsIcon, trendCardAlt } from "../pages/ideas/idea-page-shared";

interface LatestAiTrendsSectionProps {
  trendsContent: PhotoSessionIdeaContent["trends"];
  trends: PhotoSessionIdeaCard[];
}

export function LatestAiTrendsSection({ trendsContent, trends }: LatestAiTrendsSectionProps) {
  const trendsDesktop = trends.slice(0, 15);
  const trendsMobile = trends.slice(0, 14);

  return (
    <section className="relative isolate mx-auto w-full overflow-hidden rounded-3xl bg-black px-4 py-16 md:rounded-[64px] md:px-16 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-[341px] z-0 h-[200px] w-[200px] -translate-x-1/2 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[100px] md:top-[398px] md:h-[442px] md:w-[442px] md:blur-[130px]" />
      <div className="relative z-10 mx-auto max-w-[1792px]">
        <div className="mx-auto max-w-[884px] text-center">
          <h2 className="text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">
            {trendsContent.title}
          </h2>
          <p className="mt-4 text-base leading-6 text-white/80 md:mt-6 md:text-xl md:leading-7">
            {trendsContent.subtitle}
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-2 md:hidden">
          {trendsMobile.map((trend) => (
            <Link
              key={`mobile-${trend.id}`}
              href={trend.href}
              className="group relative h-[191px] overflow-hidden rounded-2xl bg-white/8"
            >
              {trend.image ? (
                <IdeaImage src={trend.image} alt={trendCardAlt(trend.title)} sizes="167px" />
              ) : (
                <div className="absolute inset-0 bg-surface" />
              )}
              <div className="absolute inset-0 bg-gradient-idea-card-overlay" />
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-base font-medium leading-6 text-white/80">{trend.title}</p>
                {trend.usageCount ? (
                  <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0">
                    <TrendStarsIcon size={16} />
                    <span className="shrink-0 whitespace-nowrap bg-gradient-to-br from-[#B7FF53] to-[#6FA91E] bg-clip-text text-xs text-transparent opacity-70">
                      {trend.usageCount} генераций
                    </span>
                    {trend.usagePeriod ? (
                      <span className="shrink-0 whitespace-nowrap text-xs leading-[18px] text-white/70">{trend.usagePeriod}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 hidden grid-cols-5 gap-6 md:grid">
          {trendsDesktop.map((trend) => (
            <div
              key={`desktop-${trend.id}`}
              className="group relative h-[420px] overflow-hidden rounded-[36px] bg-white/8"
            >
              <Link href={trend.href} className="absolute inset-0" aria-label={trend.title}>
                {trend.image ? (
                  <IdeaImage src={trend.image} alt={trendCardAlt(trend.title)} sizes="339px" />
                ) : (
                  <div className="absolute inset-0 bg-surface" />
                )}
                <div className="absolute inset-0 bg-gradient-idea-card-overlay" />
                <div className="absolute inset-x-4 bottom-4 transition-[bottom] duration-200 group-hover:bottom-[92px] group-focus-within:bottom-[92px]">
                  <p className="text-2xl font-medium leading-[30px] tracking-[-0.02em] text-white/80">{trend.title}</p>
                  {trend.usageCount ? (
                    <div className="mt-2 flex items-center gap-1">
                      <TrendStarsIcon size={24} />
                      <span className="shrink-0 whitespace-nowrap bg-gradient-to-br from-[#B7FF53] to-[#6FA91E] bg-clip-text text-base text-transparent opacity-70">
                        {trend.usageCount} генераций
                      </span>
                      {trend.usagePeriod ? (
                        <span className="shrink-0 whitespace-nowrap text-base leading-6 text-white/70">{trend.usagePeriod}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </Link>
              <HeroCtaButton
                href={trend.href}
                label="Создать с собой"
                className="absolute inset-x-3 bottom-3 z-10 hidden h-[68px] w-auto max-w-none px-[21px] text-[18.9px] md:group-hover:flex md:group-focus-within:flex"
              />
            </div>
          ))}
        </div>

        <div className="mt-9 text-center md:mt-16">
          <HeroCtaButton
            href={trendsContent.cta.href}
            label={trendsContent.cta.text}
            className="mx-auto h-[68px] w-full max-w-[343px] px-6 text-[18.9px] md:max-w-[315.2px]"
          />
        </div>
      </div>
    </section>
  );
}
