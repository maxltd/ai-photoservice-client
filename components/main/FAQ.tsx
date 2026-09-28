import { AnimatedHeading } from '../ui/AnimatedHeading';
import { FAQAccordion, type FAQItem } from './FAQAccordion';

export const FAQSection = ({ items }: { items: readonly FAQItem[] }): React.JSX.Element => {
  return (
    <section className="snap-section relative flex w-full flex-col items-center gap-9 bg-[#101010] px-4 pb-0 pt-16 md:gap-[60px] md:px-16 md:pb-0 md:pt-[144px]">
      <div className="flex w-full max-w-[343px] flex-col items-center text-center md:max-w-[884px]">
        <AnimatedHeading
          text="Отвечаем на популярные"
          className="text-[32px] font-medium leading-[36px] tracking-[-0.02em] md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]"
          textClassName="text-white/80"
          delay={0.03}
          duration={0.9}
          threshold={0.1}
        />
        <AnimatedHeading
          text="вопросы"
          className="text-[32px] font-medium leading-[36px] tracking-[-0.02em] md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]"
          textClassName="text-white/80"
          delay={0.03}
          duration={0.9}
          threshold={0.1}
        />
      </div>
      <FAQAccordion items={items} />
    </section>
  );
};
