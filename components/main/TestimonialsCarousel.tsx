'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GreenStarIcon } from './icons';
import type { HomepageTestimonialResponse } from '@/lib/api/contract';
import Image from 'next/image';

function ReviewCard({ review, desktop }: { review: HomepageTestimonialResponse; desktop: boolean }): React.JSX.Element {
  return (
    <div className={desktop ? 'flex-shrink-0 flex flex-col justify-center items-start gap-6 rounded-[36px] p-9' : 'flex-shrink-0 flex flex-col justify-center items-start gap-6 rounded-2xl p-4'} style={{ width: desktop ? '432px' : '280px', height: desktop ? '520px' : '480px', background: 'radial-gradient(55.38% 100% at 50% 100%, rgba(255, 255, 255, 0.16) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.08)' }}>
      <div className="w-11 h-11 flex items-center justify-center rounded-[64px] flex-shrink-0"><Image src="/icons/landing/testimonials/quote.svg" alt="" width={44} height={44} /></div>
      <p className="text-[16px] font-medium leading-6 text-white/80 flex-1">{review.text}</p>
      <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="flex flex-row items-center justify-between w-full"><span className="text-[16px] font-medium leading-6 text-white/80">{review.authorName}</span><div className="flex flex-row items-center gap-1">{Array.from({ length: review.rating }, (_, index) => <GreenStarIcon key={index} />)}</div></div>
    </div>
  );
}

export function TestimonialsCarousel({ testimonials }: { testimonials: HomepageTestimonialResponse[] }): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  const scrollToCard = useCallback((index: number): void => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? 280 : 432;
    const gap = isMobile ? 16 : 24;
    scrollRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  const handleNext = useCallback((): void => {
    const next = (activeIndex + 1) % testimonials.length;
    setActiveIndex(next); setProgress(0); scrollToCard(next);
  }, [activeIndex, scrollToCard, testimonials.length]);

  const handlePrev = useCallback((): void => {
    const prev = (activeIndex - 1 + testimonials.length) % testimonials.length;
    setActiveIndex(prev); setProgress(0); scrollToCard(prev);
  }, [activeIndex, scrollToCard, testimonials.length]);

  useEffect(() => {
    if (isHovered.current) return;
    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) { handleNext(); return 0; }
        return previous + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [handleNext]);

  const handleScroll = (): void => {
    if (!scrollRef.current) return;
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? 280 : 432;
    const gap = isMobile ? 16 : 24;
    const index = Math.round(scrollRef.current.scrollLeft / (cardWidth + gap));
    if (index !== activeIndex && index >= 0 && index < testimonials.length) { setActiveIndex(index); setProgress(0); }
  };

  return (
    <>
      <div ref={scrollRef} onScroll={handleScroll} onMouseEnter={() => { isHovered.current = true; }} onMouseLeave={() => { isHovered.current = false; }} className="relative z-10 w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        <div className="flex gap-4 md:gap-6 px-4 md:px-0 w-max">
          <div className="flex gap-4 md:hidden w-max">{testimonials.map((review) => <ReviewCard key={review.id} review={review} desktop={false} />)}</div>
          <div className="hidden md:flex gap-6 w-max">{testimonials.map((review) => <ReviewCard key={review.id} review={review} desktop />)}</div>
        </div>
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-[343px] md:max-w-[1792px] gap-4">
        <div className="flex gap-2 items-center justify-center h-2">{testimonials.map((_, index) => <div key={index} className="relative"><div className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-14 bg-white/30' : 'w-2 bg-white/8'}`} />{index === activeIndex && <div className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />}</div>)}</div>
        <div className="hidden md:flex items-center gap-2"><button onClick={handlePrev} className="w-16 h-16 rounded-[64px] border border-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"><ChevronLeft className="w-6 h-6 text-white" /></button><button onClick={handleNext} className="w-16 h-16 rounded-[64px] border border-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"><ChevronRight className="w-6 h-6 text-white" /></button></div>
      </div>
    </>
  );
}
