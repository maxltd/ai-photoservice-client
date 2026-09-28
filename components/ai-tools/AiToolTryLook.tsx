"use client";

import { useState } from "react";
import type {
  PhotoSessionIdeaCard,
  PhotoSessionStyleCard,
} from "@/lib/api/contract";
import { PopularIdeasCarousel } from "@/components/main/PopularIdeasCarousel";

function styleAsIdea(style: PhotoSessionStyleCard): PhotoSessionIdeaCard {
  return {
    id: style.id,
    slug: style.slug,
    title: style.title,
    image: style.image,
    imageVariants: style.imageVariants,
    href: style.href,
    categoryId: null,
    usageCount: style.usageCount,
    usagePeriod: style.usagePeriod,
    tag: null,
    secondaryImages: [],
    imageCount: 1,
  };
}

export function AiToolTryLook({
  section,
}: {
  section: {
    title: string;
    ideas: PhotoSessionIdeaCard[];
    styles: PhotoSessionStyleCard[];
  };
}) {
  const [activeTab, setActiveTab] = useState<"ideas" | "styles">("ideas");
  const styles = section.styles.map(styleAsIdea);
  const items = activeTab === "ideas" ? section.ideas : styles;

  if (section.ideas.length === 0 && section.styles.length === 0) return null;

  return (
    <section className="relative isolate mx-auto flex w-full flex-col items-center overflow-hidden rounded-[24px] bg-page-surface px-4 pb-0 pt-16 md:rounded-[60px] md:px-16 md:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[341px] z-0 h-[200px] w-[200px] -translate-x-1/2 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[100px] md:h-[480px] md:w-[480px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-0 h-[839px] w-full bg-gradient-idea-section-overlay opacity-20 md:h-[950px]"
      />

      <div className="relative z-10 flex w-full max-w-[1792px] flex-col items-center gap-9 md:gap-[60px]">
        <h2 className="w-full max-w-[1200px] text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">
          {section.title}
        </h2>
        <div className="flex h-[60px] w-[332px] shrink-0 items-center gap-2 rounded-full bg-white/[0.08] p-2 backdrop-blur-[12px]">
          <button
            type="button"
            className={`flex h-11 w-[154px] shrink-0 items-center justify-center rounded-full p-3 text-sm font-bold leading-5 ${activeTab === "ideas" ? "bg-[image:var(--gradient-how-it-works-tab-active)] text-black" : "text-white/70"}`}
            onClick={() => setActiveTab("ideas")}
          >
            Идеи фотосессии
          </button>
          <button
            type="button"
            className={`flex h-11 w-[154px] shrink-0 items-center justify-center rounded-full p-3 text-sm font-bold leading-5 ${activeTab === "styles" ? "bg-[image:var(--gradient-how-it-works-tab-active)] text-black" : "text-white/70"}`}
            onClick={() => setActiveTab("styles")}
          >
            Стили фотосессии
          </button>
        </div>
        <div className="w-full">
          <PopularIdeasCarousel ideas={items} />
        </div>
      </div>
    </section>
  );
}
