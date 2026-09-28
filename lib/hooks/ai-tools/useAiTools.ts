"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatch, apiUpload } from "@/lib/api/client";
import {
  API_ROUTES,
  type AiToolsHubSettingsResponse,
  type UpdateAiToolsHubRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useUpdateAiToolsHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAiToolsHubRequest) =>
      apiPatch<AiToolsHubSettingsResponse, UpdateAiToolsHubRequest>(
        API_ROUTES.ADMIN_AI_TOOLS_HUB,
        body,
      ),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.aiTools.hub, settings);
    },
  });
}

export function uploadAiToolImage(
  file: File,
  entityId: string,
): Promise<{ url: string; mediaAssetId: string }> {
  const form = new FormData();
  form.set("file", file);
  form.set("entityType", "AI_TOOL");
  form.set("entityId", entityId);
  return apiUpload(API_ROUTES.ADMIN_UPLOAD_ASSET, form);
}
