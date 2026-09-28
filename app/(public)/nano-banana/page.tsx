import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { ResponsiveImage } from '@/components/ui/shared/ResponsiveImage';
import Link from "next/link";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { RichHtmlContent } from "@/components/ui/shared/RichHtmlContent";
import {
  API_ROUTES,
  type NanoBananaPublicHubResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

const getHub = cache(async (): Promise<NanoBananaPublicHubResponse> => {
  const response = await fetch(toServerApiUrl(API_ROUTES.NANO_BANANA), {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to load Nano Banana hub");
  return (await response.json()) as NanoBananaPublicHubResponse;
});

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getHub();
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

export default async function NanoBananaHubPage() {
  const payload = await getHub();
  const hub = payload.data;
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-28 sm:px-8 md:px-10 md:pt-36">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="mt-5 text-4xl font-medium tracking-[-0.05em] md:text-6xl">
            {hub.h1}
          </h1>
          <RichHtmlContent
            html={hub.description}
            className="mt-6 w-full text-base leading-7 text-white/65 md:text-xl"
          />
        </section>
        {hub.pages.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4">
            {hub.pages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className="group flex flex-col gap-3 rounded-[24px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-border bg-surface md:rounded-[32px]">
                  <ResponsiveImage
                    src={page.mainImage.url}
                    variants={page.mainImage.variants}
                    alt={page.mainImage.alt}
                    sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="line-clamp-2 text-base text-foreground transition-colors group-hover:text-secondary md:text-lg">
                  {page.h1}
                </h2>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-14 max-w-md text-center text-white/60">
            Новые страницы Nano Banana скоро появятся.
          </p>
        )}
        <div className="mx-auto mt-16 max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
          <h2 className="text-2xl font-medium md:text-3xl">{hub.ctaTitle}</h2>
          <RichHtmlContent html={hub.ctaDescription} className="mt-3 text-white/65" />
          <Link
            href={hub.ctaHref}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {hub.ctaText}
          </Link>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
