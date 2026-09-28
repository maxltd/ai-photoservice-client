import { HeroCtaButton } from "@/components/ui/HeroCtaButton";
import type { PhotoSessionIdeaContent } from "@/lib/api/contract";
import { paletteClass } from "./idea-page-shared";

export function IdeaPageHowToCreate({
  howToCreate,
}: {
  howToCreate: PhotoSessionIdeaContent["howToCreate"];
}) {
  const howToDesktop = howToCreate.steps;
  const howToMobile = [howToCreate.steps[0], howToCreate.steps[2], howToCreate.steps[1]].filter(
    (item) => Boolean(item),
  );

  return (
    <section className="mx-auto w-full px-4 py-16 md:px-16 md:py-36">
      <div className="mx-auto max-w-[1792px]">
        <h2 className="mx-auto max-w-[1186px] text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">
          {howToCreate.title}
        </h2>

        <div className="mt-9 space-y-4 md:hidden">
          {howToMobile.map((step, index) => {
            const stepNum = index === 1 ? "03" : index === 2 ? "02" : "01";
            const rotate = stepNum === "02" ? "-rotate-[4deg]" : "";

            return (
              <article
                key={`${step.title}-${index}`}
                className={`flex min-h-[164px] w-full items-center gap-5 rounded-3xl px-5 py-6 sm:gap-10 sm:px-6 ${paletteClass(step.palette)} ${rotate}`}
              >
                <p className="text-7xl font-medium leading-none text-[#101010]">{stepNum}</p>
                <div className="space-y-2">
                  <h3 className="text-2xl font-medium leading-[30px] tracking-[-0.02em] text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-5 text-white/70">{step.text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 hidden gap-6 md:grid md:grid-cols-3">
          {howToDesktop.map((step, index) => (
            <article
              key={`${step.title}-${index}`}
              className={`flex h-[192px] items-center gap-10 rounded-3xl px-6 ${paletteClass(step.palette)} ${
                index === 1 ? "-rotate-[4deg]" : ""
              }`}
            >
              <p className="text-[144px] font-medium leading-none text-[#101010]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div className="space-y-4">
                <h3 className="text-4xl font-medium leading-10 tracking-[-0.02em] text-white">
                  {step.title}
                </h3>
                <p className="text-base leading-6 text-white/70">{step.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 text-center">
          <HeroCtaButton
            href={howToCreate.cta.href}
            label={howToCreate.cta.text}
            className="mx-auto h-[68px] w-full max-w-[343px] px-6 md:w-[256.7px]"
          />
        </div>
      </div>
    </section>
  );
}
