import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  TokenTransactionType,
  type TokenTransactionResponse,
} from "@/lib/api/contract";
import { cn } from "@/lib/utils";

const txConfig: Record<
  TokenTransactionType,
  { label: string; sign: "+" | "-"; color: string }
> = {
  [TokenTransactionType.TOPUP]: {
    label: "Пополнение",
    sign: "+",
    color: "text-[--color-success]",
  },
  [TokenTransactionType.CHARGE]: {
    label: "Списание",
    sign: "-",
    color: "text-[--color-danger]",
  },
  [TokenTransactionType.REFUND]: {
    label: "Возврат",
    sign: "+",
    color: "text-[--color-secondary]",
  },
  [TokenTransactionType.ADJUSTMENT]: {
    label: "Коррекция",
    sign: "+",
    color: "text-[--color-warning]",
  },
};

interface TransactionRowProps {
  transaction: TokenTransactionResponse;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const cfg = txConfig[transaction.type];
  const amount = Math.abs(transaction.amount);
  const date = new Date(transaction.createdAt);

  return (
    <li className="flex items-start justify-between gap-3 rounded-[--radius-md] border border-border bg-[--color-background]/30 px-3 py-3 md:px-4">
      <div className="min-w-0 flex-1">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          {cfg.sign === "+" ? (
            <ArrowUpRight className="h-4 w-4 text-[--color-success]" />
          ) : (
            <ArrowDownLeft className="h-4 w-4 text-[--color-danger]" />
          )}
          {cfg.label}
        </p>

        <p className="mt-1 truncate text-xs text-[--color-foreground-muted] md:text-sm">
          {transaction.description ?? transaction.orderId ?? "Без описания"}
        </p>

        <p className="mt-1 text-xs text-[--color-foreground-muted]">
          {date.toLocaleDateString("ru-RU")} {date.toLocaleTimeString("ru-RU")}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className={cn("text-sm font-semibold", cfg.color)}>
          {cfg.sign}
          {amount}
        </p>
        {transaction.paymentAmount !== undefined ? (
          <p className="mt-1 text-xs text-[--color-foreground-muted]">
            {transaction.paymentAmount.toLocaleString("ru-RU")} ₽
          </p>
        ) : null}
      </div>
    </li>
  );
}
