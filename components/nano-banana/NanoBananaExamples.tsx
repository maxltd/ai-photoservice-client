import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NanoBananaImage } from "./NanoBananaImage";
import type { NanoBananaContent } from "@/lib/api/contract";

export function NanoBananaExamples({
  section,
}: {
  section: NanoBananaContent["examples"];
}) {
  return (
    <section className="nano-banana-examples relative isolate overflow-hidden px-4 py-16 sm:px-8 md:px-16 md:py-28">
      <div aria-hidden="true" className="nano-banana-examples__glow" />
      <div className="relative z-10 mx-auto max-w-[1792px]">
        <div className="mx-auto flex max-w-[884px] flex-col items-center gap-4 text-center md:gap-9">
          <h2 className="nano-banana-examples__heading w-full">
            {section.title}
          </h2>
          <p className="nano-banana-examples__description w-full">
            {section.description}
          </p>
        </div>
        <div className="nano-banana-examples__gallery relative mt-9">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-6">
            {section.items.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className={`${
                  index === section.items.length - 1 ? "hidden md:block" : ""
                } relative aspect-[167/191] overflow-hidden rounded-[36px] border border-white/10 md:aspect-[339/420]`}
              >
                <NanoBananaImage
                  image={image}
                  sizes="(max-width: 767px) 50vw, 20vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="mt-9 flex justify-center md:absolute md:inset-x-0 md:bottom-4 md:mt-0">
            <Button asChild className="nano-banana-examples__cta w-full md:w-auto">
              <Link href={section.cta.href}>
                <ArrowUpRight aria-hidden="true" className="size-4" />
                {section.cta.text}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
