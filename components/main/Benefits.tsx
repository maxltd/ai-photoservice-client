'use client';

import { Sparkles, Zap, Crown, Shield, Coins, Monitor } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { usePublicAuth } from '@/components/auth/public-auth-provider';

interface BenefitsSectionProps {
  onNavigate: (index: number) => void;
  benefitsLockedRef: React.MutableRefObject<boolean>;
}

const BENEFITS = [
  {
    title: 'Скорость',
    description: 'Быстрый результат за 1-3 минуты, а не часы',
    icon: Zap,
    variant: 'speed',
  },
  {
    title: 'Качество',
    description: 'Фотореалистичные результаты без артефактов',
    icon: Crown,
    variant: 'quality',
    hasFireIcon: true,
  },
  {
    title: 'Удобство',
    description: 'Работает в браузере, без установки',
    icon: Monitor,
    variant: 'convenience',
    isGlass: true,
  },
  {
    title: 'Стоимость',
    description: 'В 10 раз дешевле фотосессии в студии',
    icon: Coins,
    variant: 'cost',
  },
  {
    title: 'Приватность',
    description: 'Фото удаляются после обработки',
    icon: Shield,
    variant: 'privacy',
    isGlass: true,
  },
];

const FireIcon = () => (
  <div className="relative w-[60px] h-[60px] drop-shadow-[0_4px_12px_rgba(255,60,60,0.5)]">
    <Image
      src="/images/landing/benefits/fire-icon.webp"
      alt="fire"
      fill
      className="object-contain"
      priority={false}
    />
  </div>
);

const BenefitCard = ({
  benefit,
  index,
  isVisible,
}: {
  benefit: (typeof BENEFITS)[0];
  index: number;
  isVisible: boolean;
}) => {
  const IconComponent = benefit.icon;
  return (
    <motion.div
      className={`benefits-card benefits-card--${benefit.variant} absolute flex flex-col rounded-2xl`}
      initial={{ opacity: 0, scale: 0.3, y: 100 }}
      animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.3, y: 100 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="benefits-card__header flex flex-row items-center">
        <IconComponent className="benefits-card__icon text-white/80" />
        <div className="benefits-card__label flex flex-row items-center rounded-full">
          <span className="text-white font-bold">{benefit.title}</span>
        </div>
      </div>
      <p className="benefits-card__description text-white/80 font-medium">
        {benefit.description}
      </p>
      {benefit.hasFireIcon && (
        <div className="absolute benefits-card__fire z-50">
          <FireIcon />
        </div>
      )}
    </motion.div>
  );
};

// Шаги внутри секции:
// 0 = только телефон
// 1 = карточки появились
// 2 = финальный текст + кнопка
// 3 = всё, отпускаем скролл
const MAX_STEP = 3;

