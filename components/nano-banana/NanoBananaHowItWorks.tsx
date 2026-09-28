import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NanoBananaImage } from "./NanoBananaImage";
import type { NanoBananaContent } from "@/lib/api/contract";

export function NanoBananaHowItWorks({
  section,
}: {
  section: NanoBananaContent["howItWorks"];
}) {
  return (
    <section className="px-4 py-16 sm:px-8 md:px-16 md:py-36">
      <div className="mx-auto flex max-w-[1792px] flex-col items-center gap-9 md:gap-12">
        <div className="flex w-full max-w-[884px] flex-col items-center gap-9 md:gap-6">
          <h2 className="flex w-full max-w-[827px] flex-wrap items-start justify-center gap-x-2 text-center text-[32px] font-medium leading-9 tracking-[-0.04em] text-white/80 md:text-[64px] md:leading-16">
            <span className="shrink-0">{section.titlePrefix}</span>
            <Image
              src="/icons/nano-banana/Banana.svg"
              alt=""
              aria-hidden="true"
              width={64}
              height={64}
              className="h-9 w-9 shrink-0 md:h-16 md:w-16"
            />
            <span className="nano-banana-how-title-accent shrink-0">
              {section.titleSuffix || section.titleBrand}
            </span>
          </h2>
          <p className="w-full max-w-[343px] text-center text-base font-medium leading-6 text-white/80 md:max-w-[884px] md:text-xl md:leading-7">
            {section.description}
          </p>
        </div>
        <div className="scrollbar-hide flex w-full max-w-[343px] snap-x snap-mandatory gap-2 overflow-x-auto md:grid md:max-w-none md:grid-cols-3 md:gap-6 md:overflow-visible">
          {section.steps.map((step, index) => (
            <article
              key={`${step.title}-${index}`}
              className="flex w-[280px] min-w-[280px] flex-none snap-start flex-col gap-4 md:w-full md:min-w-0 md:gap-6"
            >
              <div className="relative aspect-[280/195.34] w-full overflow-hidden rounded-[36px] bg-pricing-panel bg-[image:var(--gradient-pricing-panel)] md:aspect-[581.33/428]">
                <NanoBananaImage
                  image={step.image}
                  sizes="(max-width: 767px) 280px, (max-width: 1200px) 33vw, 581px"
                  className="object-cover"
                />
              </div>
              <div className="flex w-full flex-col gap-4">
                <div className="flex min-h-11 w-full items-center gap-4">
                  <span className="inline-flex h-11 flex-none items-center justify-center rounded-[64px] bg-pricing-panel px-3 text-sm font-bold leading-5 text-white">
                    Шаг {index + 1}
                  </span>
                  <h3 className="min-w-0 flex-1 text-xl font-medium leading-7 text-white md:text-[32px] md:leading-9">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm font-normal leading-5 text-white/70 md:text-xl md:font-medium md:leading-7">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
        <Button
          asChild
          className="nano-banana-cta h-[68px] w-full max-w-[343px] rounded-[67.2px] px-[21px] text-[18.9px] font-bold leading-[25px] text-white hover:opacity-90 md:w-[267.7px] md:max-w-none"
        >
          <Link href={section.cta.href}>
            <Sparkles aria-hidden="true" className="size-[25.2px]" />
            {section.cta.text}
          </Link>
        </Button>
      </div>
    </section>
  );
}
