function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInline(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
  return html;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = (): void => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      html.push(`<p>${renderInline(paragraph.join(" ").trim())}</p>`);
      paragraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    const unordered = /^[-*+]\s+(.+)$/.exec(trimmed);
    const ordered = /^\d+[.)]\s+(.+)$/.exec(trimmed);
    const quote = /^>\s?(.*)$/.exec(trimmed);

    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html.push("<hr>");
      continue;
    }

    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${renderInline((unordered ?? ordered)?.[1] ?? "")}</li>`);
      continue;
    }

    if (quote) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}

export function getMarkdownContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return "";
  }

  const markdown = (content as { markdown?: unknown }).markdown;
  return typeof markdown === "string" ? markdown : "";
}
