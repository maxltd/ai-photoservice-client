import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { notFound } from "next/navigation";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { NanoBananaAudience } from "@/components/nano-banana/NanoBananaAudience";
import { BottomCtaSection } from "@/components/ui/shared/BottomCtaSection";
import { NanoBananaEditor } from "@/components/nano-banana/NanoBananaEditor";
import { NanoBananaExamples } from "@/components/nano-banana/NanoBananaExamples";
import { FaqSection } from "@/components/faq/FaqSection";
import { NanoBananaFeaturesCarousel } from "@/components/nano-banana/NanoBananaFeaturesCarousel";
import { NanoBananaHero } from "@/components/nano-banana/NanoBananaHero";
import { NanoBananaHowItWorks } from "@/components/nano-banana/NanoBananaHowItWorks";
import { NanoBananaRealism } from "@/components/nano-banana/NanoBananaRealism";
import { NanoBananaSeoText } from "@/components/nano-banana/NanoBananaSeoText";
import {
  API_ROUTES,
  type NanoBananaPublicPageResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

const getPage = cache(
  async (slug: string): Promise<NanoBananaPublicPageResponse> => {
    const response = await fetch(
      toServerApiUrl(API_ROUTES.NANO_BANANA_BY_SLUG(slug)),
      { headers: { cookie: (await cookies()).toString() }, cache: "no-store" },
    );
    if (response.status === 404 || response.status === 410) notFound();
    if (!response.ok) throw new Error("Failed to load Nano Banana page");
    return (await response.json()) as NanoBananaPublicPageResponse;
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
    robots: {
      index: payload.data.robotsIndex,
      follow: payload.data.robotsFollow,
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function NanoBananaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const payload = await getPage((await params).slug);
  const page = payload.data;
  const content = page.content;
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101010] text-white">
      <IdeaPageHeader />
      <main className="w-full pb-16 pt-[116px] md:pt-[160px]">
        {payload.meta.seo.jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJsonLd(payload.meta.seo.jsonLd),
            }}
          />
        ) : null}
        <NanoBananaHero
          hero={content.hero}
          image={page.mainImage}
          internalName={page.internalName}
        />
        <NanoBananaHowItWorks section={content.howItWorks} />
        <NanoBananaEditor section={content.editor} />
        <NanoBananaFeaturesCarousel section={content.features} />
        <NanoBananaExamples section={content.examples} />
        <NanoBananaRealism section={content.realism} />
        <NanoBananaAudience section={content.audiences} />
        <FaqSection title={content.faq.title} items={content.faq.items} />
        <BottomCtaSection
          bottomCta={{
            title: content.bottomCta.title,
            text: content.bottomCta.description,
            images: [
              content.bottomCta.images[0].url,
              content.bottomCta.images[1].url,
              content.bottomCta.images[2].url,
            ],
            button: {
              text: content.bottomCta.cta.text,
              href: content.bottomCta.cta.href,
            },
          }}
        />
        <NanoBananaSeoText section={content.seoText} />
      </main>
      <FooterSection />
    </div>
  );
}
