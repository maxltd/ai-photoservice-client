"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordion({ items }: { items: readonly FAQItem[] }): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[343px] md:max-w-[1186px]">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={`${item.question}-${index}`}
            className="w-full rounded-2xl cursor-pointer select-none transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onClick={() => setOpenIndex((previous) => (previous === index ? null : index))}
          >
            <div className="flex flex-row items-start md:items-center gap-[10px] p-4 md:p-6">
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-[64px] h-[26px] md:h-[36px] px-4 md:px-6 text-white text-[12px] md:text-[20px] font-medium leading-[18px] md:leading-[28px]"
                style={{
                  background:
                    'radial-gradient(55.38% 100% at 50% 100%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.2)',
                }}
              >
                {index + 1}
              </div>

              <span className="flex-1 text-[16px] md:text-[20px] font-medium leading-6 md:leading-7 text-white/80">
                {item.question}
              </span>

              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white">
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {isOpen && (
              <div className="px-4 md:px-6 pb-4 md:pb-6 flex flex-col gap-[10px]">
                <div className="w-full h-[1px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <p className="text-[14px] md:text-[16px] leading-5 md:leading-6 font-normal text-white/80">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
