"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/api/contract";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

export function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section className="mx-auto w-full px-4 py-16 md:px-16 md:pt-36">
      <div className="mx-auto max-w-[1186px]">
        <h2 className="mx-auto max-w-[884px] text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">
          {title}
        </h2>

        <Accordion type="single" collapsible defaultValue="faq-0" className="mt-6 space-y-2">
          {items.map((item, index) => (
            <AccordionItem
              key={`${item.question}-${index}`}
              value={`faq-${index}`}
              className="overflow-hidden rounded-2xl border-0 bg-white/8"
            >
              <AccordionTrigger className="min-h-[80px] gap-[10px] px-4 py-4 text-left text-base font-medium leading-6 text-white/80 [&>svg]:h-6 [&>svg]:w-6 md:min-h-[84px] md:px-6 md:py-6 md:text-xl md:leading-7">
                <span className="faq-number-badge">
                  {index + 1}
                </span>
                <span className="flex-1">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 md:px-6 md:pb-6 [&>div]:px-0 [&>div]:pb-0">
                <div
                  className="border-t border-white/10 pt-4 text-sm leading-5 text-white/80 md:text-base md:leading-6"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.answer) }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
