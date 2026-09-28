"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAutoSave, type SaveStatus } from "@/lib/hooks/useAutoSave";
import { HeadingBlock, type HeadingData } from "@/components/admin/cms/blocks/HeadingBlock";
import { ParagraphBlock } from "@/components/admin/cms/blocks/ParagraphBlock";
import { ImageBlock, type ImageData } from "@/components/admin/cms/blocks/ImageBlock";
import { ListBlock, type ListData } from "@/components/admin/cms/blocks/ListBlock";
import { QuoteBlock, type QuoteData } from "@/components/admin/cms/blocks/QuoteBlock";
import { CalloutBlock, type CalloutData } from "@/components/admin/cms/blocks/CalloutBlock";
import { FigureBlock, type FigureData } from "@/components/admin/cms/blocks/FigureBlock";
import { BlogCalloutVariant } from "@/lib/api/contract";

type BlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "list"
  | "quote"
  | "callout"
  | "figure";

interface ParagraphData {
  text: string;
}

type BlockData =
  | HeadingData
  | ParagraphData
  | ImageData
  | ListData
  | QuoteData
  | CalloutData
  | FigureData;

interface ContentBlock {
  id: string;
  type: BlockType;
  data: BlockData;
}

interface ContentEditorProps {
  entityId: string;
  initialContent: unknown;
  onSave: (content: Record<string, unknown>) => Promise<unknown>;
  onStatusChange: (status: SaveStatus) => void;
  onContentChange?: (content: Record<string, unknown>) => void;
}

function isHeading(
  block: ContentBlock,
): block is ContentBlock & { type: "heading"; data: HeadingData } {
  return block.type === "heading";
}

function isParagraph(
  block: ContentBlock,
): block is ContentBlock & { type: "paragraph"; data: ParagraphData } {
  return block.type === "paragraph";
}

function isImage(
  block: ContentBlock,
): block is ContentBlock & { type: "image"; data: ImageData } {
  return block.type === "image";
}

function isList(
  block: ContentBlock,
): block is ContentBlock & { type: "list"; data: ListData } {
  return block.type === "list";
}

function isQuote(
  block: ContentBlock,
): block is ContentBlock & { type: "quote"; data: QuoteData } {
  return block.type === "quote";
}



function isCallout(
  block: ContentBlock,
): block is ContentBlock & { type: "callout"; data: CalloutData } {
  return block.type === "callout";
}

function isFigure(
  block: ContentBlock,
): block is ContentBlock & { type: "figure"; data: FigureData } {
  return block.type === "figure";
}

function toInitialBlocks(content: unknown): ContentBlock[] {
  if (!content || typeof content !== "object") {
    return [];
  }

  const source = content as { blocks?: unknown };
  if (!Array.isArray(source.blocks)) {
    return [];
  }

  return source.blocks
    .map((item): ContentBlock | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const block = item as { id?: unknown; type?: unknown; data?: unknown };
      const blockId =
        typeof block.id === "string" && block.id.trim().length > 0
          ? block.id
          : crypto.randomUUID();

      const sourceData = item as Record<string, unknown>;
      const data =
        block.data && typeof block.data === "object"
          ? (block.data as Record<string, unknown>)
          : sourceData;

      if (block.type === "heading") {
        const numeric = Number(data.level);
        const level =
          numeric >= 1 && numeric <= 6 && Number.isInteger(numeric)
            ? (numeric as 1 | 2 | 3 | 4 | 5 | 6)
            : 2;

        return {
          id: blockId,
          type: "heading",
          data: {
            level,
            text: typeof data.text === "string" ? data.text : "",
          },
        };
      }

      if (block.type === "paragraph") {
        return {
          id: blockId,
          type: "paragraph",
          data: {
            text: typeof data.text === "string" ? data.text : "",
          },
        };
      }

      if (block.type === "image") {
        return {
          id: blockId,
          type: "image",
          data: {
            url: typeof data.url === "string" ? data.url : "",
            alt: typeof data.alt === "string" ? data.alt : "",
            title: typeof data.title === "string" ? data.title : undefined,
          },
        };
      }

      if (block.type === "list") {
        return {
          id: blockId,
          type: "list",
          data: {
            style: data.style === "ordered" ? "ordered" : "unordered",
            variant:
              data.variant === "positive" || data.variant === "negative"
                ? data.variant
                : "default",
            items: Array.isArray(data.items)
              ? data.items.filter((item): item is string => typeof item === "string")
              : [],
          },
        };
      }

      if (block.type === "quote") {
        return {
          id: blockId,
          type: "quote",
          data: {
            text: typeof data.text === "string" ? data.text : "",
            author: typeof data.author === "string" ? data.author : undefined,
          },
        };
      }

      if (block.type === "link") {
        const text = typeof data.text === "string" ? data.text.trim() : "";
        const href = typeof data.href === "string" ? data.href.trim() : "";

        return {
          id: blockId,
          type: "paragraph",
          data: {
            text:
              text && href
                ? `<a href="${href}">${text}</a>`
                : text || href,
          },
        };
      }


      if (block.type === "callout") {
        return {
          id: blockId,
          type: "callout",
          data: {
            variant:
              data.variant === BlogCalloutVariant.SUCCESS
                ? BlogCalloutVariant.SUCCESS
                : data.variant === BlogCalloutVariant.DANGER
                  ? BlogCalloutVariant.DANGER
                  : BlogCalloutVariant.ACCENT,
            text: typeof data.text === "string" ? data.text : "",
          },
        };
      }

      if (block.type === "figure") {
        return {
          id: blockId,
          type: "figure",
          data: {
            url: typeof data.url === "string" ? data.url : "",
            alt: typeof data.alt === "string" ? data.alt : "",
            title: typeof data.title === "string" ? data.title : undefined,
            caption: typeof data.caption === "string" ? data.caption : "",
            showInImageSitemap:
              typeof data.showInImageSitemap === "boolean"
                ? data.showInImageSitemap
                : true,
          },
        };
      }

      return null;
    })
    .filter((item): item is ContentBlock => item !== null);
}

