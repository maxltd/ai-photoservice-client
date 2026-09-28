import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import type { PhotoSessionIdeaCard, PhotoSessionIdeaContent } from "@/lib/api/contract";
import { IdeaImage, IdeaTagIcon, trendCardAlt } from "../pages/ideas/idea-page-shared";

interface MoreIdeasSectionProps {
  moreIdeasContent: PhotoSessionIdeaContent["moreIdeas"];
  items: PhotoSessionIdeaCard[];
}

interface IdeaCardProps {
  item: PhotoSessionIdeaCard;
  isActive: boolean;
}

function IdeaCard({ item, isActive }: IdeaCardProps) {
  const hasSplitLayout = Boolean(item.secondaryImages?.length);
  const cardClassName = hasSplitLayout
    ? "group relative flex h-[435px] min-w-[280px] shrink-0 snap-center flex-col gap-2 rounded-2xl bg-white/8 p-2 md:h-[554px] md:w-[368px] md:min-w-0 md:rounded-[36px]"
    : "group relative flex h-[435px] min-w-[280px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl bg-white/10 p-2 md:h-[554px] md:w-[368px] md:min-w-0 md:rounded-[36px]";

  return (
    <div className={cardClassName}>
      <Link
        href={item.href}
        aria-label={item.title}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none"
      />

      {hasSplitLayout ? (
        <>
          <div className="relative z-10 flex h-[291px] gap-[2px] overflow-hidden rounded-[16px] md:h-[388px] md:rounded-[32px]">
            <div className="relative w-[166px] shrink-0 overflow-hidden rounded-2xl md:w-[222px]">
              {item.image ? (
                <IdeaImage src={item.image} alt={trendCardAlt(item.title)} sizes="222px" />
              ) : (
                <div className="absolute inset-0 bg-surface" />
              )}

              {item.tag ? (
                <div className="absolute left-3 top-3 z-10">
                  <div
                    className={`flex h-[26px] w-[107px] items-center justify-center gap-1 rounded-full bg-gradient-to-r px-2 py-1 backdrop-blur-[8px] ${item.tag.gradient} md:h-10 md:w-[150px] md:px-4 md:py-2`}
                  >
                    <span className="text-[12px] font-medium text-white md:text-[14px]">
                      {item.tag.text}
                    </span>
                    <IdeaTagIcon icon={item.tag.icon} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex w-[96px] flex-col gap-[2px] md:w-[128px]">
              {item.secondaryImages?.slice(0, 2).map((src, index) => (
                <div
                  key={`${item.id}-secondary-${index}`}
                  className="relative h-[96px] flex-1 overflow-hidden rounded-2xl md:h-[128px]"
                >
                  <IdeaImage src={src} alt="" sizes="128px" />
                </div>
              ))}
              <div className="flex h-[96px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-white/8 px-4 md:h-[128px]">
                <Images className="h-4 w-4 text-white/30" aria-hidden="true" strokeWidth={1.5} />
                <span className="text-center text-[12px] leading-[18px] text-white md:text-[14px] md:leading-5">
                  5 фото
                  <br />
                  в наборе
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex min-h-[120px] flex-1 flex-col items-center justify-center gap-4 px-2 py-2 text-center md:min-h-[142px] md:p-4">
            <p className="min-w-0 w-full max-w-[248px] break-words text-base font-medium leading-6 text-white/80 md:max-w-[320px] md:text-2xl md:leading-[30px]">
              {item.title}
            </p>
            <HeroCtaButton
              href={item.href}
              label="Создать"
              variant={isActive ? "primary" : "secondary"}
              className="h-16 w-full max-w-[248px] px-5 md:max-w-[320px]"
            />
          </div>
        </>
      ) : (
        <>
          <div className="relative z-10 h-[291px] overflow-hidden rounded-2xl md:h-[388px] md:rounded-[32px]">
            {item.image ? (
              <IdeaImage src={item.image} alt={trendCardAlt(item.title)} sizes="352px" />
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000_100%)]" />
          </div>
          <div className="relative z-10 flex min-h-[120px] flex-1 flex-col items-center justify-center gap-4 px-2 py-2 text-center md:min-h-[142px] md:p-4">
            <p className="min-w-0 w-full max-w-[248px] break-words text-base font-medium leading-6 text-white/80 md:max-w-[320px] md:text-2xl md:leading-[30px]">
              {item.title}
            </p>
            <HeroCtaButton
              href={item.href}
              label="Создать"
              variant={isActive ? "primary" : "secondary"}
              className="h-16 w-full max-w-[248px] px-5 md:max-w-[320px]"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function MoreIdeasSection({
  moreIdeasContent,
  items,
}: MoreIdeasSectionProps) {
  const isDefaultTitle = moreIdeasContent.title === "Больше идей для фотосессий";

  return (
    <section className="mx-auto w-full py-16 md:pb-0 md:pt-36">
      <div className="relative mx-auto max-w-[1920px] overflow-hidden rounded-3xl bg-gradient-to-b from-[rgba(0,61,243,0.2)] to-transparent px-4 py-16 md:min-h-[950px] md:rounded-[60px] md:px-16 md:py-36">
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[200px] w-[200px] -translate-x-1/2 rounded-2xl bg-[linear-gradient(100.9deg,#5BCFFF_2.38%,rgba(11,127,210,0.8)_100%)] opacity-60 blur-[100px] md:top-[341px] md:h-[480px] md:w-[480px]" />

        <div className="relative z-10 mx-auto max-w-[1200px] text-center">
          <h2 className="flex flex-wrap items-start justify-center gap-x-2 text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:flex-nowrap md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">
            {isDefaultTitle ? (
              <>
                <span>Больше</span>
                <Image
                  src="/icons/ideas/Lamp.svg"
                  alt=""
                  aria-hidden="true"
                  width={60}
                  height={60}
                  className="mt-0.5 h-9 w-9 shrink-0 md:mt-0 md:h-[60px] md:w-[60px]"
                />
                <span className="bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent">
                  идей
                </span>
                <span className="basis-full md:basis-auto">для фотосессий</span>
              </>
            ) : (
              moreIdeasContent.title
            )}
          </h2>
        </div>

        <div className="scrollbar-hide relative z-10 mt-9 flex snap-x snap-mandatory justify-start gap-3 overflow-x-auto scroll-px-[31.5px] px-[31.5px] pb-2 md:mx-auto md:mt-[60px] md:max-w-[1792px] md:justify-center md:gap-6 md:overflow-visible md:px-0">
          {items.map((item, index) => (
            <IdeaCard key={item.id} item={item} isActive={index === 2} />
          ))}
        </div>

        <div className="relative z-10 mt-8 text-center">
          <HeroCtaButton
            href={moreIdeasContent.cta.href}
            label={moreIdeasContent.cta.text}
            className="mx-auto h-[64px] w-[343px] px-6 md:w-[320px]"
          />
        </div>
      </div>
    </section>
  );
}
