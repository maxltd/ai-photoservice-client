import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  back?: {
    label: string;
    href: string;
  };
}

export function Breadcrumbs({ items, back }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="mb-6 flex flex-nowrap items-center gap-6 overflow-hidden text-xs text-white/80 md:mb-10 md:flex-wrap md:overflow-visible md:text-sm"
    >
      {back ? (
        <Link
          href={back.href}
          className="flex h-11 w-[116px] shrink-0 items-center justify-center gap-2 rounded-full border border-white/30 px-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          <ChevronLeft
            className="h-5 w-5 shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{back.label}</span>
        </Link>
      ) : null}
      <div className="flex min-w-0 shrink items-center gap-4 overflow-hidden whitespace-nowrap md:flex-wrap md:overflow-visible md:whitespace-normal">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <span className="h-1 w-1 shrink-0 rounded-full bg-white/30" /> : null}
            {item.href ? (
              <Link href={item.href} className="shrink-0 whitespace-nowrap transition-colors hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="min-w-0 truncate text-white">{item.label}</span>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
