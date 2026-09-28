import type { BlogArticleListItem } from "@/lib/api/contract";
import { ExperienceCarousel } from "@/components/main/ExperienceCarousel";

interface AiToolRelatedArticlesProps {
  title: string;
  articles: BlogArticleListItem[];
}

export function AiToolRelatedArticles({
  title,
  articles,
}: AiToolRelatedArticlesProps): React.JSX.Element | null {
  if (articles.length === 0) return null;

  return (
    <section className="relative flex w-full flex-col items-center gap-9 overflow-hidden bg-page-surface px-4 py-16 md:gap-[60px] md:px-16 md:pb-0 md:pt-[144px]">
      <h2 className="relative z-10 w-full max-w-[343px] text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-foreground/80 md:max-w-[884px] md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">
        {title}
      </h2>
      <div className="relative z-10 w-full max-w-[1792px]">
        <ExperienceCarousel articles={articles} />
      </div>
    </section>
  );
}
