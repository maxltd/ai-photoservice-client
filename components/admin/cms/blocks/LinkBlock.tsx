"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LinkData {
  text: string;
  href: string;
}

interface LinkBlockProps {
  data: LinkData;
  onChange: (next: LinkData) => void;
}

export function LinkBlock({ data, onChange }: LinkBlockProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Текст ссылки</Label>
        <Input
          value={data.text}
          onChange={(event) => onChange({ ...data, text: event.target.value })}
          placeholder="Текст"
        />
      </div>
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={data.href}
          onChange={(event) => onChange({ ...data, href: event.target.value })}
          placeholder="/blog/slug/ или https://..."
        />
      </div>
    </div>
  );
}
