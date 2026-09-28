"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface QuoteData {
  text: string;
  author?: string;
}

interface QuoteBlockProps {
  data: QuoteData;
  onChange: (next: QuoteData) => void;
}

export function QuoteBlock({ data, onChange }: QuoteBlockProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Текст цитаты</Label>
        <Textarea
          rows={3}
          value={data.text}
          onChange={(event) => onChange({ ...data, text: event.target.value })}
          placeholder="Текст цитаты"
        />
      </div>
      <div className="space-y-2">
        <Label>Автор (опционально)</Label>
        <Input
          value={data.author ?? ""}
          onChange={(event) =>
            onChange({
              ...data,
              author: event.target.value.trim() || undefined,
            })
          }
          placeholder="Имя автора"
        />
      </div>
    </div>
  );
}
