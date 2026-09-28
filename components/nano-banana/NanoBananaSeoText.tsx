import type { NanoBananaContent } from "@/lib/api/contract";

export function NanoBananaSeoText({
  section,
}: {
  section: NanoBananaContent["seoText"];
}) {
  return (
    <section className="px-4 pb-0 pt-16 md:px-16 md:pt-36">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6 md:gap-12">
        {section.sections.map((item, index) => (
          <article
            key={`${item.heading}-${index}`}
            className="flex flex-col gap-6"
          >
            <h2
              className={
                index === 0
                  ? "text-2xl font-medium leading-7.5 tracking-[-0.02em] text-white/80 md:text-[32px] md:leading-9"
                  : "text-xl font-medium leading-7 tracking-[-0.02em] text-white/80 md:text-2xl md:leading-7.5"
              }
            >
              {item.heading}
            </h2>
            <p className="whitespace-pre-line text-sm font-normal leading-5 text-white/70 md:text-base md:leading-6">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
