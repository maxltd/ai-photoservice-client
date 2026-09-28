import type { Metadata } from "next";
import { safeJsonLd } from "@/lib/safe-json-ld";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ResponsiveImage } from "@/components/ui/shared/ResponsiveImage";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { BlogRating } from "@/components/blog/BlogRating";
import { Button } from "@/components/ui/button";
import { API_ROUTES, type BlogArticleResponse } from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";

function formatPublishedDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

interface BlogArticlePayload {
  data: BlogArticleResponse;
  meta?: { seo?: Record<string, unknown> };
}

const seoValue = (payload: BlogArticlePayload, key: string): string | undefined => {
  const value = payload.meta?.seo?.[key];
  return typeof value === "string" ? value : undefined;
};

async function getBlogArticle(slug: string): Promise<BlogArticlePayload> {
  const response = await fetch(toServerApiUrl(API_ROUTES.BLOG_BY_SLUG(slug)), {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 410) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to load blog article");
  }

  return response.json() as Promise<BlogArticlePayload>;
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const payload = await getBlogArticle((await params).slug);
  const article = payload.data;

  return {
    title: seoValue(payload, "title") ?? article.seoTitle ?? article.h1,
    description: seoValue(payload, "description") ?? article.seoDescription ?? undefined,
    alternates: {
      canonical: seoValue(payload, "canonical") ?? article.canonical ?? `/blog/${article.slug}/`,
    },
    robots: { index: article.robotsIndex, follow: article.robotsFollow },
    openGraph: {
      title: seoValue(payload, "ogTitle") ?? article.ogTitle ?? article.seoTitle ?? article.h1,
      description:
        seoValue(payload, "ogDescription") ?? article.ogDescription ?? article.seoDescription ?? undefined,
      images: (seoValue(payload, "ogImage") ?? article.ogImage) ? [seoValue(payload, "ogImage") ?? article.ogImage ?? ""] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const payload = await getBlogArticle((await params).slug);
  const article = payload.data;
  const jsonLd = payload.meta?.seo?.jsonLd;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101010] text-white">
      <IdeaPageHeader />

      <main className="mx-auto w-full max-w-[916px] px-4 pb-16 pt-32 md:pt-40">
        {jsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
        ) : null}

        <nav className="mb-6 flex min-w-0 items-center gap-4 text-xs leading-[18px] text-white/80" aria-label="Хлебные крошки">
          <Link href="/" className="shrink-0 hover:text-white">Главная</Link>
          <span className="h-1 w-1 shrink-0 rounded-full bg-white/30" aria-hidden="true" />
          <Link href="/blog/" className="shrink-0 hover:text-white">Блог</Link>
          <span className="h-1 w-1 shrink-0 rounded-full bg-white/30" aria-hidden="true" />
          <span className="min-w-0 truncate">{article.h1}</span>
        </nav>

        <h1 className="text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">{article.h1}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-base leading-6 text-white/30 md:text-xl md:leading-7">
          <span>{formatPublishedDate(article.publishedAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readingTimeMinutes ?? 0} мин чтения</span>
          <span aria-hidden="true">·</span>
          <span>{article.viewsCount} просмотров</span>
        </div>

        {article.mainImage ? (
          <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[12px] md:rounded-[36px]">
            <ResponsiveImage
              src={article.mainImage}
              variants={article.mainImageVariants}
              alt={article.h1}
              priority
              sizes="(max-width: 1200px) 100vw, 1000px"
              className="object-cover"
            />
          </div>
        ) : null}

        <article className="mx-auto mt-12 w-full max-w-[884px]">
          <BlogContentRenderer content={article.content} />
        </article>

        <div className="mt-10 flex flex-col items-center gap-4 pt-2">
          <BlogRating slug={article.slug} initialRating={article.rating} />
          <Button
            asChild
            variant="outline"
            className="h-11 w-full shrink-0 gap-2 whitespace-nowrap rounded-full border-white/30 p-3 text-sm font-bold text-white hover:bg-white/8 hover:text-white md:w-[165px] md:self-start"
          >
            <Link href="/blog/">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              К списку статей
            </Link>
          </Button>
        </div>

        {article.readMore.length > 0 ? (
          <section className="mt-10 border-t border-border pt-8">
            <p className="text-2xl font-medium leading-[30px] tracking-[-0.02em] md:text-[32px] md:font-bold md:leading-[44px] md:tracking-normal">
              Читайте ещё
            </p>
            <div className="mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-4 md:overflow-visible">
              <div className="flex w-max gap-[25px] md:grid md:w-auto md:grid-cols-3 md:gap-x-4 md:gap-y-6">
                {article.readMore.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}/`}
                    className="group flex w-[280px] shrink-0 flex-col gap-2 md:w-auto md:shrink"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface md:rounded-[36px]">
                      {item.image ? (
                        <ResponsiveImage
                          src={item.image}
                          variants={item.imageVariants}
                          alt={item.title}
                          sizes="(max-width: 767px) 280px, 33vw"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 md:gap-2">
                      <p className="text-xs font-normal leading-[18px] text-white/30 md:text-[20px] md:font-medium md:leading-7">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </p>
                      <p className="text-base font-medium leading-6 tracking-normal text-white/80 group-hover:text-white md:text-[24px] md:leading-[30px] md:tracking-[-0.02em]">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <FooterSection activeSection="blog" />
    </div>
  );
}
