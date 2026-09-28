"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface HeadingData {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

interface HeadingBlockProps {
  data: HeadingData;
  onChange: (next: HeadingData) => void;
}

export function HeadingBlock({ data, onChange }: HeadingBlockProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
      <Select
        value={String(data.level)}
        onValueChange={(value) => {
          const numeric = Number(value);
          const level =
            numeric >= 1 && numeric <= 6 && Number.isInteger(numeric)
              ? (numeric as 1 | 2 | 3 | 4 | 5 | 6)
              : 2;

          onChange({ ...data, level });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Уровень" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">H1</SelectItem>
          <SelectItem value="2">H2</SelectItem>
          <SelectItem value="3">H3</SelectItem>
          <SelectItem value="4">H4</SelectItem>
          <SelectItem value="5">H5</SelectItem>
          <SelectItem value="6">H6</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={data.text}
        onChange={(event) => onChange({ ...data, text: event.target.value })}
        placeholder="Текст заголовка"
      />
    </div>
  );
}
