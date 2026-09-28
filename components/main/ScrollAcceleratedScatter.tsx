'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import Image from 'next/image';

interface EjectingCardData {
  id: number;
  src: string;
  angle: number;
  speed: number;
  delay: number;
  cycleDuration: number;
  startX: number;
  startY: number;
  maxScale: number;
  rotate: number;
}

const EjectingCard = ({ data }: { data: EjectingCardData }) => {
  // Конечные координаты (далеко за пределами экрана)
  const targetX = Math.cos(data.angle) * 1400 + data.startX;
  const targetY = Math.sin(data.angle) * 1400 + data.startY;
  

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-28 h-36 md:w-40 md:h-52 rounded-xl overflow-hidden shadow-2xl pointer-events-none will-change-transform"
      style={{ marginLeft: '-70px', marginTop: '-90px' }}
      suppressHydrationWarning={true}
      // Начальное состояние: скрыто в центре с разбросом
      initial={{
        x: data.startX,
        y: data.startY,
        scale: 0.2,
        opacity: 0,
      }}
      // Анимация вылета
      animate={{
        x: [data.startX, targetX],
        y: [data.startY, targetY],
        scale: [0.2, data.maxScale],
        opacity: [0,1,1, 0], // Появляется -> летит -> гаснет у края
      }}
      transition={{
        duration: data.speed,
        ease: 'easeOut',
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: data.cycleDuration - data.speed,
        delay: data.delay, // Следующая картинка стартует раньше середины пути предыдущей
        times: [0, 0.1, 0.9, 1], // Тайминги для opacity (быстрое появление/исчезновение)
      }}
    >
      <Image
        src={data.src}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 112px, 160px"
        priority={false}
      />
      {/* Виньетка для кинематографичности */}
      <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]" />
    </motion.div>
  );
};

function deterministicValue(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export const ScrollAcceleratedScatter = () => {
  const imageSources = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) =>
        `/images/landing/hero/leonardo/image_${String(i + 1).padStart(2, '0')}_1x.webp`
      ),
    []
  );

  // Генерируем стабильные параметры (не меняются при ре-рендере)
  const cards = useMemo<EjectingCardData[]>(
    () => {
      const baseCards = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        src: imageSources[i % imageSources.length],
        angle: deterministicValue(i, 1) * Math.PI * 2,
        speed: 4 + deterministicValue(i, 2) * 5,
        startX: (deterministicValue(i, 3) - 0.5) * 250,
        startY: (deterministicValue(i, 4) - 0.5) * 250,
        maxScale: 1.3 + deterministicValue(i, 5) * 0.9,
        rotate: (deterministicValue(i, 6) - 0.5) * 30,
      }));
      const cycleDuration = baseCards.reduce((total, card) => total + card.speed * 0.35, 0);
      let delay = 0;

      return baseCards.map((card) => {
        const scheduledCard = { ...card, delay, cycleDuration };
        delay += card.speed * 0.35;
        return scheduledCard;
      });
    },
    [imageSources]
  );
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {cards.map((card) => (
        <EjectingCard key={card.id} data={card} />
      ))}
      
      {/* Фоновое свечение для атмосферы */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};