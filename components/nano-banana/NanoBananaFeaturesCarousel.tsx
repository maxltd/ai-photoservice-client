"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Maximize2,
  Plus,
  Sparkles,
  Sticker,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { NanoBananaImage } from "./NanoBananaImage";
import type { NanoBananaContent } from "@/lib/api/contract";

const icons = {
  plus: Plus,
  maximize: Maximize2,
  sticker: Sticker,
  mask: Circle,
  sparkles: Sparkles,
} as const;

export function NanoBananaFeaturesCarousel({
  section,
}: {
  section: NanoBananaContent["features"];
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function move(direction: 1 | -1) {
    const next = Math.min(
      section.items.length - 1,
      Math.max(0, active + direction),
    );
    setActive(next);
    viewport.current?.children[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
  return (
    <section className="px-2 py-16 md:px-16 md:py-28">
      <div className="mx-auto max-w-[1792px] overflow-hidden rounded-[24px] bg-black px-4 py-16 md:rounded-[36px] md:px-16 md:py-16">
        <h2 className="text-center text-2xl font-medium leading-[30px] tracking-[-0.02em] text-white/80 md:text-[40px] md:leading-[44px]">
          {section.title}
        </h2>
        <div
          ref={viewport}
          className="mt-9 flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] md:mt-6 md:gap-6"
        >
          {section.items.map((item, index) => {
            const Icon = icons[item.icon];
            return (
              <article
                key={`${item.title}-${index}`}
                className="relative flex h-[259px] min-w-[280px] snap-start flex-none flex-col justify-end overflow-hidden rounded-2xl p-4 md:h-[500px] md:min-w-[540px] md:rounded-[36px] md:p-9"
              >
                <NanoBananaImage
                  image={item.image}
                  sizes="(max-width: 767px) 280px, 540px"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-[187px] bg-gradient-to-b from-transparent to-black" />
                <div className="relative z-10 flex flex-col items-start gap-2 md:gap-4">
                  <Icon className="h-6 w-6 text-white md:h-9 md:w-9" />
                  <h3 className="text-base font-normal leading-6 text-white/80 md:text-2xl md:font-medium md:leading-[30px] md:tracking-[-0.02em]">
                    {item.title}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
        <div className="relative mt-4 flex items-center justify-center md:mt-6 md:min-h-14">
          <div className="flex items-center gap-2" aria-label="Позиция карусели">
            {section.items.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Карточка ${index + 1}`}
                onClick={() => {
                  setActive(index);
                  viewport.current?.children[index]?.scrollIntoView({
                    behavior: "smooth",
                    inline: "start",
                  });
                }}
                className={`h-1.5 rounded-full transition-all ${index === active ? "w-9 bg-white/50" : "w-1.5 bg-white/15"}`}
              />
            ))}
          </div>
          <div className="absolute right-0 hidden items-center gap-2 md:flex">
            <Button
              aria-label="Предыдущая возможность"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-white/10 bg-transparent"
              onClick={() => move(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              aria-label="Следующая возможность"
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-white/10 bg-transparent"
              onClick={() => move(1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-14 rounded-full border-white/10 bg-white/[0.08] px-5 text-sm font-bold text-white hover:bg-white/[0.12]"
            >
              <Link href={section.allToolsCta.href}>
                <Sparkles className="h-4 w-4" />
                {section.allToolsCta.text}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
