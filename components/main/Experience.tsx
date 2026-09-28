import type { BlogArticleListItem } from '@/lib/api/contract';
import { ExperienceCarousel } from './ExperienceCarousel';

interface ExperienceSectionProps {
  articles: BlogArticleListItem[];
}

export const ExperienceSection = ({ articles }: ExperienceSectionProps): React.JSX.Element => (
  <section className="relative w-full bg-[#101010] pb-0 pt-16 md:pb-0 md:pt-[144px] px-4 md:px-16 overflow-hidden flex flex-col items-center gap-9 md:gap-[60px]">
    <div className="absolute pointer-events-none rounded-2xl opacity-60" style={{ width: '442px', height: '442px', left: 'calc(50% - 221px)', top: '192px', background: '#72A728', filter: 'blur(130px)' }} />
    <div className="md:hidden absolute pointer-events-none rounded-2xl opacity-60" style={{ width: '200px', height: '200px', left: 'calc(50% - 100px)', top: 'calc(50% - 124px)', background: 'linear-gradient(90deg, #FFC400 0%, #00FF1E 100%)', filter: 'blur(50px)' }} />
    <h2 className="relative z-10 w-full max-w-[343px] md:max-w-[884px] text-[32px] md:text-[64px] leading-[36px] md:leading-[64px] font-medium text-center tracking-[-0.02em] md:tracking-[-0.04em] text-white">Делимся опытом и знаниями в нашем блоге</h2>
    <ExperienceCarousel articles={articles} />
  </section>
);
