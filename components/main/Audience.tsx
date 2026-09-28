import { AnimatedHeading } from '../ui/AnimatedHeading';
import { AudienceCards } from './AudienceCards';

export const AudienceSection = (): React.JSX.Element => {
  return (
    <section className="snap-section relative w-full bg-[#101010] overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute pointer-events-none" style={{ width: '200px', height: '200px', left: 'calc(50% - 100px)', top: 'calc(50% - 100px)', background: '#3098D3', filter: 'blur(80px)', borderRadius: '16px', opacity: 0.6 }} />
      <div className="hidden md:block absolute pointer-events-none" style={{ width: '442px', height: '442px', left: 'calc(50% - 221px)', top: 'calc(50% - 221px)', background: 'linear-gradient(100.9deg, #5BCFFF 2.38%, rgba(11, 127, 210, 0.8) 100%)', filter: 'blur(100px)', borderRadius: '16px', opacity: 0.6 }} />
      <div className="relative z-10 flex flex-col items-center w-full" style={{ padding: '64px 16px', gap: '36px' }}>
        <AnimatedHeading text="Идеально подойдёт для…" className="text-[32px] md:text-[64px] font-medium leading-[36px] md:leading-[64px] tracking-[-0.02em] md:tracking-[-0.04em] text-center whitespace-nowrap" textClassName="text-white/80" delay={0.035} duration={0.9} threshold={0.2} />
        <AudienceCards />
      </div>
    </section>
  );
};