function defaultBlockData(type: BlockType): BlockData {
  if (type === "heading") {
    return { level: 2, text: "" };
  }

  if (type === "paragraph") {
    return { text: "" };
  }

  if (type === "image") {
    return { url: "", alt: "", title: undefined };
  }

  if (type === "list") {
    return { style: "unordered", variant: "default", items: [] };
  }

  if (type === "quote") {
    return { text: "", author: undefined };
  }

  if (type === "callout") {
    return { variant: BlogCalloutVariant.ACCENT, text: "" };
  }

  return {
    url: "",
    alt: "",
    title: undefined,
    caption: "",
    showInImageSitemap: true,
  };
}

export function ContentEditor({
  entityId,
  initialContent,
  onSave,
  onStatusChange,
  onContentChange,
}: ContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() =>
    toInitialBlocks(initialContent),
  );

  const { status } = useAutoSave({
    value: { blocks },
    onSave: (value) => onSave(value as Record<string, unknown>),
    delay: 1200,
  });

  useEffect(() => {
    onStatusChange(status);
  }, [onStatusChange, status]);

  useEffect(() => {
    onContentChange?.({ blocks });
  }, [blocks, onContentChange]);

  function addBlock(type: BlockType): void {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        data: defaultBlockData(type),
      },
    ]);
  }

  function updateBlock(id: string, data: BlockData): void {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, data } : block)),
    );
  }

  function removeBlock(id: string): void {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  }

  function moveBlock(from: number, to: number): void {
    setBlocks((prev) => {
      if (to < 0 || to >= prev.length) {
        return prev;
      }

      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      if (!moved) {
        return prev;
      }

      copy.splice(to, 0, moved);
      return copy;
    });
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const isFirst = index === 0;
        const isLast = index === blocks.length - 1;

        return (
          <div
            key={block.id}
            className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4 hover:border-[--color-primary]/40 transition-colors"
          >
            <div className="mb-3 flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={isFirst}
                onClick={() => moveBlock(index, index - 1)}
              >
                <ChevronUp className="h-4 w-4 text-[--color-foreground-muted]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={isLast}
                onClick={() => moveBlock(index, index + 1)}
              >
                <ChevronDown className="h-4 w-4 text-[--color-foreground-muted]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-[--color-danger]"
                onClick={() => removeBlock(block.id)}
              >
                <X className="h-4 w-4 text-[--color-foreground-muted]" />
              </Button>
            </div>

            {isHeading(block) ? (
              <HeadingBlock
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}

            {isParagraph(block) ? (
              <ParagraphBlock
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}

            {isImage(block) ? (
              <ImageBlock
                entityId={entityId}
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}

            {isList(block) ? (
              <ListBlock
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}

            {isQuote(block) ? (
              <QuoteBlock
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}



            {isCallout(block) ? (
              <CalloutBlock
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}

            {isFigure(block) ? (
              <FigureBlock
                entityId={entityId}
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
              />
            ) : null}
          </div>
        );
      })}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => addBlock("heading")}>
          <Plus className="mr-1 h-3 w-3" /> Заголовок
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("paragraph")}>
          <Plus className="mr-1 h-3 w-3" /> Параграф
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("list")}>
          <Plus className="mr-1 h-3 w-3" /> Список
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("quote")}>
          <Plus className="mr-1 h-3 w-3" /> Цитата
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("callout")}>
          <Plus className="mr-1 h-3 w-3" /> Блок внимания
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("figure")}>
          <Plus className="mr-1 h-3 w-3" /> Иллюстрация с подписью
        </Button>
        <Button variant="outline" size="sm" onClick={() => addBlock("image")}>
          <Plus className="mr-1 h-3 w-3" /> Изображение
        </Button>
      </div>
    </div>
  );
}
