"use client";

import { Textarea } from "@/components/ui/textarea";

interface ParagraphData {
  text: string;
}

interface ParagraphBlockProps {
  data: ParagraphData;
  onChange: (next: ParagraphData) => void;
}

export function ParagraphBlock({ data, onChange }: ParagraphBlockProps) {
  return (
    <Textarea
      rows={3}
      className="[field-sizing:content]"
      value={data.text}
      onChange={(event) => onChange({ text: event.target.value })}
      placeholder={'Текст параграфа (ссылки: <a href="/blog/slug/">текст</a>)'}
    />
  );
}
