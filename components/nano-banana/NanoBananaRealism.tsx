import type { NanoBananaContent } from "@/lib/api/contract";
import { RealismSection } from "@/components/main/Realism";

export function NanoBananaRealism({
  section,
}: {
  section: NanoBananaContent["realism"];
}) {
  return (
    <RealismSection
      titleAccent={section.titleAccent}
      titlePlain={section.titlePlain}
      description={section.description}
      beforeImage={section.before.url}
      afterImage={section.after.url}
      beforeLabel={section.beforeLabel}
      afterLabel={section.afterLabel}
    />
  );
}
