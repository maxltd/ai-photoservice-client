'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PhotoSessionIdeaCard, PhotoSessionIdeaCardTag } from '@/lib/api/contract';

type Idea = PhotoSessionIdeaCard;

const BADGES: PhotoSessionIdeaCardTag[] = [
  { text: 'В тренде', gradient: 'bg-gradient-idea-badge-trend' },
  { text: 'В тренде', gradient: 'bg-gradient-idea-badge-trend' },
  { text: 'Новое', gradient: 'bg-gradient-style-step-blue' },
  { text: 'Новое', gradient: 'bg-gradient-style-step-blue' },
  { text: 'Популярное', gradient: 'bg-gradient-style-step-purple' },
  { text: 'Популярное', gradient: 'bg-gradient-style-step-purple' },
];

function createBadgeMap(ideas: readonly Idea[]): Record<string, PhotoSessionIdeaCardTag> {
  const map: Record<string, PhotoSessionIdeaCardTag> = {};
  const badgeCount = Math.min(ideas.length, BADGES.length);

  for (let index = 0; index < badgeCount; index += 1) {
    const idea = ideas[index];
    const badge = BADGES[index];
    if (idea && badge) map[idea.id] = badge;
  }

  return map;
}

function IdeaCard({ idea, tag, isActive }: { idea: Idea; tag?: PhotoSessionIdeaCardTag; isActive: boolean }): React.JSX.Element {
  const images = [idea.image, ...(idea.secondaryImages ?? [])];
  const imageCount = idea.imageCount || images.filter(Boolean).length;

  return (
    <div className="snap-start flex h-[435px] w-[280px] flex-shrink-0 flex-col gap-2 rounded-[36px] border border-white/10 bg-white/8 p-2 backdrop-blur-xl md:h-[554px] md:w-[368px]">
      <div className="relative flex h-[291px] w-[264px] flex-row gap-[2px] overflow-hidden rounded-[32px] md:h-[388px] md:w-[352px]">
        <div className="relative h-full w-[166px] overflow-hidden rounded-2xl md:w-[222px]">
          {images[0] ? <Image src={images[0]} alt={idea.title} fill className="object-cover" /> : null}
          {tag ? <div className="absolute left-3 top-3 z-10"><div className={`flex items-center gap-1 rounded-full px-2 py-1 backdrop-blur-[8px] md:px-4 md:py-2 ${tag.gradient}`}><span className="text-xs font-normal leading-[18px] text-white md:text-base md:leading-6">{tag.text}</span><Sparkles className="h-4 w-4 text-white/80" /></div></div> : null}
        </div>
        <div className="flex h-full w-[96px] flex-col gap-[2px] md:w-[128px]">
          {[images[1], images[2]].map((image, index) => (
            <div key={`${idea.id}-image-${index}`} className="relative h-[96px] w-full flex-1 overflow-hidden rounded-2xl md:h-[128px]">
              {image ? <Image src={image} alt="" fill className="object-cover" /> : null}
            </div>
          ))}
          <div className="flex h-[96px] w-full items-center justify-center rounded-2xl bg-white/8 backdrop-blur-md md:h-[128px]">
            <div className="text-center"><ImageIcon className="mx-auto mb-1 h-4 w-4 text-white/50" /><span className="text-[10px] text-white md:text-[12px]">{imageCount} фото<br />в наборе</span></div>
          </div>
        </div>
      </div>
      <div className="mt-auto flex h-[120px] w-[264px] flex-col items-center justify-center gap-4 md:h-[142px] md:w-[352px]">
        <h3 className="text-center text-base font-medium leading-6 text-white/80 md:text-2xl md:leading-[30px] md:tracking-[-0.02em]">{idea.title}</h3>
        <Link href={idea.href} className={`flex h-16 w-[248px] items-center justify-center gap-2.5 rounded-[64px] border border-white/10 backdrop-blur-md transition-colors hover:bg-white/15 md:w-[320px] ${isActive ? 'bg-pricing-button bg-[image:var(--gradient-pricing-button)] bg-blend-color-dodge' : 'bg-pricing-panel bg-[image:var(--gradient-pricing-panel)]'}`}><Sparkles className="h-6 w-6 text-white" /><span className="text-lg font-bold leading-6 text-white">Создать</span></Link>
      </div>
    </div>
  );
}

