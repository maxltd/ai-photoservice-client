import { RealismSlider } from "./RealismSlider";

export interface RealismSectionProps {
  spacing?: "content" | "homepage";
  titleAccent?: string;
  titlePlain?: string;
  description?: string;
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const RealismSection = ({
  titleAccent = "Реализм, который",
  titlePlain = "видно в деталях",
  description = "ИИ улучшает качество, сохраняя естественность.\nКожа, свет, детали — всё выглядит как в реальной съёмке.",
  beforeImage,
  afterImage,
  beforeLabel = "До",
  afterLabel = "После",
  spacing = "content",
}: RealismSectionProps = {}): React.JSX.Element => {
  const [firstLine, ...rest] = description.split("\n");
  const [accentWord = "", ...accentRest] = titleAccent.split(" ");
  const plainTitle = [accentRest.join(" "), titlePlain].filter(Boolean).join(" ");

  return (
    <section className={`snap-section relative flex h-[880px] w-full flex-col items-center justify-start overflow-hidden bg-[--color-page-surface] px-4 py-16 md:h-[1632px] md:gap-[60px] md:px-16 md:pt-36 gap-9 ${spacing === "homepage" ? "md:pb-36" : "md:pb-0"}`}>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[linear-gradient(100.9deg,#5BCFFF_2.38%,rgba(11,127,210,0.8)_100%)] opacity-60 blur-[100px] md:-translate-y-[304px]" />
      <div className="relative z-10 flex h-[220px] w-full max-w-[787px] flex-col items-center gap-9 text-center md:h-[clamp(207px,14.79vw,284px)] md:gap-9">
        <h2 className="h-[88px] text-[clamp(40px,5vw,96px)] font-medium leading-[clamp(44px,5vw,96px)] tracking-[-0.02em] md:h-[clamp(88px,10vw,192px)] md:tracking-[-0.04em]">
          <span className="bg-[linear-gradient(100.9deg,#5BCFFF_2.38%,rgba(11,127,210,0.8)_100%)] bg-clip-text text-transparent md:bg-[radial-gradient(100%_100%_at_0%_0%,#30F9F2_0%,#843CFF_100%)]">
            {accentWord}
          </span>{" "}
          <span className="text-white/80">{plainTitle}</span>
        </h2>
        <p className="h-[96px] whitespace-pre-line text-[16px] font-normal leading-6 text-white/80 md:h-[56px] md:text-[20px] md:font-medium md:leading-7">
          {firstLine}
          {rest.length ? `\n${rest.join("\n")}` : ""}
        </p>
      </div>
      <RealismSlider
        beforeImage={beforeImage}
        afterImage={afterImage}
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
      />
    </section>
  );
};
