import { NanoBananaImage } from "./NanoBananaImage";
import type { NanoBananaContent } from "@/lib/api/contract";

export function NanoBananaEditor({
  section,
}: {
  section: NanoBananaContent["editor"];
}) {
  return (
    <section className="nano-banana-editor">
      <div className="nano-banana-editor__glow" aria-hidden="true" />
      <div className="nano-banana-editor__overlay" aria-hidden="true" />

      <div className="nano-banana-editor__title">
        <h2 className="nano-banana-editor__heading">
          <span className="nano-banana-editor__heading-accent">
            {section.titleAccent}
          </span>
          <span className="nano-banana-editor__heading-plain">
            {section.titlePlain}
          </span>
        </h2>
        <p className="nano-banana-editor__description">
          {section.description}
        </p>
      </div>

      <div className="nano-banana-editor__image-stage">
        <div className="nano-banana-editor__image">
          <NanoBananaImage
            image={section.image}
            sizes="(max-width: 767px) 728px, 1289px"
            className="nano-banana-editor__image-content"
          />
        </div>
      </div>
    </section>
  );
}
