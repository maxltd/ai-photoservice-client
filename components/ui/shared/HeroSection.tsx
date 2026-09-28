import type { ReactNode } from "react";
import type { PhotoSessionIdeaContent } from "@/lib/api/contract";
import { HeroLayout } from "./HeroLayout";

interface HeroSectionProps {
  title: string;
  hero: PhotoSessionIdeaContent["hero"];
  mainImage: string | null;
  breadcrumbs?: ReactNode;
}

export function HeroSection({
  title,
  hero,
  mainImage,
  breadcrumbs,
}: HeroSectionProps) {
  return (
    <section className="relative mx-auto w-full overflow-hidden rounded-t-[24px] px-4 pb-16 pt-6 md:rounded-[60px] md:px-16 md:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8 z-0 overflow-hidden">
        <div className="absolute inset-0 rounded-t-[24px] bg-[linear-gradient(180deg,#003DF3_0%,rgba(0,61,243,0)_100%)] opacity-20 md:left-1/2 md:w-[1920px] md:-translate-x-1/2 md:rounded-[60px]" />
        <div className="absolute -left-8 -top-12 h-40 w-40 rounded-2xl bg-[linear-gradient(100.9deg,#5BCFFF_2.38%,rgba(11,127,210,0.8)_100%)] opacity-60 blur-[50px] md:left-[calc(50%_-_240px_+_313px)] md:top-[calc(50%_-_240px)] md:h-[480px] md:w-[480px] md:blur-[100px]" />
        <div className="absolute -left-8 -top-12 hidden h-40 w-40 rounded-2xl bg-[linear-gradient(100.9deg,#5BCFFF_2.38%,rgba(11,127,210,0.8)_100%)] opacity-60 blur-[50px] md:left-[calc(50%_-_240px_-_967px)] md:top-[calc(50%_-_240px_-_400px)] md:h-[480px] md:w-[480px] md:blur-[100px] md:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1792px]">
        {breadcrumbs}
        <HeroLayout title={title} hero={hero} mainImage={mainImage} />
      </div>
    </section>
  );
}
