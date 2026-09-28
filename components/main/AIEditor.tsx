'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Animated chars (same animation as HowItWorksSection / AnimatedHeading) ──
const charVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -80, transformOrigin: 'bottom' },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.9, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] },
  },
};

function AnimChars({
  text,
  wrapClassName = '',
  charClassName = '',
  delayOffset = 0,
}: {
  text: string;
  wrapClassName?: string;
  charClassName?: string;
  delayOffset?: number;
}) {
  return (
    <motion.span
      className={`inline-block ${wrapClassName}`}
      style={{ perspective: '1000px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03, delayChildren: delayOffset } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={charVariants}
          className={`inline-block ${charClassName}`}
          style={{ willChange: 'transform, opacity' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─── Floating pill tag ────────────────────────────────────────────────────────
function Tag({ text }: { text: string }) {
  return (
    <div
      className="flex items-center px-3 py-2 md:px-2 md:py-2 rounded-[24px] backdrop-blur-xl whitespace-nowrap"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      <span className="text-white font-bold text-[12px] md:text-[12px] md:font-normal leading-[18px] md:leading-[18px]">{text}</span>
    </div>
  );
}

// ─── Card data ────────────────────────────────────────────────────────────────
const EDITOR_CARDS = [
  { image: '/images/landing/ai-editor/1.webp', icon: '/icons/landing/ai-editor/1.svg', title: 'Удаление и замена фона' },
  { image: '/images/landing/ai-editor/2.webp', icon: '/icons/landing/ai-editor/2.svg', title: 'Улучшение качества изображения' },
  { image: '/images/landing/ai-editor/3.webp', icon: '/icons/landing/ai-editor/3.svg', title: 'Добавление текста и стикеров' },
  { image: '/images/landing/ai-editor/4.webp', icon: '/icons/landing/ai-editor/4.svg', title: 'Ретушь портретов' },
  { image: '/images/landing/ai-editor/5.webp', icon: '/icons/landing/ai-editor/5.svg', title: 'Цветокоррекция и фильтры' },
];

function EditorCard({ card }: { card: typeof EDITOR_CARDS[0] }) {
  return (
    <div
      className="relative flex-shrink-0 flex flex-col justify-end items-start overflow-hidden snap-center"
      style={{
        width: 'clamp(280px, 28.125vw, 540px)',
        height: 'clamp(259px, 26vw, 500px)',
        borderRadius: 'clamp(16px, 1.875vw, 36px)',
        padding: 'clamp(16px, 1.875vw, 36px)',
        gap: '16px',
      }}
    >
      <Image src={card.image} alt={card.title} fill className="object-cover z-0" sizes="(max-width:768px) 280px, 540px" />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: '187px', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)' }}
      />
      <div className="relative z-20 flex flex-col gap-2 md:gap-4 w-full">
        <Image src={card.icon} alt="" width={36} height={36} className="w-6 h-6 md:w-9 md:h-9" />
        <span
          className="text-white/80 text-[16px] leading-6 font-normal md:text-[24px] md:leading-[30px] md:font-medium tracking-[-0.02em]"
        >
          {card.title}
        </span>

      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export const AIEditorSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const isHovered = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getMetrics = () => {
    if (typeof window === 'undefined') return { cardW: 280, gap: 8 };
    const mob = window.innerWidth < 768;
    return {
      cardW: mob ? 280 : Math.min(Math.floor(window.innerWidth * 0.28125), 540),
      gap: mob ? 8 : 24,
    };
  };

  const scrollToCard = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const { cardW, gap } = getMetrics();
    scrollRef.current.scrollTo({ left: index * (cardW + gap), behavior: 'smooth' });
  }, []);

  const handleNext = useCallback(() => {
    const next = (activeIndex + 1) % EDITOR_CARDS.length;
    setActiveIndex(next); setProgress(0); scrollToCard(next);
  }, [activeIndex, scrollToCard]);

  const handlePrev = useCallback(() => {
    const prev = (activeIndex - 1 + EDITOR_CARDS.length) % EDITOR_CARDS.length;
    setActiveIndex(prev); setProgress(0); scrollToCard(prev);
  }, [activeIndex, scrollToCard]);

  useEffect(() => {
    const id = setInterval(() => {
      if (isHovered.current) return;
      setProgress(p => { if (p >= 100) { handleNext(); return 0; } return p + 2; });
    }, 100);
    return () => clearInterval(id);
  }, [handleNext]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { cardW, gap } = getMetrics();
    const idx = Math.round(scrollRef.current.scrollLeft / (cardW + gap));
    if (idx !== activeIndex && idx >= 0 && idx < EDITOR_CARDS.length) { setActiveIndex(idx); setProgress(0); }
  };


  return (
    <section
      className="relative w-full bg-page-surface overflow-hidden flex flex-col items-start pt-16 md:pt-36"
      style={{ gap: 'clamp(36px,3.125vw,60px)' }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div style={{
          width: 'clamp(200px,25vw,480px)', height: 'clamp(200px,25vw,480px)',
          background: 'var(--gradient-ai-editor-title)',
          opacity: 0.6, filter: 'blur(clamp(50px,6vw,100px))', borderRadius: '16px',
        }} />
      </div>

      {/* ── Title wrapper ───────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{
          gap: 'clamp(16px,1.5vw,24px)',
          paddingLeft: 'clamp(16px,4vw,64px)',
          paddingRight: 'clamp(16px,4vw,64px)',
        }}
      >

        {/* ── DESKTOP: 2 lines ─────────────────────────────────────── */}
        {/*
          Line 1: "Мощный ⚡ ИИ редактор"
          Line 2: "фотографий"

          Floating tags (per Figma px coords scaled to viewport):
            "Удаление фона"  — left side, overlapping slider area below title
            "Ретушь"         — right of title, near top of line 1
            "Оживление"      — right of title, below "Ретушь"
        */}
        <div className="hidden md:flex flex-col items-center gap-0 w-full max-w-[787px] relative">

          {/* Tag: Оживление — right of the two-line heading */}
          <div className="absolute -right-8 top-20 z-20">
            <Tag text="Оживление" />
          </div>

          {/* Line 1 */}
          <div className="flex flex-row items-center justify-center gap-x-3 flex-wrap">
            <AnimChars
              text="Мощный"
              wrapClassName="text-[64px] font-medium leading-[64px] tracking-[-0.04em] text-white/80"
              delayOffset={0.1}
            />
            <motion.span
              className="inline-block flex-shrink-0"
              initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.38, ease: [0.215, 0.61, 0.355, 1] }}
            >
              <Image src="/icons/landing/ai-editor/Bolt.svg" alt="⚡" width={60} height={60} />
            </motion.span>
            {/* "ИИ редактор" — gradient text, each char has gradient via wrapper span */}
            <motion.span
              className="inline-block text-[64px] font-medium leading-[64px] tracking-[-0.04em] bg-clip-text text-transparent"
              style={{
                perspective: '1000px',
              }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.03, delayChildren: 0.28 } },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {'ИИ редактор'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  variants={charVariants}
                  className="inline-block text-transparent bg-clip-text bg-[image:var(--gradient-ai-editor-title)]"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.span>
          </div>

          {/* Line 2: the tag is anchored to the start of this line */}
          <div className="relative inline-flex">
            <div className="absolute right-full top-3.5 mr-4 z-20">
              <Tag text="Ретушь" />
            </div>
            <AnimChars
              text="фотографий"
              wrapClassName="text-[64px] font-medium leading-[64px] tracking-[-0.04em] text-white/80"
              delayOffset={0.52}
            />
          </div>

          {/* Tag: Удаление фона — above the left side of the heading */}
          <div className="absolute -left-14 -top-3 z-20">
            <Tag text="Удаление фона" />
          </div>
        </div>

        {/* ── MOBILE: 3 lines ──────────────────────────────────────── */}
        {/*
          Line 1: "Мощный ⚡"
          Line 2: "ИИ редактор"
          Line 3: "фотографий"

          Tags:
            "Удаление фона" — top-left, above line 1
            "Ретушь"        — top-right, above line 1
            "Оживление"     — right side, at level of line 2–3
        */}
        <div className="md:hidden flex flex-col items-center gap-0 w-full relative">
          {/* Tag: Удаление фона — top-left */}
          <div className="absolute left-0 -top-[21px] z-20">
            <Tag text="Удаление фона" />
          </div>
          {/* Tag: Ретушь — top-right */}
          <div className="absolute right-0 top-0 z-20">
            <Tag text="Ретушь" />
          </div>

          {/* Line 1: Мощный + bolt */}
          <div className="flex flex-row items-center justify-center gap-2">
            <AnimChars
              text="Мощный"
              wrapClassName="text-[32px] font-medium leading-[36px] tracking-[-0.02em] text-white/80"
              delayOffset={0.1}
            />
            <motion.span
              className="inline-block flex-shrink-0"
              initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.35, ease: [0.215, 0.61, 0.355, 1] }}
            >
              <Image src="/icons/landing/ai-editor/Bolt.svg" alt="⚡" width={36} height={36} />
            </motion.span>
          </div>

          {/* Line 2: ИИ редактор — gradient */}
          <motion.span
            className="inline-block text-[32px] font-medium leading-[36px] tracking-[-0.02em]"
            style={{ perspective: '1000px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.03, delayChildren: 0.28 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {'ИИ редактор'.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={charVariants}
                className="inline-block text-transparent bg-clip-text bg-[image:var(--gradient-ai-editor-title)]"
                style={{ willChange: 'transform, opacity' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.span>

          {/* Line 3: фотографий */}
          <AnimChars
            text="фотографий"
            wrapClassName="text-[32px] font-medium leading-[36px] tracking-[-0.02em] text-white/80"
            delayOffset={0.42}
          />
          {/* Tag: Оживление — right of the lower title lines */}
          <div className="absolute right-[6px] top-[87px] z-20">
            <Tag text="Оживление" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="md:hidden max-w-[343px] text-white/80 text-center text-[16px] leading-6 font-normal">
          Выбирайте из сотен готовых образов или создайте свой за минуту
        </p>
        <p className="hidden md:block w-full max-w-[787px] text-white/80 text-center text-[20px] leading-7 font-medium">
          Улучшайте свои фото за секунды
        </p>
      </div>

      {/* ── Slider ─────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => { isHovered.current = true; }}
        onMouseLeave={() => { isHovered.current = false; }}
        className="relative z-10 w-full overflow-x-auto pb-2 scrollbar-hide"
      >
        <div
          className="flex"
          style={{
            gap: 'clamp(8px,1.25vw,24px)',
            paddingLeft: 'clamp(16px,4vw,64px)',
            paddingRight: 'clamp(16px,4vw,64px)',
            width: 'max-content',
          }}
        >
          {EDITOR_CARDS.map((card, i) => <EditorCard key={i} card={card} />)}
        </div>
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full flex flex-col md:grid md:grid-cols-[342px_minmax(0,1fr)_342px] items-center pb-16 md:pb-0"
        style={{
          paddingLeft: 'clamp(16px,4vw,64px)',
          paddingRight: 'clamp(16px,4vw,64px)',
          gap: '24px',
        }}
      >
        {/* Pagination dots with progress bar */}
        <div className="flex w-[180px] gap-2 items-center md:col-start-2 md:justify-self-center" style={{ height: '8px' }}>
          {EDITOR_CARDS.map((_, idx) => (
            <div
              key={idx}
              className={`relative h-2 shrink-0 overflow-hidden rounded-full ${idx === activeIndex ? 'w-[116px]' : 'w-2'}`}
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              {idx === activeIndex && (
                <>
                  <div className="absolute inset-y-0 left-0 w-[56px] rounded-full bg-white/30" />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Right side: arrows + button */}
        <div className="flex items-center gap-2 md:col-start-3 md:justify-self-end">
          {/* Arrows — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* "Все инструменты" */}
          <Link
            href="/ai-tools"
            className="h-16 rounded-[64px] flex items-center justify-center hover:bg-white/15 transition-colors backdrop-blur-xl w-[343px] md:w-[198px]"
            style={{
              padding: '20px',
              background: 'radial-gradient(55.38% 100% at 50% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-white font-bold text-[18px] leading-6 whitespace-nowrap">Все инструменты</span>
          </Link>
        </div>
      </div>
    </section>
  );
};