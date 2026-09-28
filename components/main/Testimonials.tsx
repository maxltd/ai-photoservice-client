import { TestimonialsCarousel } from './TestimonialsCarousel';
import { GreenStarIcon, CornLeftIcon, CornRightIcon } from './icons';
import type { HomepageTestimonialResponse } from '@/lib/api/contract';
import Image from 'next/image';

const AVATAR_IMAGES = [
  '/images/landing/hero/img_avatar_01.webp',
  '/images/landing/hero/img_avatar_02.webp',
  '/images/landing/hero/img_avatar_03.webp',
  '/images/landing/hero/img_avatar_04.webp',
];

export const TestimonialsSection = ({ testimonials = [] }: { testimonials?: HomepageTestimonialResponse[] }): React.JSX.Element => {
  if (testimonials.length === 0) return <></>;
  const averageRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0) / testimonials.length;

  return (
    <section className="snap-section relative w-full bg-[#000000] flex flex-col items-center justify-center py-16 px-4 md:py-[144px] md:px-16 gap-9 md:gap-16 overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 rounded-2xl pointer-events-none" style={{ width: '299px', height: '299px', top: 'calc(50% - 149px)', background: '#3098D3', filter: 'blur(80px)', opacity: 0.6 }} />
      <div className="absolute left-1/2 -translate-x-1/2 rounded-2xl pointer-events-none hidden md:block" style={{ width: '442px', height: '442px', top: '398px', background: '#3098D3', filter: 'blur(130px)', opacity: 0.6 }} />
      <h2 className="relative z-10 text-[32px] md:text-[64px] font-medium leading-[36px] md:leading-[64px] tracking-[-0.02em] md:tracking-[-0.04em] text-white/80 text-center">Отзывы наших пользователей</h2>
      <div className="relative z-10 flex flex-row items-center gap-[8.14px] h-[52.88px] justify-center">
        <div className="w-[16.27px] h-[52.88px] shrink-0 flex items-center justify-center"><CornLeftIcon /></div>
        <div className="hidden md:flex flex-row items-center w-[113.9px] h-[40.68px] shrink-0">
          {AVATAR_IMAGES.map((src, index) => <Image key={src} src={src} alt="" width={40.68} height={40.68} className="w-[40.68px] h-[40.68px] rounded-full border-2 border-black object-cover flex-shrink-0" style={{ marginLeft: index > 0 ? '-16.27px' : '0' }} />)}
        </div>
        <span className="text-white/80 text-[12px] md:text-[14px] leading-[18px] md:leading-6 text-center w-[214px] md:w-[240px]">Более 10 000+ пользователей уже создали свои нейрофото</span>
        <div className="w-[36px] h-0 border border-white/[0.08] rotate-90 shrink-0" />
        <div className="w-6 h-6 shrink-0"><GreenStarIcon /></div>
        <span className="text-white text-[16px] md:text-[20px] font-medium leading-6 md:leading-7 text-center shrink-0">{averageRating.toFixed(1)}</span>
        <div className="w-[16.27px] h-[52.88px] shrink-0 flex items-center justify-center"><CornRightIcon /></div>
      </div>
      <TestimonialsCarousel testimonials={testimonials} />
    </section>
  );
};
