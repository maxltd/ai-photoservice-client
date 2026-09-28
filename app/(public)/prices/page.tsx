import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { PricingCards } from "@/components/pricing/PricingCards";
import { FooterSection } from "@/components/main/Footer";
import {
  API_ROUTES,
  type PricingPageResponse,
  type PricingPageSeoMeta,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

export const dynamic = "force-dynamic";

interface PricingApiResponse {
  data: PricingPageResponse;
  meta: { seo: PricingPageSeoMeta };
}

async function getPricingPage(): Promise<PricingApiResponse> {
  const response = await fetch(toServerApiUrl(API_ROUTES.PRICING_PAGE), {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to load pricing page");
  return response.json() as Promise<PricingApiResponse>;
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPricingPage();
  const seo = payload.meta.seo;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical ?? "/prices/" },
    robots: { index: payload.data.settings.robotsIndex, follow: payload.data.settings.robotsFollow },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function PricesPage() {
  const payload = await getPricingPage();
  const { settings, plans } = payload.data;
  return (
    <div className="min-h-screen overflow-x-hidden bg-page-shell text-foreground">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1920px] pb-16 pt-[116px] md:pt-[160px]">
        <section className="relative mx-auto w-full overflow-hidden rounded-t-[24px] bg-page-surface px-4 pb-16 pt-6 sm:px-6 md:rounded-[60px] md:px-16 md:py-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8 z-0 overflow-hidden">
            <div className="absolute -left-8 -top-12 h-40 w-40 rounded-2xl bg-[image:var(--gradient-pricing-glow)] opacity-60 blur-[50px] md:-left-60 md:-top-56 md:h-[480px] md:w-[480px] md:blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-[1792px]">
            <nav aria-label="Хлебные крошки" className="flex items-center gap-6 text-xs leading-[18px] text-pricing-foreground">
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:text-foreground">Главная</Link>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
                <span>Цены</span>
              </div>
            </nav>
            <header className="mt-9 space-y-6 md:space-y-9">
              <h1 className="text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pricing-foreground md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">{settings.h1}</h1>
              <p className="max-w-[743px] text-sm font-normal leading-5 text-pricing-muted md:text-xl md:font-medium md:leading-7 md:text-pricing-foreground">{settings.description}</p>
            </header>
            <div className="mt-8 md:mt-16">
              <PricingCards plans={plans} />
            </div>
          </div>
        </section>
      </main>
      <FooterSection activeSection="prices" />
    </div>
  );
}
