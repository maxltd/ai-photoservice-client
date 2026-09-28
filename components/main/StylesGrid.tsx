'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useCallback } from 'react';
import type { PhotoSessionStyleCard } from '@/lib/api/contract';
import { TrendStarsIcon } from '@/components/ui/pages/ideas/idea-page-shared';



// Wand icon (from Figma — gradient-3: #FFC400 → #00FF1E)
const WandIcon = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wand_grad" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFC400"/>
        <stop offset="1" stopColor="#00FF1E"/>
      </linearGradient>
    </defs>
    {/* Wand stick */}
    <path d="M8 52L42 18" stroke="url(#wand_grad)" strokeWidth="4" strokeLinecap="round"/>
    {/* Star at top */}
    <path d="M44 6l1.5 4.5L50 12l-4.5 1.5L44 18l-1.5-4.5L38 12l4.5-1.5z" fill="url(#wand_grad)"/>
    {/* Small sparkles */}
    <path d="M18 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="url(#wand_grad)" opacity="0.7"/>
    <path d="M52 36l0.8 2.4 2.4 0.8-2.4 0.8L52 43l-0.8-2.4-2.4-0.8 2.4-0.8z" fill="url(#wand_grad)" opacity="0.7"/>
  </svg>
);

// ---- TiltedCard (Desktop) ----
type StyleItem = PhotoSessionStyleCard;

