import Image from 'next/image';
import { FinalCTAButtons } from './FinalCTAButtons';

export const FinalCTASection = (): React.JSX.Element => {
  return (
    <section className="snap-section relative flex items-center justify-center pb-0 pt-16 px-4 md:pb-0 md:pt-[144px] bg-black overflow-hidden">
      <div
        className="absolute rounded-2xl pointer-events-none"
        style={{
          width: '299px',
          height: '299px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#3098D3',
          filter: 'blur(80px)',
          borderRadius: '16px',
        }}
      />

      <div className="md:hidden relative z-10 flex flex-col justify-center items-center gap-6 w-[343px] pt-0">
        <h2 className="text-[32px] leading-[36px] font-medium text-center tracking-[-0.02em] text-white/80 w-full">
          Начните создавать свои ИИфото прямо сейчас
        </h2>
        <p className="text-[16px] leading-[24px] font-normal text-center text-white/80 w-full">
          Попробуйте бесплатно – никакой карты не требуется. Убедитесь сами, насколько просто получить профессиональные снимки и обработать любые фотографии
        </p>
        <FinalCTAButtons variant="mobile" />
        <div className="relative w-[343px] h-[220px] rounded-2xl overflow-hidden">
          <Image src="/images/landing/final/1.webp" alt="Нейрофото приложение" fill className="object-cover object-top" priority={false} />
        </div>
      </div>

      <div className="hidden md:flex relative z-10 w-full max-w-[1200px] items-center gap-16 px-8">
        <div className="flex flex-col gap-8 flex-1 max-w-[560px]">
          <h2 className="text-[56px] leading-[60px] font-medium tracking-[-0.04em] text-white/80">
            Начните создавать свои ИИфото прямо сейчас
          </h2>
          <p className="text-[20px] leading-[28px] font-normal text-white/80 max-w-[480px]">
            Попробуйте бесплатно – никакой карты не требуется. Убедитесь сами, насколько просто получить профессиональные снимки и обработать любые фотографии
          </p>
          <FinalCTAButtons variant="desktop" />
        </div>
        <div className="flex-1 relative h-[420px] rounded-[24px] overflow-hidden">
          <Image src="/images/landing/final/1.webp" alt="Нейрофото приложение" fill className="object-cover object-top" priority={false} />
        </div>
      </div>
    </section>
  );
};
