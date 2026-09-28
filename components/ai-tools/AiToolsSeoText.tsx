import type { AiToolsSeoSection } from "@/lib/api/contract";

export function AiToolsSeoText({
  sections,
}: {
  sections: [AiToolsSeoSection, AiToolsSeoSection];
}) {
  return (
    <section className="space-y-10 px-4 md:px-0">
      {sections.map((section, index) => (
        <article key={`${section.heading}-${index}`}>
          <h2
            className={
              index === 0
                ? "text-2xl font-medium leading-8 md:text-[32px] md:leading-9"
                : "text-2xl font-medium leading-8"
            }
          >
            {section.heading}
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-5 text-foreground-muted md:text-base md:leading-6">
            {section.body.split(/\n\s*\n/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
