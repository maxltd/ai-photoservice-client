"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  BillingPlanResponse,
  CreateBillingPlanRequest,
} from "@/lib/api/contract";

interface BillingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan?: BillingPlanResponse;
  isPending: boolean;
  onSubmit: (payload: CreateBillingPlanRequest) => Promise<void>;
}

const BillingPlanSchema = z.object({
  tickets: z.number().int().min(1, "Минимум 1 тикет"),
  price: z.number().int().min(1, "Минимальная стоимость 1"),
  whatYouGet1: z.string().trim().min(1, "Обязательное поле"),
  whatYouGet2: z.string().trim().min(1, "Обязательное поле"),
  whatYouGet3: z.string().trim().min(1, "Обязательное поле"),
  whatYouGet4: z.string().trim().min(1, "Обязательное поле"),
  whatYouGet5: z.string().trim().min(1, "Обязательное поле"),
  included1: z.string().trim().min(1, "Обязательное поле"),
  included2: z.string().trim().min(1, "Обязательное поле"),
});

type BillingPlanFormValues = z.infer<typeof BillingPlanSchema>;

function createDefaultValues(plan?: BillingPlanResponse): BillingPlanFormValues {
  return {
    tickets: plan?.tickets ?? 100,
    price: plan?.price ?? 99,
    whatYouGet1: plan?.whatYouGet[0] ?? "",
    whatYouGet2: plan?.whatYouGet[1] ?? "",
    whatYouGet3: plan?.whatYouGet[2] ?? "",
    whatYouGet4: plan?.whatYouGet[3] ?? "",
    whatYouGet5: plan?.whatYouGet[4] ?? "",
    included1: plan?.included[0] ?? "",
    included2: plan?.included[1] ?? "",
  };
}

export function BillingPlanDialog({
  open,
  onOpenChange,
  initialPlan,
  isPending,
  onSubmit,
}: BillingPlanDialogProps) {
  const form = useForm<BillingPlanFormValues>({
    resolver: zodResolver(BillingPlanSchema),
    mode: "onChange",
    defaultValues: createDefaultValues(initialPlan),
  });

  useEffect(() => {
    if (open) {
      form.reset(createDefaultValues(initialPlan));
    }
  }, [open, initialPlan, form]);

  async function handleSubmit(values: BillingPlanFormValues): Promise<void> {
    await onSubmit({
      tickets: values.tickets,
      price: values.price,
      whatYouGet: [
        values.whatYouGet1,
        values.whatYouGet2,
        values.whatYouGet3,
        values.whatYouGet4,
        values.whatYouGet5,
      ],
      included: [values.included1, values.included2],
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialPlan ? "Редактировать тариф" : "Добавить тариф"}
          </DialogTitle>
          <DialogDescription>
            Заполните все поля тарифа. Доступно максимум 3 тарифных плана.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
          className="space-y-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tickets">Количество тикетов</Label>
              <Input
                id="tickets"
                type="number"
                min={1}
                {...form.register("tickets", { valueAsNumber: true })}
              />
              {form.formState.errors.tickets ? (
                <p className="text-xs text-[--color-danger]">
                  {form.formState.errors.tickets.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Стоимость</Label>
              <Input
                id="price"
                type="number"
                min={1}
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price ? (
                <p className="text-xs text-[--color-danger]">
                  {form.formState.errors.price.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Что вы получите (5 полей)</p>
            {[
              "whatYouGet1",
              "whatYouGet2",
              "whatYouGet3",
              "whatYouGet4",
              "whatYouGet5",
            ].map((field, index) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{`Пункт ${index + 1}`}</Label>
                <Input
                  id={field}
                  {...form.register(field as keyof BillingPlanFormValues)}
                />
                {form.formState.errors[
                  field as keyof BillingPlanFormValues
                ] ? (
                  <p className="text-xs text-[--color-danger]">
                    {
                      form.formState.errors[
                        field as keyof BillingPlanFormValues
                      ]?.message
                    }
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Включено (2 поля)</p>
            {["included1", "included2"].map((field, index) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{`Пункт ${index + 1}`}</Label>
                <Input
                  id={field}
                  {...form.register(field as keyof BillingPlanFormValues)}
                />
                {form.formState.errors[
                  field as keyof BillingPlanFormValues
                ] ? (
                  <p className="text-xs text-[--color-danger]">
                    {
                      form.formState.errors[
                        field as keyof BillingPlanFormValues
                      ]?.message
                    }
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending || !form.formState.isValid}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
