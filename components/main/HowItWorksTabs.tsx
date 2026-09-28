"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export interface HowItWorksStep {
  id: number;
  title: string;
  desc: string;
  img: string;

}

export interface HowItWorksData {
  generation: {
    title: string;
    steps: readonly HowItWorksStep[];
  };
  editing: {
    title: string;
    steps: readonly HowItWorksStep[];
  };
}

export function HowItWorksTabs({ data }: { data: HowItWorksData }): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'generation' | 'editing'>('generation');
  const currentData = data[activeTab];

  return (
    <>
      <div className="relative inline-flex h-[60px] w-full max-w-[343px] gap-2 rounded-[64px] border border-white/5 bg-pricing-panel p-2 backdrop-blur-[12px] md:max-w-[408px]">
        <button onClick={() => setActiveTab('generation')} className={`relative flex items-center justify-center gap-2 px-3 w-[159.5px] md:w-[216px] h-[44px] rounded-[64px] transition-all duration-300 text-[14px] font-bold leading-5 z-10 border border-transparent ${activeTab === 'generation' ? 'text-page-surface' : 'text-white border-white/30'}`}>
          {activeTab === 'generation' && <motion.div layoutId="activeTabBg" className="absolute inset-0 rounded-[64px] bg-[image:var(--gradient-how-it-works-tab-active)]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
          <Sparkles className={`w-5 h-5 relative z-10 ${activeTab === 'generation' ? 'text-page-surface' : 'text-white'}`} />
          <span className="relative z-10 whitespace-nowrap"><span className="md:hidden">Фотосессия</span><span className="hidden md:inline">Генерация фотосессии</span></span>
        </button>
        <button onClick={() => setActiveTab('editing')} className={`relative flex items-center justify-center gap-2 px-3 w-[159.5px] md:w-[168px] h-[44px] rounded-[64px] transition-all duration-300 text-[14px] font-bold leading-5 z-10 border border-transparent ${activeTab === 'editing' ? 'text-page-surface' : 'text-white border-white/30'}`}>
          {activeTab === 'editing' && <motion.div layoutId="activeTabBg" className="absolute inset-0 rounded-[64px] bg-[image:var(--gradient-how-it-works-tab-active)]" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
          <ImageIcon className={`w-5 h-5 relative z-10 ${activeTab === 'editing' ? 'text-page-surface' : 'text-white'}`} />
          <span className="relative z-10 whitespace-nowrap">Обработка фото</span>
        </button>
      </div>

      <div className="hidden w-full max-w-[1792px] justify-center gap-6 md:flex">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="grid w-full grid-cols-3 gap-6">
            {currentData.steps.map((step) => (
              <div key={step.id} className="flex flex-col gap-[24px]">
                <div className="relative aspect-[581.33/428] w-full overflow-visible rounded-[36px]">

                  <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-pricing-panel bg-[image:var(--gradient-pricing-panel)] p-12">
                    <Image src={step.img} alt={step.title} fill className="z-10 object-cover" priority={false} />
                  </div>
                </div>
                <div className="flex w-full flex-col gap-4">
                  <div className="flex min-h-11 w-full items-center gap-4">
                    <div className="inline-flex h-11 shrink-0 items-center justify-center rounded-[64px] bg-pricing-panel px-3 text-sm font-bold leading-5 text-white">
                      Шаг {step.id}
                    </div>
                    <h4 className="text-[32px] font-medium leading-[36px] tracking-tight text-white">{step.title}</h4>
                  </div>
                  <p className="text-[20px] leading-[28px] text-white/70 w-full">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex w-full flex-col items-center md:hidden">
        <div className="scrollbar-hide mx-auto w-full max-w-[343px] snap-x snap-mandatory overflow-x-auto pb-4">
          <div className="flex w-max gap-2">
            {currentData.steps.map((step) => (
              <div key={step.id} className="snap-start flex w-[280px] shrink-0 flex-col gap-4">
                <div className="relative h-[195.34px] w-[280px] overflow-hidden rounded-[36px] bg-pricing-panel bg-[image:var(--gradient-pricing-panel)]">
                  <Image src={step.img} alt={step.title} fill className="object-cover" priority={false} />
                </div>
                <div className="flex w-full flex-col gap-4">
                  <div className="flex min-h-11 w-full items-center gap-4">
                    <div className="inline-flex h-11 shrink-0 items-center justify-center rounded-[64px] bg-pricing-panel px-3 text-sm font-bold leading-5 text-white">
                      Шаг {step.id}
                    </div>
                    <h4 className="min-w-0 flex-1 break-words text-[20px] font-medium leading-7 text-white">{step.title}</h4>
                  </div>
                  <p className="text-[14px] leading-[20px] text-white/70 w-full">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