const TiltedCard = ({ style }: { style: StyleItem }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rx = ((y - height / 2) / (height / 2)) * -12;
    const ry = ((x - width / 2) / (width / 2)) * 12;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04,1.04,1.04)`;
    if (glossRef.current) {
      glossRef.current.style.background =
        `radial-gradient(circle at ${(x / width) * 100}% ${(y / height) * 100}%, rgba(255,255,255,0.16) 0%, transparent 65%)`;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    setHovered(true);
    setTimeout(() => setShowBtn(true), 60);
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    setShowBtn(false);
    if (cardRef.current) cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glossRef.current) glossRef.current.style.background = 'none';
  }, []);

  return (
    // desktop/card-style: w=339.2px h=420px, bg=white/8, border-radius=36px
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative cursor-pointer will-change-transform flex-shrink-0"
      style={{
        width: '339.2px',
        height: '420px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '36px',
        transition: 'transform 0.08s ease-out, box-shadow 0.3s ease',
        boxShadow: hovered
          ? '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)'
          : '0 4px 16px rgba(0,0,0,0.3)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* image-grid: w=339.2 h=420, border-radius=36px */}
      <div className="absolute inset-0 flex flex-row items-end" style={{ borderRadius: '36px', overflow: 'hidden', gap: '2px' }}>
        {/* left: full card image, padding=12px, border-radius=16px */}
        <div className="relative flex-1 h-full flex flex-col justify-end items-start p-3 gap-2 isolate" style={{ borderRadius: '16px' }}>
          {/* image */}
          <Image
            src={style.image}
            alt={style.title}
            fill
            className="object-cover"
            sizes="340px"
            style={{ zIndex: 0 }}
          />
          {/* Rectangle 45 — gradient overlay: h=187px, bottom=0 */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: '187px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 100%)',
              zIndex: 1,
            }}
          />
          {/* text+action: padding=16px, gap=8px, h=94px, z-index=2 */}
          <div
            className="relative flex flex-col justify-center items-center gap-2 w-full"
            style={{ height: '94px', padding: '16px', zIndex: 2 }}
          >
            {/* title: font-size=24px, font-weight=500, line-height=30px, letter-spacing=-0.02em, white-80 */}
            <span
              className="w-full"
              style={{
                fontFamily: 'Onest',
                fontWeight: 500,
                fontSize: '24px',
                lineHeight: '30px',
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {style.title}
            </span>
            {/* stats row: gap=4px */}
            <div className="flex flex-row items-center w-full" style={{ gap: '4px', height: '24px' }}>
              <TrendStarsIcon size={24} />
              {/* count: font-size=16px, weight=400, gradient B7FF53→6FA91E, opacity=0.7 */}
              <span
                style={{
                  fontFamily: 'Onest',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '24px',
                  background: 'radial-gradient(184.81% 312.33% at 0% 0%, #B7FF53 0%, rgba(111,169,30,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: 0.7,
                }}
              >
                {style.usageCount}
              </span>
              {/* period: font-size=16px, white, opacity=0.7 */}
              <span
                style={{
                  fontFamily: 'Onest',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#FFFFFF',
                  opacity: 0.7,
                }}
              >
                {style.usagePeriod}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gloss overlay */}
      <div ref={glossRef} className="absolute inset-0 pointer-events-none" style={{ borderRadius: '36px', transition: 'background 0.05s ease-out' }} />

      {/* Hover CTA button */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: showBtn ? 1 : 0, transition: 'opacity 0.2s ease' }}
      >
        <Link
          href={style.href}
          className="pointer-events-auto flex items-center justify-center"
          style={{
            height: '64px',
            padding: '20px',
            gap: '10px',
            background: 'radial-gradient(55.38% 100% at 50% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '64px',
            fontFamily: 'Onest',
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
          }}
        >
          Попробовать идею
        </Link>
      </div>
    </div>
  );
};

// ---- MobileCard ----
const MobileCard = ({ style }: { style: StyleItem }) => (
  // mobile/card-style: w=167px h=191px, bg=white/8, border-radius=16px
  <div
    className="relative flex-shrink-0"
    style={{
      width: '167px',
      height: '191px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '16px',
    }}
  >
    {/* image-grid */}
    <div className="absolute inset-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      {/* left: padding=12px, border-radius=16px */}
      <div className="relative w-full h-full flex flex-col justify-end items-start p-3 gap-2 isolate" style={{ borderRadius: '16px' }}>
        <Image
          src={style.image}
          alt={style.title}
          fill
          className="object-cover"
          sizes="167px"
          style={{ zIndex: 0 }}
        />
        {/* Rectangle 45: h=191px */}
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: '191px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 100%)',
            zIndex: 1,
          }}
        />
        {/* text+action: padding=0, gap=4px, h=64px, z-index=2 */}
        <div
          className="relative flex flex-col justify-center items-center"
          style={{ height: '64px', gap: '4px', zIndex: 2, width: '143px' }}
        >
          {/* title: font-size=16px, weight=500, line-height=24px, white-80 */}
          <span
            className="w-full"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {style.title}
          </span>
          {/* stats row: gap=4px, flex-wrap */}
          <div className="flex flex-row flex-wrap items-center" style={{ gap: '0 4px', width: '143px', height: '36px' }}>
            <TrendStarsIcon size={16} />
            {/* count: font-size=12px (Caption 12), gradient, opacity=0.7 */}
            <span
              style={{
                fontFamily: 'Onest',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '18px',
                background: 'radial-gradient(184.81% 312.33% at 0% 0%, #B7FF53 0%, rgba(111,169,30,0.8) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0.7,
              }}
            >
              {style.usageCount}
            </span>
            {/* period: font-size=12px, white, opacity=0.7 */}
            <span
              style={{
                fontFamily: 'Onest',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '18px',
                color: '#FFFFFF',
                opacity: 0.7,
              }}
            >
              {style.usagePeriod}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---- Section ----
export const StylesGridSection = ({ styles }: { styles: PhotoSessionStyleCard[] }) => {
  return (
    // Section: padding=144px 64px 0px, gap=60px, border-radius=60px, isolate
    // bg effects: ellipse blur + rectangle gradient
    <section
      className="relative box-border w-full flex flex-col justify-center items-center isolate overflow-hidden rounded-[24px] px-4 pt-16 pb-0 gap-9 md:rounded-[60px] md:px-16 md:pt-36 md:gap-[60px]"
    >
      {/* Ellipse 13 — desktop: 480×480, gradient #FFC400→#00FF1E, blur 100px, opacity 0.6 */}
      <div
        className="absolute pointer-events-none hidden md:block"
        style={{
          width: '480px',
          height: '480px',
          left: 'calc(50% - 240px)',
          top: '341px',
          background: 'linear-gradient(90deg, #FFC400 0%, #00FF1E 100%)',
          opacity: 0.6,
          filter: 'blur(100px)',
          borderRadius: '16px',
          zIndex: 0,
        }}
      />
      {/* Ellipse 13 — mobile: 200×200, gradient #5BCFFF→#0b7fd2 */}
      <div
        className="absolute pointer-events-none md:hidden"
        style={{
          width: '200px',
          height: '200px',
          left: 'calc(50% - 100px)',
          top: '341px',
          background: 'linear-gradient(100.9deg, #5BCFFF 2.38%, rgba(11,127,210,0.8) 100%)',
          opacity: 0.6,
          filter: 'blur(100px)',
          borderRadius: '16px',
          zIndex: 0,
        }}
      />
      {/* Rectangle 27: gradient #00F361→transparent, opacity=0.2, h=950px desktop / 839px mobile */}
      <div
        className="absolute left-0 top-0 w-full h-[839px] md:h-[950px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #00F361 0%, rgba(0,61,243,0) 100%)',
          opacity: 0.2,
          zIndex: 1,
        }}
      />

      {/* title block: desktop w=884px gap=36px / mobile w=343px gap=16px */}
      <div
        className="relative flex w-full max-w-[343px] flex-col items-start gap-4 md:w-[884px] md:max-w-none md:gap-9"
        style={{ zIndex: 2 }}
      >
        {/* title row: flex-wrap, justify-center, gap=8px */}
        {/* Desktop: w=884px h=136px / Mobile: w=343px */}
        <div
          className="flex flex-row flex-wrap justify-center items-start content-start gap-2"
        >
          {/* "Готовые": desktop 64px / mobile 32px, white-80 */}
          <span
            className="hidden md:inline"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '64px',
              lineHeight: '64px',
              letterSpacing: '-0.04em',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Готовые
          </span>
          <span
            className="md:hidden"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '32px',
              lineHeight: '36px',
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Готовые
          </span>

          {/* Wand icon: desktop 60×60 / mobile 36×36 */}
          <span className="hidden md:inline"><WandIcon size={60} /></span>
          <span className="md:hidden"><WandIcon size={36} /></span>

          {/* "стили": desktop 64px gradient #FFC400→#00FF1E / mobile 32px gradient B7FF53→6FA91E */}
          <span
            className="hidden md:inline"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '64px',
              lineHeight: '64px',
              letterSpacing: '-0.04em',
              background: 'linear-gradient(90deg, #FFC400 0%, #00FF1E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            стили
          </span>
          <span
            className="md:hidden"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '32px',
              lineHeight: '36px',
              letterSpacing: '-0.02em',
              background: 'radial-gradient(184.81% 312.33% at 0% 0%, #B7FF53 0%, rgba(111,169,30,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            стили
          </span>

          {/* "для ИИ фотосессий": desktop 64px / mobile 32px, white-80 */}
          <span
            className="hidden md:inline"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '64px',
              lineHeight: '64px',
              letterSpacing: '-0.04em',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            для ИИ фотосессий
          </span>
          <span
            className="md:hidden"
            style={{
              fontFamily: 'Onest',
              fontWeight: 500,
              fontSize: '32px',
              lineHeight: '36px',
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            для ИИ фотосессий
          </span>
        </div>

        {/* subtitle: desktop font-size=20px weight=500 / mobile font-size=16px weight=400, white-80, text-center */}
        <span
          className="hidden md:block text-center w-full"
          style={{
            fontFamily: 'Onest',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '28px',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '884px',
          }}
        >
          Выбирайте из сотен готовых образов или создайте свой за минуту
        </span>
        <span
          className="md:hidden text-center"
          style={{
            fontFamily: 'Onest',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgba(255,255,255,0.8)',
            width: '343px',
          }}
        >
          Выбирайте из сотен готовых образов или создайте свой за минуту
        </span>
      </div>

      {/* list — desktop: flex-wrap, gap=24px, w=1792px / mobile: flex-wrap, gap=8px, w=343px */}
      {/* Desktop */}
      <div
        className="relative hidden md:flex flex-row flex-wrap justify-center items-center"
        style={{ gap: '24px', width: '1792px', zIndex: 3 }}
      >
        {styles.map((style) => (
          <TiltedCard key={style.id} style={style} />
        ))}
      </div>

      {/* Mobile */}
      <div
        className="relative md:hidden flex flex-row flex-wrap justify-center items-center"
        style={{ gap: '8px', width: '343px', zIndex: 3 }}
      >
        {styles.map((style) => (
          <MobileCard key={style.id} style={style} />
        ))}
      </div>

      {/* dimmer + button — desktop: h=421px, padding=160px 36px 0px / mobile: h=320px, padding=64px 16px 0px */}
      {/* Desktop dimmer */}
      <div
        className="hidden md:flex absolute left-0 bottom-0 flex-col justify-end items-center"
        style={{
          width: '1792px',
          height: '421px',
          padding: '160px 36px 0px',
          gap: '8px',
          background: 'linear-gradient(180deg, rgba(16,16,16,0) 0%, #101010 100%)',
          zIndex: 15,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* button: w=220px h=64px */}
        <Link
          href="/styles/"
          style={{
            width: '220px',
            height: '64px',
            padding: '20px',
            gap: '10px',
            background: 'radial-gradient(55.38% 100% at 50% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '64px',
            fontFamily: 'Onest',
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#FFFFFF',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Смотреть все стили
        </Link>
      </div>

      {/* Mobile dimmer */}
      <div
        className="md:hidden absolute left-0 bottom-0 flex flex-col justify-end items-center"
        style={{
          width: '343px',
          height: '320px',
          padding: '64px 16px 0px',
          gap: '8px',
          background: 'linear-gradient(180deg, rgba(16,16,16,0) 0%, #101010 100%)',
          zIndex: 15,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* button: w=311px h=64px (align-self: stretch on mobile) */}
        <Link
          href="/styles/"
          style={{
            width: '311px',
            height: '64px',
            padding: '20px',
            gap: '10px',
            background: 'radial-gradient(55.38% 100% at 50% 100%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            borderRadius: '64px',
            fontFamily: 'Onest',
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '24px',
            color: '#FFFFFF',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          Смотреть все стили
        </Link>
      </div>
    </section>
  );
};