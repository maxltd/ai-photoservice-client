"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  API_ROUTES,
  type AdminHomepageTestimonialResponse,
  type CreateHomepageTestimonialRequest,
  type HomepageTestimonialResponse,
  type UpdateHomepageTestimonialRequest,
} from "@/lib/api/contract";
import { queryKeys } from "@/lib/query/keys";

type TestimonialsResponse<T> = { data: T[] };

export function useHomepageTestimonials(
  initialData?: TestimonialsResponse<HomepageTestimonialResponse>,
) {
  return useQuery({
    queryKey: queryKeys.homepageTestimonials.public,
    queryFn: () =>
      apiGet<TestimonialsResponse<HomepageTestimonialResponse>>(
        API_ROUTES.HOMEPAGE_TESTIMONIALS,
      ),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminHomepageTestimonials(
  initialData?: TestimonialsResponse<AdminHomepageTestimonialResponse>,
) {
  return useQuery({
    queryKey: queryKeys.homepageTestimonials.admin,
    queryFn: () =>
      apiGet<TestimonialsResponse<AdminHomepageTestimonialResponse>>(
        API_ROUTES.ADMIN_HOMEPAGE_TESTIMONIALS,
      ),
    initialData,
    staleTime: 30_000,
  });
}

function invalidateTestimonials(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.homepageTestimonials.public });
  void queryClient.invalidateQueries({ queryKey: queryKeys.homepageTestimonials.admin });
}

export function useSaveHomepageTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CreateHomepageTestimonialRequest | UpdateHomepageTestimonialRequest }) =>
      id
        ? apiPatch<AdminHomepageTestimonialResponse>(API_ROUTES.ADMIN_HOMEPAGE_TESTIMONIAL_BY_ID(id), body)
        : apiPost<AdminHomepageTestimonialResponse>(API_ROUTES.ADMIN_HOMEPAGE_TESTIMONIALS, body),
    onSuccess: () => {
      invalidateTestimonials(queryClient);
      toast.success("Отзыв сохранён");
    },
    onError: () => toast.error("Не удалось сохранить отзыв"),
  });
}

export function useDeleteHomepageTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(API_ROUTES.ADMIN_HOMEPAGE_TESTIMONIAL_BY_ID(id)),
    onSuccess: () => {
      invalidateTestimonials(queryClient);
      toast.success("Отзыв удалён");
    },
    onError: () => toast.error("Не удалось удалить отзыв"),
  });
}
