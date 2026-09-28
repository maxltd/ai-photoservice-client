import Link from "next/link";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

function buildPages(currentPage: number, totalPages: number): Array<number | "dots"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "dots"> = [1];

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("dots");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("dots");
  }

  pages.push(totalPages);
  return pages;
}

function toBlogPageHref(page: number): string {
  if (page <= 1) {
    return "/blog/";
  }

  return `/blog/page/${page}/`;
}

export function BlogPagination({ currentPage, totalPages }: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <nav aria-label="Пагинация блога" className="flex items-center justify-center gap-2 pt-2 md:pt-0">
      <Link
        href={toBlogPageHref(Math.max(1, currentPage - 1))}
        aria-label="Предыдущая страница"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-base text-white/80 transition-colors ${
          currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:border-white/30 hover:text-foreground"
        }`}
      >
        ‹
      </Link>

      {pages.map((item, index) =>
        item === "dots" ? (
          <span key={`dots-${index}`} className="px-1 text-sm text-foreground-muted">
            ...
          </span>
        ) : (
          <Link
            key={item}
            href={toBlogPageHref(item)}
            aria-current={item === currentPage ? "page" : undefined}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors ${
              item === currentPage
                ? "border-white/20 bg-white/10 text-foreground"
                : "border-white/10 text-white/80 hover:border-white/30 hover:text-foreground"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={toBlogPageHref(Math.min(totalPages, currentPage + 1))}
        aria-label="Следующая страница"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-base text-white/80 transition-colors ${
          currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:border-white/30 hover:text-foreground"
        }`}
      >
        ›
      </Link>
    </nav>
  );
}
