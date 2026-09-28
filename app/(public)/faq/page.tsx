import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { RichHtmlContent } from "@/components/ui/shared/RichHtmlContent";
import { API_ROUTES, type FaqCmsPageResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

interface FaqPayload {
  data: FaqCmsPageResponse;
  meta: {
    seo: {
      title?: string;
      description?: string;
      canonical?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      jsonLd?: unknown;
    };
  };
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

const getFaq = cache(async (): Promise<FaqPayload> => {
  const response = await fetch(toServerApiUrl(API_ROUTES.CMS_PAGE("faq")), {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 410) {
    notFound();
  }
  if (!response.ok) {
    throw new Error("Failed to load FAQ page");
  }
  return (await response.json()) as FaqPayload;
});

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getFaq();
  const seo = payload.meta.seo;
  return {
    title: seo.title ?? payload.data.h1,
    description: seo.description ?? payload.data.content.description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.ogTitle ?? seo.title ?? payload.data.h1,
      description:
        seo.ogDescription ?? seo.description ?? payload.data.content.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function FaqPage() {
  const payload = await getFaq();
  const page = payload.data;

  return (
    <div className="min-h-screen overflow-x-hidden bg-page-shell text-foreground">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1920px] pb-16 pt-[116px] md:pt-[160px]">
        {payload.meta.seo.jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(payload.meta.seo.jsonLd) }}
          />
        ) : null}
        <section className="relative isolate mx-auto w-full overflow-hidden rounded-t-[24px] bg-page-surface px-4 pb-8 pt-6 md:rounded-[60px] md:px-16 md:pb-16 md:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[calc(50%-247.5px)] top-[-60px] z-0 h-40 w-40 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[50px] md:-left-60 md:-top-56 md:h-[480px] md:w-[480px] md:blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[calc(50%-1200px)] top-[calc(50%-1585.5px)] z-0 hidden h-[480px] w-[480px] rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[100px] md:block"
          />
          <div className="relative z-10 mx-auto max-w-[1792px]">
            <nav
              aria-label="Хлебные крошки"
              className="flex items-center gap-4 text-xs font-normal leading-[18px] text-pricing-foreground"
            >
              <span>Главная</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
              <span>Часто задаваемые вопросы</span>
            </nav>
            <div className="mt-6 flex flex-col gap-6 md:mt-9 md:gap-9">
              <h1 className="max-w-full text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pricing-foreground md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">
                {page.h1}
              </h1>
              <RichHtmlContent
                html={page.content.description}
                className="w-full text-sm font-normal leading-5 text-white/70 md:text-xl md:font-medium md:leading-7 md:text-pricing-foreground"
              />
            </div>
            <div className="mt-8 md:mt-16">
              <FaqAccordion items={page.content.items} />
            </div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
