"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  AiToolPageContent,
  PhotoSessionIdeaContent,
  PhotoSessionStyleContent,
} from "@/lib/api/contract";
import { sanitizeHtml } from "@/lib/sanitize-html";

type SeoText =
  | PhotoSessionIdeaContent["seoText"]
  | PhotoSessionStyleContent["seoText"]
  | AiToolPageContent["seoText"];

type SeoTextTagsSectionProps = {
  seoText: SeoText;
  target: "ideas" | "styles" | "ai-tools";
};

export function SeoTextTagsSection({
  seoText,
  target,
}: SeoTextTagsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="mx-auto w-full px-4 pb-0 pt-16 md:px-16 md:pb-0 md:pt-36">
      <div className="mx-auto max-w-[1792px] space-y-9 md:space-y-[60px]">
        <div className="space-y-6">
          <h2 className="text-[24px] font-medium leading-[30px] tracking-[-0.02em] text-white/80 md:text-[32px] md:leading-9">
            {seoText.title}
          </h2>

          <div>
            <div
              className={[
                "text-sm leading-5 text-white/70 md:text-base md:leading-6",
                !isExpanded && "line-clamp-11 md:line-clamp-4",
              ]
                .filter(Boolean)
                .join(" ")}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(seoText.body) }}
            />
            <button
              type="button"
              className="mt-4 cursor-pointer text-lg font-bold text-profile-link"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Свернуть" : "Показать ещё"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {seoText.tags.map((tag) => (
            <Link
              key={tag}
              href={`/${target}?search=${encodeURIComponent(tag)}`}
              className="inline-flex h-11 items-center justify-center rounded-[64px] border border-white/30 px-3 text-sm font-bold leading-5 text-white"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
