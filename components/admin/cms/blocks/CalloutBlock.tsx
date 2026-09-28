"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BlogCalloutVariant } from "@/lib/api/contract";

export interface CalloutData {
  variant: BlogCalloutVariant;
  text: string;
}

interface CalloutBlockProps {
  data: CalloutData;
  onChange: (next: CalloutData) => void;
}

export function CalloutBlock({ data, onChange }: CalloutBlockProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Тип блока внимания</Label>
        <Select
          value={data.variant}
          onValueChange={(value) =>
            onChange({
              ...data,
              variant:
                value === BlogCalloutVariant.SUCCESS
                  ? BlogCalloutVariant.SUCCESS
                  : value === BlogCalloutVariant.DANGER
                    ? BlogCalloutVariant.DANGER
                    : BlogCalloutVariant.ACCENT,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BlogCalloutVariant.ACCENT}>Акцент</SelectItem>
            <SelectItem value={BlogCalloutVariant.SUCCESS}>Успех</SelectItem>
            <SelectItem value={BlogCalloutVariant.DANGER}>Опасность</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Текст</Label>
        <Textarea
          rows={3}
          value={data.text}
          onChange={(event) => onChange({ ...data, text: event.target.value })}
          placeholder="Текст блока внимания"
        />
      </div>
    </div>
  );
}
