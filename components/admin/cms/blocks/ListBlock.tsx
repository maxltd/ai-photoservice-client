"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ListVariant = "default" | "positive" | "negative";

export interface ListData {
  style: "unordered" | "ordered";
  variant?: ListVariant;
  items: string[];
}

interface ListBlockProps {
  data: ListData;
  onChange: (next: ListData) => void;
}

export function ListBlock({ data, onChange }: ListBlockProps) {
  const textValue = data.items.join("\n");

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Тип списка</Label>
        <Select
          value={data.style}
          onValueChange={(value) =>
            onChange({
              ...data,
              style: value === "ordered" ? "ordered" : "unordered",
              variant: value === "ordered" ? "default" : data.variant ?? "default",
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unordered">Маркированный</SelectItem>
            <SelectItem value="ordered">Нумерованный</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.style === "unordered" ? (
        <div className="space-y-2">
          <Label>Оформление маркированного списка</Label>
          <Select
            value={data.variant ?? "default"}
            onValueChange={(value) =>
              onChange({
                ...data,
                variant:
                  value === "positive" || value === "negative" ? value : "default",
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Оформление" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Обычный</SelectItem>
              <SelectItem value="positive">Плюсы</SelectItem>
              <SelectItem value="negative">Минусы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Пункты (каждый пункт с новой строки)</Label>
        <Textarea
          rows={4}
          value={textValue}
          onChange={(event) =>
            onChange({
              ...data,
              items: event.currentTarget.value
                .split("\n")
                .map((item) => item.trim())
                .filter((item) => item.length > 0),
            })
          }
          placeholder="Первый пункт&#10;Второй пункт"
        />
      </div>
    </div>
  );
}