export const BenefitsSection = ({
  onNavigate,
  benefitsLockedRef,
}: BenefitsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const isProcessing = useRef(false);
  const isVisible = useRef(false);
  const publicAuth = usePublicAuth();

  const handleCreateClick = (): void => {
    publicAuth?.navigateToProtected('/app/create');
  };

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Следим за видимостью секции
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (window.matchMedia('(max-width: 767px)').matches) return;
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          benefitsLockedRef.current = true;
        } else {
          benefitsLockedRef.current = false;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [benefitsLockedRef]);

  const advanceStep = useCallback(
    (direction: 1 | -1) => {
      if (isProcessing.current) return;

      const current = stepRef.current;
      const next = current + direction;

      // Скролл вверх на шаге 0 — уходим на предыдущую секцию
      if (direction === -1 && current === 0) {
        benefitsLockedRef.current = false;
        isProcessing.current = true;
        setTimeout(() => {
          onNavigate(6);
          isProcessing.current = false;
        }, 50);
        return;
      }

      // Дошли до конца — уходим на следующую секцию
      if (next >= MAX_STEP) {
        setStep(MAX_STEP);
        stepRef.current = MAX_STEP;
        isProcessing.current = true;
        setTimeout(() => {
          benefitsLockedRef.current = false;
          onNavigate(8);
          isProcessing.current = false;
        }, 600);
        return;
      }

      isProcessing.current = true;
      setStep(next);
      stepRef.current = next;
      setTimeout(() => {
        isProcessing.current = false;
      }, 500);
    },
    [onNavigate, benefitsLockedRef]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches || !isVisible.current || !benefitsLockedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      if (Math.abs(e.deltaY) < 20) return;
      advanceStep(e.deltaY > 0 ? 1 : -1);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (!isVisible.current) return;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches || !isVisible.current || !benefitsLockedRef.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 40) advanceStep(delta > 0 ? 1 : -1);
    };

    // capture: true — перехватываем ДО глобального хендлера в index.tsx
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [advanceStep, benefitsLockedRef]);

  return (
    <section
      ref={sectionRef}
      className="benefits-section relative w-full overflow-hidden flex items-center justify-center"
    >
      {/* Мобильная версия */}
      <div className="benefits-mobile md:hidden flex flex-col items-center w-full max-w-[375px] mx-auto">
        <div className="benefits-mobile__intro flex flex-col items-center">
          <h2 className="benefits-mobile__title text-white/80 font-medium text-center">
            Нейрофото. Онлайн.<br />Быстро. Реалистично.
          </h2>
          <div className="relative w-[343px] h-[443px]">
            <Image
              src="/images/landing/benefits/phone-in-hand.webp"
              alt="Приложение Нейрофото"
              fill
              className="object-contain"
              priority={false}
            />
          </div>
        </div>

        <div className="benefits-mobile__cards flex flex-col w-full">
          {BENEFITS.map((benefit) => {
            const IconComponent = benefit.icon;
            return (
              <div key={benefit.title} className={`benefits-card benefits-card--${benefit.variant} relative flex flex-col rounded-2xl`}>
                <div className="benefits-card__header flex flex-row items-center">
                  <IconComponent className="benefits-card__icon text-white/80" />
                  <div className="benefits-card__label flex flex-row items-center rounded-full">
                    <span className="text-white font-bold">{benefit.title}</span>
                  </div>
                </div>
                <p className="benefits-card__description text-white/80 font-medium">{benefit.description}</p>
                {benefit.hasFireIcon && <div className="absolute benefits-card__fire z-10"><FireIcon /></div>}
              </div>
            );
          })}
        </div>

        <div className="benefits-mobile__cta flex flex-col items-center w-full">
          <p className="text-white/80 font-medium text-center">
            Онлайн-генерация и обработка фото на русском языке. Первые шаги — бесплатно.
          </p>
          <button onClick={handleCreateClick} className="benefits-button flex flex-row justify-center items-center transition-all hover:scale-105 active:scale-95">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-white font-bold">Создать нейрофото</span>
          </button>
        </div>
      </div>

      {/* Десктоп версия */}
      <div
        className="benefits-desktop hidden md:flex flex-col items-center justify-center w-full relative"
      >
        {/* Телефон */}
        <motion.div
          className="benefits-phone absolute z-10 top-0 left-1/2 -translate-x-1/2"
          animate={{ opacity: step >= 2 ? 0 : 1, scale: step >= 2 ? 0.85 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/images/landing/benefits/phone-in-hand.webp"
            alt="Приложение Нейрофото"
            fill
            className="object-contain"
            priority={false}
          />
        </motion.div>

        {/* Карточки */}
        {BENEFITS.map((benefit, i) => (
          <BenefitCard key={i} benefit={benefit} index={i} isVisible={step >= 1} />
        ))}

        {/* Финальный текст */}
        <motion.div
          className="benefits-final absolute left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={step >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="benefits-final__title text-white/80 font-medium text-center">
            Нейрофото. Онлайн.<br />Быстро. Реалистично.
          </h2>
          <p className="benefits-final__description text-white/80 font-medium text-center">
            Онлайн-генерация и обработка фото на русском языке. Первые шаги — бесплатно.
          </p>
          <button
            onClick={handleCreateClick}
            className="benefits-button flex flex-row justify-center items-center transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-6 h-6 text-white" />
            <span className="benefits-button__label text-white font-bold">Создать нейрофото</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};