import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { IdeaPageHeader } from "@/components/ideas/IdeaPageHeader";
import { FooterSection } from "@/components/main/Footer";
import { API_ROUTES, type CmsPageResponse } from "@/lib/api/contract";
import { markdownToHtml, getMarkdownContent } from "@/lib/markdown";
import { sanitizeHtml } from "@/lib/sanitize-html";

export interface LegalPagePayload {
  data: CmsPageResponse;
  meta?: { seo?: { title?: string; description?: string } };
}

export async function getLegalPage(slug: string): Promise<LegalPagePayload> {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.CMS_PAGE(slug)}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 404 || response.status === 410) notFound();
  if (!response.ok) throw new Error("Failed to load legal page");
  return (await response.json()) as LegalPagePayload;
}

export async function legalMetadata(slug: string): Promise<Metadata> {
  const payload = await getLegalPage(slug);
  const seo = payload.meta?.seo;
  return {
    title: seo?.title ?? payload.data.seoTitle ?? payload.data.title,
    description: seo?.description ?? payload.data.seoDescription ?? undefined,
    robots: { index: false, follow: false },
  };
}

export async function LegalPage({ slug }: { slug: string }) {
  const payload = await getLegalPage(slug);
  const page = payload.data;
  const markdown = getMarkdownContent(page.content);
  return (
    <div className="min-h-screen overflow-x-hidden bg-page-shell text-foreground">
      <IdeaPageHeader />
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-29 text-foreground md:px-8 md:pb-24 md:pt-40">
        <article>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{page.h1}</h1>
          <div
            className="legal-prose mt-10"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(markdownToHtml(markdown)) }}
          />
        </article>
      </main>
      <FooterSection />
    </div>
  );
}
