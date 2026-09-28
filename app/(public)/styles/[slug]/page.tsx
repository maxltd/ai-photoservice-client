import type { Metadata } from "next";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { cookies } from "next/headers";
import { cache } from "react";
import { notFound } from "next/navigation";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { StatsSection } from "@/components/main/Stats";
import { FaqSection } from "@/components/faq/FaqSection";
import { MoreIdeasSection } from "@/components/ui/shared/MoreIdeasSection";
import { StyleBottomCtaSection } from "@/components/ui/pages/styles/StyleBottomCtaSection";
import { LatestAiTrendsSection } from "@/components/ui/shared/LatestAiTrendsSection";
import { SeoTextTagsSection } from "@/components/ui/shared/SeoTextTagsSection";
import { Breadcrumbs } from "@/components/ui/shared/Breadcrumbs";
import { HeroSection } from "@/components/ui/shared/HeroSection";
import { StylePageHowGeneratorWorks } from "@/components/ui/pages/styles/StylePageHowGeneratorWorks";
import { API_ROUTES, type PhotoSessionStyleResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

interface StylePageProps { params: Promise<{ slug: string }>; }
interface SeoMetaPayload { title?: string; description?: string; canonical?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; jsonLd?: unknown; }
interface StylePagePayload { data: PhotoSessionStyleResponse; meta?: { seo?: SeoMetaPayload }; }

const getStyle = cache(async (slug: string): Promise<StylePagePayload> => {
  const response = await fetch(toServerApiUrl(API_ROUTES.PHOTO_SESSION_STYLE(slug)), { headers: { cookie: (await cookies()).toString() }, cache: "no-store" });
  if (response.status === 404 || response.status === 410) notFound();
  if (!response.ok) throw new Error("Failed to load photo session style");
  return (await response.json()) as StylePagePayload;
});

export async function generateMetadata({ params }: StylePageProps): Promise<Metadata> {
  const payload = await getStyle((await params).slug);
  const style = payload.data;
  const seo = payload.meta?.seo;
  return {
    title: seo?.title ?? style.seoTitle ?? style.h1,
    description: seo?.description ?? style.seoDescription ?? undefined,
    alternates: seo?.canonical || style.canonical ? { canonical: seo?.canonical ?? style.canonical ?? undefined } : undefined,
    robots: { index: style.robotsIndex, follow: style.robotsFollow },
    openGraph: { title: seo?.ogTitle ?? style.ogTitle ?? style.seoTitle ?? style.h1, description: seo?.ogDescription ?? style.ogDescription ?? style.seoDescription ?? undefined, images: seo?.ogImage || style.ogImage ? [seo?.ogImage ?? style.ogImage ?? ""] : undefined },
  };
}

export default async function PhotoSessionStylePage({ params }: StylePageProps) {
  const payload = await getStyle((await params).slug);
  const style = payload.data;
  const content = style.content;
  const trends = style.trends ?? [];
  const moreIdeas = (style.moreIdeas ?? []).slice(0, 4);
  const faqJsonLd = payload.meta?.seo?.jsonLd;
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101010] text-white">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1920px] pb-16 pt-[116px] md:pt-[160px]">
        {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} /> : null}
        <HeroSection title={style.h1} hero={{ ...content.hero, cta: { text: style.ctaText ?? "Создать свой фото", href: style.ctaHref ?? "/app/create" } }} mainImage={style.mainImage} breadcrumbs={<Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Стили фотосессий", href: "/styles/" }, { label: style.h1 }]} />} />
        <StylePageHowGeneratorWorks howGeneratorWorks={content.howGeneratorWorks} />
        <LatestAiTrendsSection trendsContent={content.trends} trends={trends} />
        <StatsSection />
        <MoreIdeasSection moreIdeasContent={content.moreIdeas} items={moreIdeas} />
        <FaqSection title={content.faq.title} items={content.faq.items} />
        <StyleBottomCtaSection bottomCta={content.bottomCta} />
        <SeoTextTagsSection seoText={content.seoText} target="styles" />
      </main>
      <FooterSection activeSection="styles" />
    </div>
  );
}
