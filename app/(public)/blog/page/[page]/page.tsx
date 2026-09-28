import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ResponsiveImage } from "@/components/ui/shared/ResponsiveImage";
import Link from "next/link";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { RichHtmlContent } from "@/components/ui/shared/RichHtmlContent";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { API_ROUTES, type PublicBlogListResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

interface BlogPaginatedPageProps {
  params: Promise<{ page: string }>;
}

export const dynamic = "force-dynamic";

async function getBlogPage(page: number): Promise<PublicBlogListResponse> {
  const response = await fetch(toServerApiUrl(API_ROUTES.BLOG) + `?page=${page}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load blog list");
  }

  return response.json() as Promise<PublicBlogListResponse>;
}

export async function generateMetadata({ params }: BlogPaginatedPageProps): Promise<Metadata> {
  const page = Math.max(2, Number((await params).page) || 2);
  const payload = await getBlogPage(page);
  const hub = payload.meta.hub;

  return {
    title: hub.seoTitle ?? hub.h1,
    description: hub.seoDescription ?? hub.subtitle,
    alternates: {
      canonical: `/blog/page/${page}/`,
    },
    robots: { index: hub.robotsIndex, follow: hub.robotsFollow },
    openGraph: {
      title: hub.ogTitle ?? hub.seoTitle ?? hub.h1,
      description: hub.ogDescription ?? hub.seoDescription ?? hub.subtitle,
      images: hub.ogImage ? [hub.ogImage] : undefined,
    },
  };
}

export default async function BlogPaginatedPage({ params }: BlogPaginatedPageProps) {
  const page = Number((await params).page);

  if (!Number.isFinite(page) || page < 2) {
    notFound();
  }

  const payload = await getBlogPage(page);
  const hub = payload.meta.hub;

  if (payload.meta.totalPages > 0 && page > payload.meta.totalPages) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-page-shell text-foreground">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-[1920px] pb-16 pt-[116px] md:pt-[160px]">
        <section className="relative isolate mx-auto flex w-full flex-col gap-9 overflow-hidden rounded-t-[24px] bg-page-surface px-4 pb-8 pt-6 md:gap-16 md:rounded-[60px] md:px-16 md:pb-16 md:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-20 z-0 h-40 w-40 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[50px] md:-left-60 md:-top-40 md:h-[480px] md:w-[480px] md:blur-[100px]"
          />

          <div className="relative z-10 flex w-full flex-col items-start gap-6 md:gap-9">
            <nav className="flex items-center gap-6 text-xs leading-[18px] text-white/80" aria-label="Хлебные крошки">
              <Link href="/" className="transition-colors hover:text-foreground">Главная</Link>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
              <span>Блог</span>
            </nav>

            <div className="flex w-full flex-col items-start gap-6 md:gap-9">
              <h1 className="w-full text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-white/80 md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">{hub.h1}</h1>
              <RichHtmlContent html={hub.subtitle} className="text-[14px] font-normal leading-5 text-white/70 md:text-[20px] md:leading-7" />
            </div>
          </div>

          <div className="relative z-10 grid w-full grid-cols-2 gap-x-2 gap-y-9 md:grid-cols-4 md:gap-x-6 md:gap-y-9">
            {payload.data.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}/`} className="group block min-w-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface md:rounded-[36px]">
                  {item.image ? (
                    <ResponsiveImage
                      src={item.image}
                      variants={item.imageVariants}
                      alt={item.title}
                      sizes="(max-width: 767px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-[12px] font-normal leading-[18px] text-white/30 md:text-[20px] md:font-medium md:leading-7">
                  {new Date(item.publishedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="mt-2 text-[16px] font-medium leading-6 text-white/80 transition-colors group-hover:text-foreground md:text-[24px] md:leading-[30px]">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>

          <BlogPagination currentPage={payload.meta.page} totalPages={payload.meta.totalPages} />
        </section>
      </main>
      <FooterSection activeSection="blog" />
    </div>
  );
}
