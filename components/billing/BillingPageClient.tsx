"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Ticket } from "lucide-react";
import { toast } from "sonner";
import {
  type BillingPlanResponse,
  type PaginationMeta,
  type PaginatedResponse,
  type TokenTransactionResponse,
} from "@/lib/api/contract";
import { useBalance, useTransactions } from "@/lib/hooks/billing/useBilling";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "@/components/billing/TransactionRow";
import { cn } from "@/lib/utils";

interface BillingBalance {
  balance: number;
  currency: "TOKEN";
}

interface BillingPageClientProps {
  initialBalance: BillingBalance;
  initialTransactions: TokenTransactionResponse[];
  initialMeta: PaginationMeta;
  initialPlans: BillingPlanResponse[];
}

export function BillingPageClient({
  initialBalance,
  initialTransactions,
  initialMeta,
  initialPlans,
}: BillingPageClientProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(
    initialPlans[0]?.id,
  );
  const [allTransactions, setAllTransactions] =
    useState<TokenTransactionResponse[]>(initialTransactions);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [page, setPage] = useState<number>(1);

  const loadedPagesRef = useRef<Set<number>>(new Set([1]));

  const balanceQuery = useBalance(initialBalance);

  const transactionsInitialData = useMemo<
    PaginatedResponse<TokenTransactionResponse> | undefined
  >(
    () =>
      page === 1
        ? {
            data: initialTransactions,
            meta: initialMeta,
          }
        : undefined,
    [initialMeta, initialTransactions, page],
  );

  const transactionsQuery = useTransactions(
    page,
    20,
    page > 1,
    transactionsInitialData,
  );

  useEffect(() => {
    if (page <= 1 || !transactionsQuery.data) {
      return;
    }

    if (loadedPagesRef.current.has(page)) {
      return;
    }

    setAllTransactions((prev) => [...prev, ...transactionsQuery.data.data]);
    setMeta(transactionsQuery.data.meta);
    loadedPagesRef.current.add(page);
  }, [page, transactionsQuery.data]);

  const selectedPlan =
    initialPlans.find((plan) => plan.id === selectedPlanId) ?? initialPlans[0];
  const effectiveSelectedPlanId = selectedPlan?.id;
  const hasMore = meta.page < Math.max(meta.totalPages, 1);
  const balance = balanceQuery.data ?? initialBalance;
  const bonusTickets = selectedPlan ? Math.ceil(selectedPlan.tickets * 0.1) : 0;

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-4 md:px-6 md:py-8">
      <div className="space-y-4 md:space-y-5">
        <header className="rounded-[--radius-xl] border border-border bg-surface p-4 md:p-6">
          <h1 className="text-lg font-semibold md:text-2xl">
            Пополнение баланса
          </h1>
          <p className="mt-1 text-sm text-[--color-foreground-muted]">
            Выберите тарифный план и получите бонусные тикеты.
          </p>
        </header>

        <section
          id="topup-card"
          className="rounded-[--radius-xl] border border-border bg-[--color-background] p-4 md:p-6"
        >
          <div className="mx-auto w-full max-w-[360px] rounded-[24px] border border-white/10 bg-black/70 p-3">
            <div className="h-[130px] w-full overflow-hidden rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,#4b4be0_0%,#1b1f3b_45%,#0b0f1f_100%)]">
              <div className="flex h-full items-center justify-center text-sm text-white/70">
                Изображение 320×130 (.webp)
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-base font-semibold text-white">
                Пополнение баланса
              </p>
              <p className="mt-1 text-xs text-white/65">
                Выберите подходящий объём тикетов
              </p>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {initialPlans.slice(0, 3).map((plan) => {
                const active = plan.id === effectiveSelectedPlanId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "rounded-full border px-2 py-1 text-xs transition",
                      active
                        ? "border-white/80 bg-white text-black"
                        : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10",
                    )}
                  >
                    {plan.tickets} тик.
                  </button>
                );
              })}
            </div>

            {selectedPlan ? (
              <div className="mt-3 rounded-[14px] border border-white/10 bg-white p-3 text-black">
                <p className="text-2xl font-semibold">{selectedPlan.price} ₽</p>

                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/70">
                    Что вы получите:
                  </p>
                  <ul className="space-y-1 text-xs leading-5 text-black/80">
                    {selectedPlan.whatYouGet.map((item, index) => (
                      <li
                        key={`${selectedPlan.id}-get-${index}`}
                        className="flex items-start gap-1.5"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-secondary]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-black/70">
                    Включено:
                  </p>
                  <ul className="space-y-1 text-xs leading-5 text-black/80">
                    {selectedPlan.included.map((item, index) => (
                      <li
                        key={`${selectedPlan.id}-inc-${index}`}
                        className="flex items-start gap-1.5"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[--color-secondary]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[--gradient-create-mode-purple] px-3 py-2 text-xs text-white">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {bonusTickets} тикетов в подарок
                  </span>
                  <span>+10%</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-[14px] border border-dashed border-white/20 p-3 text-center text-xs text-white/70">
                Тарифы пока не настроены
              </div>
            )}

            <Button
              type="button"
              disabled={!selectedPlan}
              onClick={() =>
                toast.info("Покупка доступна в профиле или на странице цен")
              }
              className="mt-3 h-10 w-full rounded-[12px] border border-white/20 bg-[image:var(--gradient-create-cta)] text-sm font-medium text-white hover:opacity-95"
            >
              {selectedPlan
                ? `Купить ${selectedPlan.tickets} тикетов`
                : "Купить тикеты"}
            </Button>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-[--radius-md] border border-border bg-surface px-3 py-2 text-sm">
            <Ticket className="h-4 w-4 text-[--color-token]" />
            <span className="font-semibold">{balance.balance}</span>
            <span className="text-[--color-foreground-muted]">
              {balance.currency}
            </span>
          </div>
        </section>

        <section className="rounded-[--radius-xl] border border-border bg-surface p-4 md:p-6">
          <h2 className="text-base font-semibold md:text-lg">
            История транзакций
          </h2>

          {allTransactions.length === 0 ? (
            <p className="mt-3 rounded-[--radius-md] border border-dashed border-border px-3 py-4 text-sm text-[--color-foreground-muted]">
              Транзакций пока нет.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {allTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </ul>
          )}

          {hasMore ? (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={transactionsQuery.isFetching}
                onClick={() => setPage(meta.page + 1)}
              >
                {transactionsQuery.isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загружаем...
                  </>
                ) : (
                  "Загрузить ещё"
                )}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
