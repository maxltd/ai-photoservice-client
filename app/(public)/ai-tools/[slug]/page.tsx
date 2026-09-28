import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { notFound } from "next/navigation";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { RealismSection } from "@/components/main/Realism";
import { StatsSection } from "@/components/main/Stats";
import { FaqSection } from "@/components/faq/FaqSection";
import { BottomCtaSection } from "@/components/ui/shared/BottomCtaSection";
import { SeoTextTagsSection } from "@/components/ui/shared/SeoTextTagsSection";
import { Breadcrumbs } from "@/components/ui/shared/Breadcrumbs";
import { AiToolHeroLayout } from "@/components/ai-tools/AiToolHeroLayout";
import { IdeaPageHowToCreate } from "@/components/ui/pages/ideas/IdeaPageHowToCreate";
import { AiToolGallery } from "@/components/ai-tools/AiToolGallery";
import { AiToolUsage } from "@/components/ai-tools/AiToolUsage";
import { AiToolFeatures } from "@/components/ai-tools/AiToolFeatures";
import { AiToolRelatedArticles } from "@/components/ai-tools/AiToolRelatedArticles";
import { AiToolsOtherTools } from "@/components/ai-tools/AiToolsOtherTools";
import { AiToolTryLook } from "@/components/ai-tools/AiToolTryLook";
import { API_ROUTES, type AiToolPagePublicResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

function renderableImageUrl(value: string): string {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") ? value : "";
}
const getPage = cache(
  async (slug: string): Promise<AiToolPagePublicResponse> => {
    const response = await fetch(
      toServerApiUrl(API_ROUTES.AI_TOOL_PAGE_BY_SLUG(slug)),
      { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
    );
    if (response.status === 404 || response.status === 410) notFound();
    if (!response.ok) throw new Error("Failed to load AI tool page");
    return (await response.json()) as AiToolPagePublicResponse;
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const payload = await getPage((await params).slug);
  const seo = payload.meta.seo;
  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function AiToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const payload = await getPage((await params).slug);
  const page = payload.data;
  const content = page.content;
  const howTo = {
    title: content.howTo.title,
    steps: content.howTo.steps.map((step, index) => ({
      ...step,
      palette: (["purple", "blue", "green"] as const)[index % 3],
    })),
    cta: content.howTo.cta,
  };
  return (
    <div className="min-h-screen overflow-x-hidden bg-page-shell text-foreground">
      <IdeaPageHeader />
      <main className="w-full pb-16 pt-[116px] md:pt-[160px]">
        <AiToolHeroLayout
          title={page.h1}
          hero={content.hero}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Инструменты", href: "/ai-tools" },
                { label: page.h1 },
              ]}
            />
          }
        />
        <AiToolGallery
          section={{
            ...content.gallery,
            items:
              content.gallery.items.length > 0
                ? content.gallery.items
                : content.hero.images,
          }}
        />
        <IdeaPageHowToCreate howToCreate={howTo} />
        <AiToolUsage section={content.usage} />
        <RealismSection
          titleAccent={content.realism.titleAccent}
          titlePlain={content.realism.titlePlain}
          description={content.realism.description}
          beforeImage={content.realism.before.url}
          afterImage={content.realism.after.url}
          beforeLabel={content.realism.beforeLabel}
          afterLabel={content.realism.afterLabel}
        />
        <AiToolFeatures section={content.features} />
        {page.tryLook ? <AiToolTryLook section={page.tryLook} /> : null}
        <AiToolsOtherTools tools={page.otherTools ?? []} />
        <StatsSection />
        <FaqSection title={content.faq.title} items={content.faq.items} />
        <AiToolRelatedArticles
          title="Статьи по теме"
          articles={page.relatedArticles ?? []}
        />
        <BottomCtaSection
          bottomCta={{
            ...content.bottomCta,
            images: content.bottomCta.images.map(renderableImageUrl) as [string, string, string],
          }}
        />
        <SeoTextTagsSection seoText={content.seoText} target="ai-tools" />
      </main>
      <FooterSection activeSection="ai-tools" />
    </div>
  );
}
