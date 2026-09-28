"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useAdjustBalance } from "@/lib/hooks/billing/useAdminBilling";
import { cn } from "@/lib/utils";

interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdjustBalanceSchema = z.object({
  userId: z.string().min(1, "Введите ID пользователя"),
  rawAmount: z.number().int().positive("Введите положительное число"),
  description: z.string().min(1, "Обязательное поле").max(500),
  direction: z.enum(["add", "subtract"]),
});

type AdjustBalanceFormValues = z.infer<typeof AdjustBalanceSchema>;

export function AdjustBalanceDialog({
  open,
  onOpenChange,
}: AdjustBalanceDialogProps) {
  const { mutateAsync, isPending } = useAdjustBalance();

  const form = useForm<
    z.input<typeof AdjustBalanceSchema>,
    unknown,
    AdjustBalanceFormValues
  >({
    resolver: zodResolver(AdjustBalanceSchema),
    mode: "onChange",
    defaultValues: {
      userId: "",
      rawAmount: 0,
      description: "",
      direction: "add",
    },
  });

  const direction = useWatch({ control: form.control, name: "direction" });

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(values: AdjustBalanceFormValues): Promise<void> {
    const amount =
      values.direction === "add"
        ? Math.abs(values.rawAmount)
        : -Math.abs(values.rawAmount);

    await mutateAsync({
      userId: values.userId,
      amount,
      description: values.description,
    });

    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Корректировка баланса</DialogTitle>
          <DialogDescription>
            Начисление или списание токенов пользователю
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="userId">ID пользователя</Label>
            <Input id="userId" {...form.register("userId")} />
            {form.formState.errors.userId ? (
              <p className="text-xs text-[--color-danger]">
                {form.formState.errors.userId.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Операция</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "border-[--color-border]",
                  direction === "add" &&
                    "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/40",
                )}
                onClick={() =>
                  form.setValue("direction", "add", { shouldValidate: true })
                }
              >
                Начислить
              </Button>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "border-[--color-border]",
                  direction === "subtract" &&
                    "bg-[--color-danger]/10 text-[--color-danger] border-[--color-danger]/40",
                )}
                onClick={() =>
                  form.setValue("direction", "subtract", {
                    shouldValidate: true,
                  })
                }
              >
                Списать
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rawAmount">Сумма</Label>
            <Input
              id="rawAmount"
              type="number"
              min={1}
              {...form.register("rawAmount", { valueAsNumber: true })}
            />
            {direction === "subtract" ? (
              <p className="inline-flex items-center gap-1 text-xs text-[--color-warning]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Отрицательное значение спишет токены с баланса пользователя
              </p>
            ) : null}
            {form.formState.errors.rawAmount ? (
              <p className="text-xs text-[--color-danger]">
                {form.formState.errors.rawAmount.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description ? (
              <p className="text-xs text-[--color-danger]">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              className={cn(
                direction === "subtract" &&
                  "bg-[--color-danger] hover:bg-[--color-danger]/90",
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Применение...
                </>
              ) : (
                "Применить"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