export function PopularIdeasCarousel({ ideas }: { ideas: Idea[] }): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [badgeMap] = useState<Record<string, PhotoSessionIdeaCardTag>>(() => createBadgeMap(ideas));
  const isHovered = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);


  const scrollToCard = useCallback((index: number): void => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? 280 : 368;
    const gap = isMobile ? 8 : 24;
    scrollRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  const handleNext = useCallback((): void => {
    const nextIndex = (activeIndex + 1) % ideas.length;
    setActiveIndex(nextIndex);
    setProgress(0);
    scrollToCard(nextIndex);
  }, [activeIndex, ideas.length, scrollToCard]);

  const handlePrev = useCallback((): void => {
    const prevIndex = (activeIndex - 1 + ideas.length) % ideas.length;
    setActiveIndex(prevIndex);
    setProgress(0);
    scrollToCard(prevIndex);
  }, [activeIndex, ideas.length, scrollToCard]);

  useEffect(() => {
    if (isHovered.current || ideas.length === 0) return;
    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          handleNext();
          return 0;
        }
        return previous + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [handleNext, ideas.length]);

  if (ideas.length === 0) return null;

  const handleScroll = (): void => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? 280 : 368;
    const gap = isMobile ? 10 : 30;
    const index = Math.round(scrollRef.current.scrollLeft / (cardWidth + gap));
    if (index !== activeIndex && index >= 0 && index < ideas.length) {
      setActiveIndex(index);
      setProgress(0);
    }
  };

  return (
    <>
      <div ref={scrollRef} onScroll={handleScroll} onMouseEnter={() => { isHovered.current = true; }} onMouseLeave={() => { isHovered.current = false; }} className="flex h-[435px] w-full items-center overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory md:h-[583px]">
        <div className="flex w-max gap-2 px-0 md:gap-6 md:px-0">{ideas.map((idea, index) => <IdeaCard key={idea.id} idea={idea} tag={badgeMap[idea.id]} isActive={index === activeIndex} />)}</div>
      </div>
      <div className="flex h-24 w-full max-w-[343px] flex-col items-center justify-between gap-6 md:h-16 md:max-w-[1792px] md:flex-row md:justify-between md:gap-[465px]">
        <div className="flex h-2 w-[180px] items-center justify-center gap-2 md:justify-start">
          {ideas.map((idea, index) => <div key={idea.id} className="relative"><div className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-[56px] bg-white/30' : 'w-2 bg-white/8'}`} />{index === activeIndex ? <div className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} /> : null}</div>)}
        </div>
        <div className="md:flex md:flex-row md:mr-10">
          <div className="hidden h-[64px] w-[266px] flex-row items-center justify-center gap-2 md:flex"><button aria-label="Предыдущая идея" onClick={handlePrev} className="flex h-[64px] w-[64px] items-center justify-center rounded-[64px] border border-white/8 transition-colors hover:bg-white/15"><ChevronLeft className="h-6 w-6 text-white" /></button><button aria-label="Следующая идея" onClick={handleNext} className="flex h-[64px] w-[64px] items-center justify-center rounded-[64px] border border-white/8 transition-colors hover:bg-white/15"><ChevronRight className="h-6 w-6 text-white" /></button></div>
          <Link href="/ideas/" className="flex h-[64px] w-[343px] items-center justify-center gap-2.5 rounded-[64px] border border-white/10 bg-white/8 backdrop-blur-[12px] transition-colors hover:bg-white/15 md:w-[122px]"><span className="text-[18px] font-bold text-white">Все идеи</span></Link>
        </div>
      </div>
    </>
  );
}
