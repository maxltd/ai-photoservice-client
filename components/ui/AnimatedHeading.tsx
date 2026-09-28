'use client';

import { motion } from 'framer-motion';

interface AnimatedHeadingProps {
  text: string;
  className?: string;           // размер, трекинг, шрифт (наследуется)
  textClassName?: string;       // цвет/градиент (применяется к каждой букве)
  delay?: number;        // задержка между буквами (в секундах)
  duration?: number;     // длительность появления одной буквы
  threshold?: number;    // доля элемента, при которой срабатывает (0.1 - 0.9)
}

export const AnimatedHeading = ({
  text,
  className = '',
  textClassName = '', 
  delay = 0.035,
  duration = 0.9,
  threshold = 0.2,
}: AnimatedHeadingProps) => {
  // Контейнер управляет последовательностью (stagger)
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay,
        delayChildren: 0.1,
      },
    },
  };

  // Каждая буква анимируется независимо
  const charVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      rotateX: -80,
      transformOrigin: 'bottom' 
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { 
        duration, 
        ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] // плавный cubic-bezier
      },
    },
  };

  return (
    <motion.h2
        className={`inline-block ${className}`}
        style={{ perspective: '1000px' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: threshold }}
      >
        {text.split(/(\s+)/).map((part, partIndex) => {
          if (/\s+/.test(part)) {
            return <span key={partIndex}>{part}</span>;
          }

          return (
            <span key={partIndex} className="inline-block whitespace-nowrap">
              {part.split('').map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  variants={charVariants}
                  // Градиент применяем к каждой букве отдельно.
                  className={`inline-block ${textClassName}`}
                  style={{ willChange: 'transform, opacity' }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          );
        })}
      </motion.h2>
  );
};