import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ContentImage } from "@/components/ui/shared/ContentImage";
import { BlogCalloutVariant, type BlogArticleContent, type BlogArticleBlock } from "@/lib/api/contract";

function calloutClass(variant: BlogCalloutVariant): string {
  if (variant === BlogCalloutVariant.SUCCESS) {
    return "border-l-blog-callout-success-accent bg-blog-callout-success-surface";
  }

  if (variant === BlogCalloutVariant.DANGER) {
    return "border-l-blog-callout-danger-accent bg-blog-callout-danger-surface";
  }

  return "border-l-blog-callout-neutral-border bg-blog-callout-neutral-surface";
}

function normalizeHref(rawHref: string): string | null {
  const href = rawHref.trim();

  if (!href) {
    return null;
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return href;
  }

  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    return href;
  }

  return null;
}

function parseInlineLinks(text: string): ReactNode[] {
  const anchorRegex = /<a\s+([^>]*?)href=(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let index = 0;
  let match: RegExpExecArray | null = anchorRegex.exec(text);

  while (match) {
    const full = match[0];
    const href = normalizeHref(match[2] ?? match[3] ?? match[4] ?? "");
    const label = match[5] ?? "";
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (!href) {
      nodes.push(full);
    } else {
      const isExternal = /^https?:\/\//i.test(href);
      nodes.push(
        <a
          key={`inline-link-${index}`}
          href={href}
          className="text-secondary hover:underline"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {label}
        </a>,
      );
    }

    lastIndex = start + full.length;
    index += 1;
    match = anchorRegex.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderHeading(level: number, text: string, key: string, className: string): ReactElement {
  switch (level) {
    case 1:
      return <h1 key={key} className={`text-[40px] font-medium leading-[44px] tracking-[-0.02em] ${className} md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]`}>{parseInlineLinks(text)}</h1>;
    case 2:
      return <h2 key={key} className={`text-[32px] font-medium leading-9 tracking-[-0.02em] ${className} md:text-[40px] md:leading-[44px]`}>{parseInlineLinks(text)}</h2>;
    case 3:
      return <h3 key={key} className={`text-[24px] font-medium leading-[30px] tracking-[-0.02em] ${className} md:text-[32px] md:leading-9`}>{parseInlineLinks(text)}</h3>;
    case 4:
      return <h4 key={key} className={`text-lg font-medium leading-6 ${className}`}>{parseInlineLinks(text)}</h4>;
    case 5:
      return <h5 key={key} className={`text-base font-medium leading-6 ${className}`}>{parseInlineLinks(text)}</h5>;
    default:
      return <h6 key={key} className={`text-sm font-medium leading-5 ${className}`}>{parseInlineLinks(text)}</h6>;
  }
}

function renderBlock(
  block: BlogArticleBlock,
  index: number,
  withoutTopMargin = false,
  compactHeading = false,
): ReactElement | null {
  const key = `${block.type}-${index}`;

  if (block.type === "heading") {
    const headingClass = [
      index > 0 && !withoutTopMargin ? "mt-6" : null,
      compactHeading ? "text-[16px] leading-[18px]" : null,
      "text-foreground",
    ]
      .filter(Boolean)
      .join(" ");
    return renderHeading(block.level, block.text, key, headingClass);
  }

  if (block.type === "paragraph") {
    return (
      <p key={key} className="w-full text-[14px] leading-5 text-foreground md:max-w-[862px] md:text-base md:leading-6">
        {parseInlineLinks(block.text)}
      </p>
    );
  }

  if (block.type === "list") {
    const isOrdered = block.style === "ordered";
    const variant = block.variant ?? "default";
    const ListTag = isOrdered ? "ol" : "ul";
    const listClassName = "flex list-none flex-col gap-4 text-sm leading-5 text-foreground md:text-base md:leading-6";

    return (
      <ListTag key={key} className={listClassName}>
        {block.items.map((item, itemIndex) => (
          <li key={`${key}-${itemIndex}`} className="flex items-start gap-2">
            {isOrdered ? (
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/8 text-xs leading-[18px] text-foreground/64"
                aria-hidden="true"
              >
                {itemIndex + 1}
              </span>
            ) : variant === "default" ? (
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <span className="h-2 w-2 rounded-[2px] bg-foreground/30" />
              </span>
            ) : variant === "positive" ? (
              <Image
                src="/icons/blog/plus.svg"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
                className="shrink-0"
              />
            ) : (
              <Image
                src="/icons/blog/minus.svg"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
                className="shrink-0"
              />
            )}
            <span className="min-w-0 flex-1">{parseInlineLinks(item)}</span>
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote
        key={key}
        className="flex min-h-[192px] w-full items-start gap-6 rounded-lg bg-pricing-panel p-4 text-foreground backdrop-blur-[5px] md:min-h-[144px] md:p-9"
      >
        <Image
          src="/icons/blog/Citate.svg"
          alt=""
          width={36}
          height={36}
          aria-hidden="true"
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center self-stretch">
          <p className="text-[14px] font-normal leading-5 md:text-base md:leading-6">{parseInlineLinks(block.text)}</p>
          {block.author ? <footer className="mt-2 text-sm text-foreground-muted">— {parseInlineLinks(block.author)}</footer> : null}
        </div>
      </blockquote>
    );
  }

  if (block.type === "link") {
    return (
      <p key={key}>
        <Link href={block.href} className="text-secondary hover:underline">
          {block.text}
        </Link>
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <figure key={key} className="space-y-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] md:rounded-[36px]">
          <ContentImage src={block.url} variants={block.variants} alt={block.alt || ""} sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
        </div>
      </figure>
    );
  }

  if (block.type === "callout") {
    return (
      <div
        key={key}
        className={`flex min-h-[128px] w-full items-center rounded-[16px] border-l-2 px-6 py-6 text-[14px] leading-5 text-foreground backdrop-blur-[5px] md:h-[96px] md:min-h-0 md:text-base md:leading-6 ${calloutClass(block.variant)}`}
      >
        {block.text}
      </div>
    );
  }

  if (block.type === "figure") {
    return (
      <figure key={key} className="space-y-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[12px] md:rounded-[36px]">
          <ContentImage src={block.url} variants={block.variants} alt={block.alt || ""} sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
        </div>
        <figcaption className="flex items-center text-[12px] font-normal leading-[18px] text-white/30">
          {parseInlineLinks(block.caption)}
        </figcaption>
      </figure>
    );
  }

  return null;
}

export function BlogContentRenderer({ content }: { content: BlogArticleContent }) {
  const renderedBlocks: ReactElement[] = [];

  for (let index = 0; index < content.blocks.length; index += 1) {
    const block = content.blocks[index];
    const nextBlocks = content.blocks.slice(index + 1, index + 4);
    const isCalloutSection =
      block.type === "heading" &&
      block.level === 3 &&
      nextBlocks.length === 3 &&
      nextBlocks.every((nextBlock) => nextBlock.type === "callout");

    if (isCalloutSection) {
      renderedBlocks.push(
        <div key={`callout-section-${index}`} className="space-y-4">
          {renderBlock(block, index, true)}
          {nextBlocks.map((nextBlock, offset) => renderBlock(nextBlock, index + offset + 1))}
        </div>,
      );
      index += 3;
      continue;
    }

    const isFigureSection =
      block.type === "heading" &&
      block.level === 3 &&
      content.blocks[index + 1]?.type === "figure";

    if (isFigureSection) {
      renderedBlocks.push(
        <div key={`figure-section-${index}`} className="space-y-4">
          {renderBlock(block, index, true, true)}
          {renderBlock(content.blocks[index + 1], index + 1)}
        </div>,
      );
      index += 1;
      continue;
    }

    const renderedBlock = renderBlock(block, index);
    if (renderedBlock) {
      renderedBlocks.push(renderedBlock);
    }
  }

  return <div className="space-y-6">{renderedBlocks}</div>;
}
