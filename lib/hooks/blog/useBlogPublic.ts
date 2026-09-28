import { apiGet, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type BlogArticleResponse,
  type PublicBlogListResponse,
  type RateBlogArticleResponse,
} from "@/lib/api/contract";

export function getPublicBlogList(page: number): Promise<PublicBlogListResponse> {
  return apiGet<PublicBlogListResponse>(API_ROUTES.BLOG, { page });
}

export function getPublicBlogArticle(slug: string): Promise<{
  data: BlogArticleResponse;
  meta?: { seo?: Record<string, unknown> };
}> {
  return apiGet(API_ROUTES.BLOG_BY_SLUG(slug));
}

export function rateBlogArticle(slug: string, value: number): Promise<RateBlogArticleResponse> {
  return apiPost<RateBlogArticleResponse>(API_ROUTES.BLOG_RATE(slug), { value });
}
