import type { Metadata } from 'next';
import { safeJsonLd } from "@/lib/safe-json-ld";
import { cookies } from 'next/headers';
import { ResponsiveImage } from '@/components/ui/shared/ResponsiveImage';
import Link from 'next/link';
import { FooterSection } from '@/components/main/Footer';
import { RichHtmlContent } from '@/components/ui/shared/RichHtmlContent';
import { IdeaPageHeader } from '@/components/ideas/IdeaPageHeader';
import {
  API_ROUTES,
  type PublicIdeasListResponse,
} from '@/lib/api/contract';
import { toServerApiUrl } from '@/lib/api/server';

export const dynamic = 'force-dynamic';

interface IdeasHubPageProps {
  searchParams: Promise<{ search?: string }>;
}

async function getIdeasPayload(search?: string): Promise<PublicIdeasListResponse> {
  const query = new URLSearchParams();
  const normalizedSearch = search?.trim();
  if (normalizedSearch) query.set('search', normalizedSearch);

  const apiPath = query.toString()
    ? `${API_ROUTES.PHOTO_SESSION_IDEAS}?${query.toString()}`
    : API_ROUTES.PHOTO_SESSION_IDEAS;
  const response = await fetch(toServerApiUrl(apiPath), {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load ideas list');
  }

  return (await response.json()) as PublicIdeasListResponse;
}

export async function generateMetadata({ searchParams }: IdeasHubPageProps): Promise<Metadata> {
  const { search } = await searchParams;
  const payload = await getIdeasPayload(search);
  const seo = payload.meta.seo;
  return {
    title: seo.title || undefined,
    description: seo.description || undefined,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.ogTitle ?? seo.title ?? undefined,
      description: seo.ogDescription ?? seo.description ?? undefined,
      url: seo.ogUrl ?? undefined,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function PhotoSessionIdeasHubPage({ searchParams }: IdeasHubPageProps) {
  const { search } = await searchParams;
  const payload = await getIdeasPayload(search);
  const ideas = payload.data;
  const page = payload.meta.pageSettings;
  const jsonLd = payload.meta.seo.jsonLd;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101010] text-white">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-32 sm:px-6 md:px-10 md:pt-40">
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} /> : null}
        {page.h1 ? <h1 className="text-center text-3xl font-medium tracking-tight text-white/90 md:text-5xl">{page.h1}</h1> : null}
        {page.description ? <RichHtmlContent html={page.description} className="mt-4 w-full text-center text-base text-white/65 md:text-lg" /> : null}

        <div className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-3 lg:grid-cols-4">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href={idea.href}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
            >
              {idea.image ? (
                <ResponsiveImage
                  src={idea.image}
                  variants={idea.imageVariants}
                  alt={idea.title}
                  sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-surface" />
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-sm text-white transition-colors group-hover:text-white/70">
                {idea.title}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <FooterSection activeSection="ideas" />
    </div>
  );
}
