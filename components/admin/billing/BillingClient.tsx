"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Wallet, X } from "lucide-react";
import { BillingPlanDialog } from "@/components/admin/billing/BillingPlanDialog";
import { AdjustBalanceDialog } from "@/components/admin/billing/AdjustBalanceDialog";
import { DataTable } from "@/components/admin/common/DataTable";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TokenTransactionType,
  type BillingPlanResponse,
  type CreateBillingPlanRequest,
  type PaginationMeta,
  type TokenTransactionResponse,
} from "@/lib/api/contract";
import {
  useAdminBillingPlans,
  useAdminTransactions,
  useCreateBillingPlan,
  useUpdateBillingPlan,
} from "@/lib/hooks/billing/useAdminBilling";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface BillingClientProps {
  initialData: TokenTransactionResponse[];
  initialMeta: PaginationMeta;
  initialPlans: BillingPlanResponse[];
}

const typeConfig: Record<
  TokenTransactionType,
  { label: string; className: string }
> = {
  [TokenTransactionType.TOPUP]: {
    label: "Пополнение",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
  [TokenTransactionType.CHARGE]: {
    label: "Списание",
    className:
      "bg-[--color-danger]/10 text-[--color-danger] border-[--color-danger]/20",
  },
  [TokenTransactionType.REFUND]: {
    label: "Возврат",
    className:
      "bg-[--color-secondary]/10 text-[--color-secondary] border-[--color-secondary]/20",
  },
  [TokenTransactionType.ADJUSTMENT]: {
    label: "Коррекция",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
};

function TransactionTypeBadge({ type }: { type: TokenTransactionType }) {
  const cfg = typeConfig[type];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

function BillingClient({
  initialData,
  initialMeta,
  initialPlans,
}: BillingClientProps) {
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<TokenTransactionType | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [openAdjust, setOpenAdjust] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<
    BillingPlanResponse | undefined
  >(undefined);

  const debouncedUserId = useDebounce(userId, 600);

  const plansQuery = useAdminBillingPlans(initialPlans);
  const createPlan = useCreateBillingPlan();
  const updatePlan = useUpdateBillingPlan();

  const transactionsQuery = useAdminTransactions(
    {
      userId: debouncedUserId,
      type,
      page,
      pageSize: 25,
    },
    page === 1 && !debouncedUserId && !type
      ? { data: initialData, meta: initialMeta }
      : undefined,
  );

  const rows = transactionsQuery.data?.data ?? [];
  const meta = transactionsQuery.data?.meta ?? initialMeta;
  const plans = plansQuery.data ?? initialPlans;

  const columns = useMemo<Array<ColumnDef<TokenTransactionResponse>>>(
    () => [
      {
        id: "id",
        header: "ID транзакции",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => (
          <span className="text-sm text-[--color-foreground-muted]">
            {`${row.original.id.slice(0, 8)}…`}
          </span>
        ),
      },
      {
        id: "type",
        header: "Тип",
        meta: { className: "w-[130px]" },
        cell: ({ row }) => <TransactionTypeBadge type={row.original.type} />,
      },
      {
        id: "amount",
        header: "Сумма",
        meta: { className: "w-[140px]" },
        cell: ({ row }) => (
          <span
            className={cn(
              "font-semibold",
              row.original.amount > 0 && "text-[--color-success]",
              row.original.amount < 0 && "text-[--color-danger]",
              row.original.amount === 0 && "text-[--color-foreground-muted]",
            )}
          >
            {row.original.amount > 0 ? "+" : ""}
            {row.original.amount} токенов
          </span>
        ),
      },
      {
        id: "description",
        header: "Описание",
        cell: ({ row }) => (
          <span className="block max-w-105 truncate text-sm text-[--color-foreground-muted]">
            {row.original.description ?? row.original.orderId ?? "—"}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: "Дата",
        meta: { className: "w-[160px]" },
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return `${date.toLocaleDateString("ru")} ${date.toLocaleTimeString("ru")}`;
        },
      },
    ],
    [],
  );

  async function handleSubmitPlan(
    payload: CreateBillingPlanRequest,
  ): Promise<void> {
    if (editingPlan) {
      await updatePlan.mutateAsync({ id: editingPlan.id, dto: payload });
      return;
    }

    await createPlan.mutateAsync(payload);
  }

  const isPlanPending = createPlan.isPending || updatePlan.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Биллинг"
        description="Транзакции токенов, корректировка баланса и тарифные планы"
        action={
          <Button onClick={() => setOpenAdjust(true)}>
            Скорректировать баланс
          </Button>
        }
      />

      <section className="space-y-4 rounded-[--radius-lg] border border-[--color-border] bg-[--color-surface] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Тарифные планы</h2>
            <p className="text-sm text-[--color-foreground-muted]">
              Управление пакетами пополнения. Максимум 3 плана.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setEditingPlan(undefined);
              setOpenPlanDialog(true);
            }}
            disabled={plans.length >= 3}
          >
            <Plus className="h-4 w-4" />
            Добавить план
          </Button>
        </div>

        {plans.length === 0 ? (
          <p className="rounded-[--radius-md] border border-dashed border-[--color-border] px-3 py-4 text-sm text-[--color-foreground-muted]">
            Тарифные планы пока не созданы.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="space-y-3 rounded-[--radius-md] border border-[--color-border] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-[--color-foreground-muted]">
                      Тариф
                    </p>
                    <p className="text-lg font-semibold">
                      {plan.price} ₽ · {plan.tickets} тикетов
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPlan(plan);
                      setOpenPlanDialog(true);
                    }}
                  >
                    Редактировать
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[--color-foreground-muted]">
                    Что вы получите
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {plan.whatYouGet.map((item, index) => (
                      <li key={`${plan.id}-get-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[--color-foreground-muted]">
                    Включено
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {plan.included.map((item, index) => (
                      <li key={`${plan.id}-included-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative">
          <Input
            placeholder="ID пользователя"
            value={userId}
            onChange={(event) => {
              setUserId(event.target.value);
              setPage(1);
            }}
            className="pr-9"
          />
          {userId ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                setUserId("");
                setPage(1);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <Select
          value={type ?? "ALL"}
          onValueChange={(value) => {
            setType(
              value === "ALL" ? undefined : (value as TokenTransactionType),
            );
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все типы</SelectItem>
            <SelectItem value={TokenTransactionType.TOPUP}>TOPUP</SelectItem>
            <SelectItem value={TokenTransactionType.CHARGE}>CHARGE</SelectItem>
            <SelectItem value={TokenTransactionType.REFUND}>REFUND</SelectItem>
            <SelectItem value={TokenTransactionType.ADJUSTMENT}>
              ADJUSTMENT
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!transactionsQuery.isLoading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Wallet className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">
            Транзакции не найдены
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={transactionsQuery.isLoading}
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[--color-foreground-muted]">
          Всего: {meta.total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Предыдущая
          </Button>
          <span className="text-sm text-[--color-foreground-muted]">
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= Math.max(meta.totalPages, 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Следующая
          </Button>
        </div>
      </div>

      <AdjustBalanceDialog open={openAdjust} onOpenChange={setOpenAdjust} />

      <BillingPlanDialog
        open={openPlanDialog}
        onOpenChange={(nextOpen) => {
          setOpenPlanDialog(nextOpen);
          if (!nextOpen) {
            setEditingPlan(undefined);
          }
        }}
        initialPlan={editingPlan}
        isPending={isPlanPending}
        onSubmit={handleSubmitPlan}
      />
    </div>
  );
}

export { BillingClient };
export default BillingClient;
