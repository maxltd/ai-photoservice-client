import type { AiToolPageContent } from "@/lib/api/contract";
export function AiToolFeatures({
  section,
}: {
  section: AiToolPageContent["features"];
}) {
  return (
    <section className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-center gap-9 overflow-hidden bg-page-surface px-4 py-16 md:gap-12 md:px-16 md:py-36">
      <h2 className="w-full max-w-[1333px] text-center text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-white/80 md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">
        {section.title}
      </h2>
      <div className="flex w-full gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
        {section.items.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className="flex h-[260px] w-[280px] shrink-0 flex-col gap-6 rounded-[24px] bg-white/[0.08] p-6 backdrop-blur-[18px] md:h-[280px] md:min-w-0 md:flex-1 md:w-auto"
          >
            <h3 className="text-center text-[20px] font-medium leading-7 text-white/80 md:text-[32px] md:leading-9 md:tracking-[-0.02em]">
              {item.title}
            </h3>
            <p className="text-[16px] font-normal leading-6 text-white/30 md:text-[20px] md:font-medium md:leading-7">
              {item.text}
            </p>
            <span
              aria-hidden="true"
              className="mt-auto text-[144px] font-medium leading-[144px] tracking-[-0.04em] text-page-surface"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
