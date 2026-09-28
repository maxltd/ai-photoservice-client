"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/api/contract";

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-2">
      {items.map((item, index) => (
        <AccordionItem
          key={`${item.question}-${index}`}
          value={`faq-${index}`}
          className="box-border overflow-hidden rounded-2xl border-0 bg-pricing-panel data-[state=open]:min-h-[237px] md:data-[state=open]:min-h-[169px]"
        >
          <AccordionTrigger className="min-h-[80px] gap-2 px-4 py-4 text-left text-base font-medium leading-6 text-pricing-foreground hover:bg-transparent md:min-h-[84px] md:px-6 md:py-6 md:text-xl md:leading-7 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-white">
            <span className="faq-number-badge">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">{item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-sm leading-5 text-pricing-foreground md:px-6 md:pb-6 md:text-base md:leading-6 [&>div]:px-0 [&>div]:pb-0">
            <div className="flex flex-col gap-4">
              <div className="flex h-[5px] items-center px-0 py-[2px]">
                <span className="h-px w-full bg-white/8" />
              </div>
              <p className="whitespace-pre-line font-normal">{item.answer}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
