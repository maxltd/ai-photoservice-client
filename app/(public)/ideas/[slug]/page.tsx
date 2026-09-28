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
import { Breadcrumbs } from "@/components/ui/shared/Breadcrumbs";
import { HeroSection } from "@/components/ui/shared/HeroSection";
import { BottomCtaSection } from "@/components/ui/shared/BottomCtaSection";
import { IdeaPageHowToCreate } from "@/components/ui/pages/ideas/IdeaPageHowToCreate";
import { LatestAiTrendsSection } from "@/components/ui/shared/LatestAiTrendsSection";
import { SeoTextTagsSection } from "@/components/ui/shared/SeoTextTagsSection";
import { API_ROUTES, type PhotoSessionIdeaResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

interface IdeaPageProps { params: Promise<{ slug: string }>; }
interface SeoMetaPayload { title?: string; description?: string; canonical?: string; ogTitle?: string; ogDescription?: string; ogImage?: string; jsonLd?: unknown; }
interface IdeaPagePayload { data: PhotoSessionIdeaResponse; meta?: { seo?: SeoMetaPayload }; }

const getIdea = cache(async (slug: string): Promise<IdeaPagePayload> => {
  const response = await fetch(toServerApiUrl(API_ROUTES.PHOTO_SESSION_IDEA(slug)), { headers: { cookie: (await cookies()).toString() }, cache: "no-store" });
  if (response.status === 404 || response.status === 410) notFound();
  if (!response.ok) throw new Error("Failed to load photo session idea");
  return (await response.json()) as IdeaPagePayload;
});

export async function generateMetadata({ params }: IdeaPageProps): Promise<Metadata> {
  const payload = await getIdea((await params).slug);
  const idea = payload.data;
  const seo = payload.meta?.seo;
  return {
    title: seo?.title ?? idea.seoTitle ?? idea.h1,
    description: seo?.description ?? idea.seoDescription ?? undefined,
    alternates: seo?.canonical || idea.canonical ? { canonical: seo?.canonical ?? idea.canonical ?? undefined } : undefined,
    robots: { index: idea.robotsIndex, follow: idea.robotsFollow },
    openGraph: { title: seo?.ogTitle ?? idea.ogTitle ?? idea.seoTitle ?? idea.h1, description: seo?.ogDescription ?? idea.ogDescription ?? idea.seoDescription ?? undefined, images: seo?.ogImage || idea.ogImage ? [seo?.ogImage ?? idea.ogImage ?? ""] : undefined },
  };
}

export default async function PhotoSessionIdeaPage({ params }: IdeaPageProps) {
  const payload = await getIdea((await params).slug);
  const idea = payload.data;
  const content = idea.content;
  const trends = idea.trends ?? [];
  const moreIdeas = (idea.moreIdeas ?? []).slice(0, 4);
  const faqJsonLd = payload.meta?.seo?.jsonLd;
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101010] text-white">
        <IdeaPageHeader />
        <main className="mx-auto w-full max-w-[1920px] pb-16 pt-[116px] md:pt-[160px]">
        {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} /> : null}
        <HeroSection title={idea.h1} hero={content.hero} mainImage={idea.mainImage} breadcrumbs={<Breadcrumbs back={{ label: "Все идеи", href: "/ideas/" }} items={[{ label: "Главная", href: "/" }, { label: "Идеи фотосессий", href: "/ideas/" }, { label: idea.h1 }]} />} />
        <IdeaPageHowToCreate howToCreate={content.howToCreate} />
        <LatestAiTrendsSection trendsContent={content.trends} trends={trends} />
        <StatsSection />
        <MoreIdeasSection moreIdeasContent={content.moreIdeas} items={moreIdeas} />
        <FaqSection title={content.faq.title} items={content.faq.items} />
        <BottomCtaSection bottomCta={content.bottomCta} />
          <SeoTextTagsSection seoText={content.seoText} target="ideas" />
        </main>
        <FooterSection activeSection="ideas" />
    </div>
  );
}
