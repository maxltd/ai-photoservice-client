import { NanoBananaImage } from "./NanoBananaImage";
import type { NanoBananaContent } from "@/lib/api/contract";

export function NanoBananaAudience({
  section,
}: {
  section: NanoBananaContent["audiences"];
}) {
  const titleWords = section.title.split(" ");
  const accentTitle = titleWords.slice(0, 2).join(" ");
  const plainTitle = titleWords.slice(2).join(" ");

  return (
    <section className="relative isolate overflow-hidden px-4 py-16 sm:px-8 md:px-16 md:pb-28 md:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 size-[200px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[image:var(--gradient-nano-banana-title)] opacity-60 blur-[80px] md:size-[442px] md:blur-[130px]"
      />
      <div className="relative z-10 mx-auto max-w-[1792px]">
        <h2 className="mx-auto max-w-[343px] text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-white md:max-w-[884px] md:text-[64px] md:leading-[64px]">
          <span className="nano-banana-title-accent">{accentTitle}</span>{" "}
          {plainTitle}
        </h2>
        <div className="mt-9 flex snap-x gap-4 overflow-x-auto pb-1 md:mt-[60px] md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          {section.items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="relative min-w-[280px] shrink-0 snap-start overflow-hidden rounded-lg md:min-w-0 md:rounded-[36px]"
            >
              <div className="relative aspect-[280/321] md:aspect-[436/500]">
                <NanoBananaImage
                  image={item.image}
                  sizes="(max-width: 767px) 280px, 25vw"
                  className="object-cover"
                />
                <div className="relative z-10 flex h-full flex-col items-start justify-between gap-4 p-4 md:p-9">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-medium leading-6 tracking-[-0.02em] text-white/80 md:text-2xl md:leading-[30px]">
                      {item.title}
                    </h3>
                    <p className="text-sm font-normal leading-5 text-white/80 md:text-xl md:font-medium md:leading-7">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
