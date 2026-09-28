'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlogArticleListItem } from '@/lib/api/contract';

interface ExperienceCarouselProps {
  articles: BlogArticleListItem[];
}

export function ExperienceCarousel({ articles }: ExperienceCarouselProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const isHovered = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = articles.length;
  const currentIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0;

  const scrollToCard = useCallback((index: number): void => {
    scrollRef.current?.scrollTo({ left: index * 455, behavior: 'smooth' });
  }, []);

  const handleNext = useCallback((): void => {
    if (total === 0) return;
    const next = (currentIndex + 1) % total;
    setActiveIndex(next);
    setProgress(0);
    scrollToCard(next);
  }, [currentIndex, scrollToCard, total]);

  const handlePrev = useCallback((): void => {
    if (total === 0) return;
    const prev = (currentIndex - 1 + total) % total;
    setActiveIndex(prev);
    setProgress(0);
    scrollToCard(prev);
  }, [currentIndex, scrollToCard, total]);

  useEffect(() => {
    if (total === 0) return undefined;
    const interval = setInterval(() => {
      if (!isHovered.current) {
        setProgress((previous) => {
          if (previous >= 100) {
            handleNext();
            return 0;
          }
          return previous + 2;
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [handleNext, total]);

  const handleScroll = (): void => {
    if (!scrollRef.current || total === 0) return;
    const index = Math.round(scrollRef.current.scrollLeft / 455);
    if (index !== currentIndex && index >= 0 && index < total) {
      setActiveIndex(index);
      setProgress(0);
    }
  };

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
        className="relative z-10 w-full overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
      >
        <div className="flex gap-[25px] w-max px-4 md:px-0">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="flex-shrink-0 w-[280px] md:w-[430px] flex flex-col gap-2 md:gap-6"
            >
              <div className="relative w-[280px] md:w-[430px] h-[210px] md:h-[322px] rounded-2xl md:rounded-[36px] overflow-hidden bg-zinc-800">
                {article.image ? <Image src={article.image} alt={article.title} fill className="object-cover" /> : null}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[12px] md:text-[20px] leading-[18px] md:leading-[28px] font-medium text-white/30">
                  {new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <h3 className="text-[16px] md:text-[24px] leading-[24px] md:leading-[30px] font-medium tracking-[-0.02em] text-white/80">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 w-full max-w-[343px] md:max-w-[1792px] h-auto md:h-[64px]">
        <div className="flex gap-2 w-[180px] h-2 items-center justify-center md:justify-start">
          {articles.map((article, index) => (
            <div key={article.id} className="relative">
              <div className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-[56px] bg-white/30' : 'w-2 bg-white/8'}`} />
              {index === currentIndex ? <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} /> : null}
            </div>
          ))}
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <button onClick={handlePrev} disabled={total === 0} className="w-[64px] h-[64px] rounded-[64px] border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40" aria-label="Предыдущая статья"><ChevronLeft className="w-6 h-6 text-white" /></button>
            <button onClick={handleNext} disabled={total === 0} className="w-[64px] h-[64px] rounded-[64px] border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40" aria-label="Следующая статья"><ChevronRight className="w-6 h-6 text-white" /></button>
          </div>
          <Link href="/blog" className="w-[343px] md:w-[141px] h-[64px] rounded-[64px] border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors" style={{ background: 'radial-gradient(55.38% 100% at 50% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
            <span className="text-[18px] font-bold text-white">Все записи</span>
          </Link>
        </div>
      </div>
    </>
  );
}
