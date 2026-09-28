"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AppSettingResponse } from "@/lib/api/contract";
import { useUpdateSetting } from "@/lib/hooks/settings/useAdminSettings";
import { getSettingDisplayName } from "@/lib/settings/setting-display-name";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  setting: AppSettingResponse;
}

function SettingRow({ setting }: SettingRowProps) {
  const [localValue, setLocalValue] = useState(setting.value);
  const { mutate, isPending } = useUpdateSetting();

  const isLong = setting.value.length >= 100;
  const isChanged = localValue !== setting.value;
  const displayName = getSettingDisplayName(setting);

  return (
    <div className="max-w-2xl rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4 transition-colors hover:border-[--color-border]/80">
      <div className="space-y-2">
        <p className="text-sm font-medium text-[--color-foreground]">
          {displayName}
        </p>

        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {isLong ? (
              <Textarea
                rows={3}
                value={localValue}
                onChange={(event) => setLocalValue(event.target.value)}
                className={cn(
                  "min-h-16 border border-[--color-border] bg-[--color-surface] focus:border-[--color-primary]",
                  isChanged && "border-[--color-warning]/60",
                )}
              />
            ) : (
              <Input
                value={localValue}
                onChange={(event) => setLocalValue(event.target.value)}
                className={cn(
                  "border border-[--color-border] bg-[--color-surface] focus:border-[--color-primary]",
                  isChanged && "border-[--color-warning]/60",
                )}
              />
            )}
          </div>

          <Button
            size="sm"
            disabled={!isChanged || isPending}
            onClick={() =>
              mutate(
                { key: setting.key, value: localValue },
                {
                  onSuccess: (updated) => {
                    setLocalValue(updated.value);
                  },
                },
              )
            }
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Сохранить"
            )}
          </Button>
        </div>

        <span className="text-xs text-[--color-foreground-muted]">
          Обновлено: {new Date(setting.updatedAt).toLocaleString("ru")}
        </span>
      </div>
    </div>
  );
}

export { SettingRow };
export default SettingRow;
