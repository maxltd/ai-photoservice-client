"use client";

import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type GenerationOrderResponse,
  type PromptGenerationRequest,
} from "@/lib/api/contract";

interface PromptGenerationInput {
  dto: PromptGenerationRequest;
  idempotencyKey: string;
}

export function usePromptGeneration() {
  return useMutation({
    mutationFn: ({ dto, idempotencyKey }: PromptGenerationInput) =>
      apiPost<{ data: GenerationOrderResponse }>(
        API_ROUTES.GENERATIONS_PROMPT,
        dto,
        { idempotencyKey },
      ).then((response) => response.data),
  });
}
