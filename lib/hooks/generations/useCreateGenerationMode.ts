"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type CreateGenerationModeRequest,
  type CreateGenerationModeResponse,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

interface CreateModeInput {
  dto: CreateGenerationModeRequest;
  idempotencyKey: string;
}

export function useCreateGenerationMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dto, idempotencyKey }: CreateModeInput) =>
      apiPost<{ data: CreateGenerationModeResponse }>(
        API_ROUTES.GENERATIONS_MODES,
        dto,
        { idempotencyKey },
      ).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.generations.all });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.code === "INSUFFICIENT_TOKENS") {
        toast.error("Недостаточно токенов. Пополните баланс.");
        return;
      }

      toast.error("Не удалось запустить генерацию");
    },
  });
}
