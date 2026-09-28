import type { Metadata } from "next";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { AiToolsHero } from "@/components/ai-tools/AiToolsHero";
import { AiToolsGroup } from "@/components/ai-tools/AiToolsGroup";
import { AiToolsSeoText } from "@/components/ai-tools/AiToolsSeoText";
import { API_ROUTES, type AiToolsPublicResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

const getHub = cache(async (): Promise<AiToolsPublicResponse> => {
  const response = await fetch(toServerApiUrl(API_ROUTES.AI_TOOLS), {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 404 || response.status === 410) notFound();
  if (!response.ok) throw new Error("Failed to load AI tools hub");
  return (await response.json()) as AiToolsPublicResponse;
});

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getHub();
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

export default async function AiToolsPage() {
  const payload = await getHub();
  const { settings, tools } = payload.data;
  return (
    <div className="min-h-screen overflow-x-hidden bg-page-shell text-foreground">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1920px] pb-16 pt-[116px] md:pt-[160px]">
        <section className="relative isolate mx-auto w-full overflow-hidden rounded-t-[24px] bg-page-surface px-4 pb-8 pt-6 md:rounded-[60px] md:px-16 md:pb-16 md:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[calc(50%-247.5px)] top-[-60px] z-0 h-40 w-40 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[50px] md:-left-60 md:-top-56 md:h-[480px] md:w-[480px] md:blur-[100px]"
          />
          <div className="relative z-10 mx-auto max-w-[1792px]">
            <AiToolsHero h1={settings.h1} description={settings.description} />
            <div className="mt-6 rounded-[16px] bg-white/[0.08] p-4 md:mt-9 md:rounded-[36px] md:p-9">
              <AiToolsGroup tools={tools} />
            </div>
            {tools.length === 0 ? (
              <p className="mt-4 rounded-[16px] border border-border bg-surface p-8 text-center text-foreground-muted">
                Инструменты скоро появятся.
              </p>
            ) : null}
            <div className="mt-16">
              <AiToolsSeoText sections={settings.seoSections} />
            </div>
          </div>
        </section>
      </main>
      <FooterSection activeSection="ai-tools" />
    </div>
  );
}
