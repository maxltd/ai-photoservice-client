import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NanoBananaImage } from "./NanoBananaImage";
import type {
  NanoBananaContent,
  NanoBananaImage as ImageData,
} from "@/lib/api/contract";

export function NanoBananaHero({
  hero,
  image,
  internalName,
}: {
  hero: NanoBananaContent["hero"];
  image: ImageData;
  internalName: string;
}) {
  return (
    <section className="relative isolate min-h-[677px] w-full overflow-hidden rounded-t-[24px] md:aspect-[1920/941] md:min-h-0 md:rounded-[60px]">
      <NanoBananaImage
        image={image}
        priority
        sizes="(max-width: 767px) 100vw, 100vw"
        className="object-cover object-center"
      />

      <div className="relative z-10 flex min-h-[677px] flex-col items-center justify-end px-4 pb-8 text-center md:min-h-0 md:h-full md:px-16 md:pb-16">
        <nav
          aria-label="Хлебные крошки"
          className="absolute left-4 top-6 flex items-center gap-4 text-xs leading-[18px] text-white/80 md:left-16 md:top-14"
        >
          <Link href="/" className="transition-opacity hover:opacity-70">
            Главная
          </Link>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
          <span>{internalName}</span>
        </nav>

        <div className="flex w-full max-w-[868px] flex-col items-center gap-8">
          <h1 className="w-full font-medium tracking-[-0.02em]">
            <span className="nano-banana-title-accent block whitespace-nowrap text-[40px] leading-[44px] md:text-[96px] md:leading-[96px]">
              {hero.titleAccent}
            </span>
            <span className="block text-[40px] leading-[44px] text-white md:whitespace-nowrap md:text-[96px] md:leading-[96px]">
              {hero.titlePlain}
            </span>
          </h1>

          <p className="max-w-[343px] text-base font-medium leading-6 text-white md:max-w-[868px] md:text-xl md:leading-7">
            {hero.description}
          </p>

          <Button
            asChild
            size="default"
            className="nano-banana-cta h-16 w-[278px] rounded-[64px] px-5 text-lg font-bold leading-6 whitespace-nowrap text-white hover:opacity-90"
          >
            <Link href={hero.cta.href}>
              <Sparkles aria-hidden="true" className="size-6" />
              {hero.cta.text}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
