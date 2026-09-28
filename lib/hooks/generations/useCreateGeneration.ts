"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  ApiError,
  type CreateGenerationRequest,
  type GenerationOrderResponse,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

export function useCreateGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { dto: CreateGenerationRequest; idempotencyKey: string }) =>
      apiPost<{ data: GenerationOrderResponse } | GenerationOrderResponse>(
        API_ROUTES.GENERATIONS,
        input.dto,
        { idempotencyKey: input.idempotencyKey },
      ).then((response) =>
        "data" in response ? response.data : response,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.generations.all });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.code === "INSUFFICIENT_TOKENS") {
        toast.error("Недостаточно токенов. Пополните баланс.");
        return;
      }

      toast.error("Не удалось создать генерацию");
    },
  });
}
