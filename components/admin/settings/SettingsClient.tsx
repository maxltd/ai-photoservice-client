"use client";

import { useQuery } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/admin/common/PageHeader";
import SettingRow from "@/components/admin/settings/SettingRow";
import { apiGet } from "@/lib/api/client";
import { API_ROUTES, type AppSettingResponse } from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

interface SettingsClientProps {
  initialData: AppSettingResponse[];
}

const HIDDEN_SETTING_KEYS = new Set<string>(["prompt_generation_token_cost"]);

function getVisibleSettings(
  settings: AppSettingResponse[],
): AppSettingResponse[] {
  return settings.filter((setting) => !HIDDEN_SETTING_KEYS.has(setting.key));
}

function unwrapSettingsPayload(
  payload: AppSettingResponse[] | { data: AppSettingResponse[] },
): AppSettingResponse[] {
  const settings = Array.isArray(payload) ? payload : payload.data;
  return getVisibleSettings(settings);
}

function SettingsClient({ initialData }: SettingsClientProps) {
  const visibleInitialData = getVisibleSettings(initialData);

  const { data: settings = [] } = useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: async () => {
      const payload = await apiGet<
        AppSettingResponse[] | { data: AppSettingResponse[] }
      >(API_ROUTES.ADMIN_SETTINGS);

      return unwrapSettingsPayload(payload);
    },
    initialData: visibleInitialData,
    staleTime: 60_000,
  });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Настройки"
        description="Системные параметры приложения"
      />

      {settings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Settings className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">
            Настройки не найдены
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => (
            <SettingRow key={setting.key} setting={setting} />
          ))}
        </div>
      )}
    </div>
  );
}

export { SettingsClient };
export default SettingsClient;
