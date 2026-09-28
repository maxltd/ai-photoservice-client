import { AnimatedHeading } from '../ui/AnimatedHeading';
import { HowItWorksTabs, type HowItWorksData } from './HowItWorksTabs';

const SECTION_DATA: HowItWorksData = {
  generation: {
    title: 'Генерация фотосессии',
    steps: [
      { id: 1, title: 'Загрузите фото', desc: '10–15 снимков в разном освещении и ракурсах.', img: '/images/landing/how-it-works/download.webp' },
      { id: 2, title: 'Выберите стиль', desc: 'Один образ или целая серия — на ваш выбор.', img: '/images/landing/how-it-works/choose.webp' },
      { id: 3, title: 'Получите результат', desc: 'Реалистичные фото, готовые к использованию.', img: '/images/landing/how-it-works/get.webp' },
    ],
  },
  editing: {
    title: 'Обработка фото',
    steps: [
      { id: 1, title: 'Загрузите фото', desc: '10–15 снимков в разном освещении и ракурсах.', img: '/images/landing/how-it-works/download-1.webp' },
      { id: 2, title: 'Выберите инструмент', desc: 'Удаление фона, ретушь, улучшение и др.', img: '/images/landing/how-it-works/choose-1.webp' },
      { id: 3, title: 'Скачайте результат', desc: 'С прозрачным фоном или улучшенным качеством.', img: '/images/landing/how-it-works/get-1.webp' }
    ],
  },
};

export const HowItWorksSection = (): React.JSX.Element => {
  return (
    <section className="snap-section relative flex w-full flex-col items-center gap-9 bg-page-surface px-4 py-16 md:gap-[60px] md:px-16 md:py-36">
      <div className="w-full max-w-[343px] md:max-w-[1792px] flex flex-col items-center gap-2">
        <div className="text-center">
          <AnimatedHeading text="Как это работает?" className="text-[32px] md:text-[64px] font-medium leading-[36px] md:leading-[64px] tracking-[-0.02em] md:tracking-[-0.04em]" textClassName="bg-[image:var(--gradient-how-it-works-title)] bg-clip-text text-transparent" delay={0.03} duration={1} threshold={0.15} />
        </div>
        <div className="text-center">
          <AnimatedHeading text="Гибко. Просто. Быстро." className="text-[32px] md:text-[64px] font-medium leading-[36px] md:leading-[64px] tracking-[-0.02em] md:tracking-[-0.04em] text-white/80" delay={0.04} duration={0.9} threshold={0.15} />
        </div>
      </div>
      <HowItWorksTabs data={SECTION_DATA} />
    </section>
  );
};
