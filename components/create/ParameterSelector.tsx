"use client";

import type { ParameterGroupResponse } from "@/lib/api/contract";
import { cn } from "@/lib/utils";

interface ParameterSelectorProps {
  groups: ParameterGroupResponse[];
  selectedOptions: Record<string, string>;
  onSelect: (groupId: string, optionId: string) => void;
}

export function ParameterSelector({
  groups,
  selectedOptions,
  onSelect,
}: ParameterSelectorProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          <h3 className="text-sm font-medium text-[--color-foreground]">
            {group.question}
            {group.isRequired ? <span className="ml-1 text-[--color-warning]">*</span> : null}
          </h3>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {group.options.map((option) => {
              const selected = selectedOptions[group.id] === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(group.id, option.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition",
                    selected
                      ? "border-[--color-primary] bg-[--color-primary]/15 text-[--color-foreground]"
                      : "border-[--color-border] bg-[--color-surface] text-[--color-foreground-muted] hover:text-[--color-foreground]",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
