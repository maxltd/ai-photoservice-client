"use client";

import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type CreateFeedbackRequest,
  type FeedbackResponse,
} from "@/lib/api/contract";

export function useSendFeedback() {
  return useMutation({
    mutationFn: (dto: CreateFeedbackRequest) =>
      apiPost<{ data: FeedbackResponse }>(API_ROUTES.FEEDBACK, dto).then(
        (response) => response.data,
      ),
  });
}
