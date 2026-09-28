"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/contract";
import { useSendFeedback } from "@/lib/hooks/feedback/useFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const FeedbackSchema = z.object({
  email: z.string().email("Неверный email").optional().or(z.literal("")),
  text: z
    .string()
    .min(10, "Минимум 10 символов")
    .max(2000, "Максимум 2000 символов"),
});

type FeedbackFormValues = z.input<typeof FeedbackSchema>;

interface FeedbackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
}

export function FeedbackSheet({
  open,
  onOpenChange,
  userEmail,
}: FeedbackSheetProps) {
  const sendFeedback = useSendFeedback();
  const isAnonymous = !userEmail;

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(FeedbackSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      text: "",
    },
  });

  const textValue =
    useWatch({
      control: form.control,
      name: "text",
    }) ?? "";
  const textCount = textValue.length;

  const submitDisabled = !form.formState.isValid || sendFeedback.isPending;

  async function onSubmit(values: FeedbackFormValues): Promise<void> {
    const payload = {
      text: values.text.trim(),
      ...(isAnonymous && values.email?.trim()
        ? { email: values.email.trim() }
        : {}),
    };

    try {
      await sendFeedback.mutateAsync(payload);
      toast.success("Сообщение отправлено! Спасибо за обратную связь.");
      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 429) {
        toast.error("Слишком много сообщений. Подождите немного.");
        return;
      }

      if (error instanceof ApiError) {
        toast.error(error.message ?? "Не удалось отправить сообщение");
        return;
      }

      toast.error("Не удалось отправить сообщение");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] rounded-t-[--radius-xl] border-x border-t border-border bg-surface p-0"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[--color-foreground-muted]/40" />

        <div className="px-4 pb-6 pt-4 md:px-6">
          <div className="pr-8">
            <h2 className="text-base font-semibold text-foreground md:text-lg">
              Напишите в поддержку
            </h2>
            <p className="mt-1 text-sm text-[--color-foreground-muted]">
              Расскажите о проблеме или предложении — мы обязательно посмотрим.
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit((values) => {
              void onSubmit(values);
            })}
            className="mt-5 space-y-4"
          >
            {isAnonymous ? (
              <div className="space-y-1.5">
                <Label htmlFor="feedback-email">Email (необязательно)</Label>
                <Input
                  id="feedback-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs text-[--color-danger]">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="feedback-text">Сообщение</Label>
                <span className="text-xs text-[--color-foreground-muted]">
                  {textCount}/2000
                </span>
              </div>

              <Textarea
                id="feedback-text"
                placeholder="Опишите ваш вопрос или проблему"
                className="min-h-32 resize-none"
                maxLength={2000}
                {...form.register("text")}
              />

              {form.formState.errors.text ? (
                <p className="text-xs text-[--color-danger]">
                  {form.formState.errors.text.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={submitDisabled}>
              {sendFeedback.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить"
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
