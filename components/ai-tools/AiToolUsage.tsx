import { ResponsiveImage } from "@/components/ui/shared/ResponsiveImage";
import type { AiToolPageContent } from "@/lib/api/contract";
export function AiToolUsage({
  section,
}: {
  section: AiToolPageContent["usage"];
}) {
  return (
    <section className="ai-tool-usage">
      <div className="ai-tool-usage__intro">
        <h2 className="ai-tool-usage__title">{section.title}</h2>
        <p className="ai-tool-usage__description">{section.description}</p>
      </div>

      <div className="ai-tool-usage__image">
        <ResponsiveImage
          src={section.image.url}
          alt={section.image.alt}
          variants={section.image.variants}
          sizes="(max-width: 767px) 343px, (max-width: 1279px) 42vw, 690px"
        />
      </div>

      <div className="ai-tool-usage__items">
        {section.items.map((item, index) => (
          <article className="ai-tool-usage__item" key={`${item.title}-${index}`}>
            <div className="ai-tool-usage__item-heading">
              <span className="ai-tool-usage__item-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="ai-tool-usage__item-title">{item.title}</h3>
            </div>
            <p className="ai-tool-usage__item-text">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
