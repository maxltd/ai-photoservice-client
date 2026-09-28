"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Receipt } from "lucide-react";
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
  AuditAction,
  type AuditLogResponse,
  type PaginationMeta,
} from "@/lib/api/contract";
import { useAdminAudit } from "@/lib/hooks/audit/useAdminAudit";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface AuditClientProps {
  initialData: AuditLogResponse[];
  initialMeta: PaginationMeta;
}

const actionConfig: Record<AuditAction, { label: string; className: string }> = {
  [AuditAction.CREATE]: {
    label: "Создание",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
  [AuditAction.UPDATE]: {
    label: "Обновление",
    className:
      "bg-[--color-secondary]/10 text-[--color-secondary] border-[--color-secondary]/20",
  },
  [AuditAction.DELETE]: {
    label: "Удаление",
    className:
      "bg-[--color-danger]/10 text-[--color-danger] border-[--color-danger]/20",
  },
  [AuditAction.REORDER]: {
    label: "Сортировка",
    className: "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
  },
  [AuditAction.HIDE]: {
    label: "Скрытие",
    className: "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
  },
  [AuditAction.MODERATE_GALLERY]: {
    label: "Модерация",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
  [AuditAction.UPDATE_SEO]: {
    label: "SEO",
    className:
      "bg-[--color-secondary]/10 text-[--color-secondary] border-[--color-secondary]/20",
  },
  [AuditAction.CHANGE_ROLE]: {
    label: "Смена роли",
    className:
      "bg-[--color-primary]/10 text-[--color-primary] border-[--color-primary]/20",
  },
  [AuditAction.ADJUST_BALANCE]: {
    label: "Баланс",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
};

function AuditActionBadge({ action }: { action: AuditAction }) {
  const cfg = actionConfig[action];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

function hasDiffData(row: AuditLogResponse): boolean {
  return row.oldData != null || row.newData != null;
}

function AuditClient({ initialData, initialMeta }: AuditClientProps) {
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState<AuditAction | undefined>(undefined);
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedEntityType = useDebounce(entityType, 400);
  const debouncedUserId = useDebounce(userId, 400);

  const auditQuery = useAdminAudit(
    {
      entityType: debouncedEntityType,
      action,
      userId: debouncedUserId,
      page,
      pageSize: 25,
    },
    page === 1 && !debouncedEntityType && !action && !debouncedUserId
      ? { data: initialData, meta: initialMeta }
      : undefined,
  );

  const rows = auditQuery.data?.data ?? [];
  const meta = auditQuery.data?.meta ?? initialMeta;

  function toggleExpand(id: string): void {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const columns = useMemo<Array<ColumnDef<AuditLogResponse>>>(
    () => [
      {
        id: "action",
        header: "Действие",
        meta: { className: "w-[180px]" },
        cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
      },
      {
        id: "object",
        header: "Объект",
        cell: ({ row }) => (
          <div className="space-y-1">
            <span>{row.original.entityType}</span>
            <span className="block text-xs text-[--color-foreground-muted]">
              {`${row.original.entityId.slice(0, 8)}…`}
            </span>
          </div>
        ),
      },
      {
        id: "user",
        header: "Пользователь",
        meta: { className: "w-[130px]" },
        cell: ({ row }) => (
          <span className="text-sm text-[--color-foreground-muted]">
            {`${row.original.userId.slice(0, 8)}…`}
          </span>
        ),
      },
      {
        id: "data",
        header: "Данные",
        meta: { className: "w-[120px]" },
        cell: ({ row }) =>
          hasDiffData(row.original) ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-[--color-foreground-muted] hover:text-[--color-foreground]"
              onClick={() => toggleExpand(row.original.id)}
            >
              {expandedId === row.original.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {expandedId === row.original.id ? "Скрыть" : "Показать"}
            </Button>
          ) : (
            <span className="text-sm text-[--color-foreground-muted]">—</span>
          ),
      },
      {
        id: "createdAt",
        header: "Дата",
        meta: { className: "w-[160px]" },
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString("ru"),
      },
    ],
    [expandedId],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аудит"
        description="Журнал действий администраторов"
        action={
          <span className="text-sm text-[--color-foreground-muted]">
            Всего: {meta.total}
          </span>
        }
      />

      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
        <Input
          placeholder="Тип объекта"
          value={entityType}
          onChange={(event) => {
            setEntityType(event.target.value);
            setExpandedId(null);
            setPage(1);
          }}
        />

        <Select
          value={action ?? "ALL"}
          onValueChange={(value) => {
            setAction(value === "ALL" ? undefined : (value as AuditAction));
            setExpandedId(null);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Действие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все</SelectItem>
            <SelectItem value={AuditAction.CREATE}>CREATE</SelectItem>
            <SelectItem value={AuditAction.UPDATE}>UPDATE</SelectItem>
            <SelectItem value={AuditAction.DELETE}>DELETE</SelectItem>
            <SelectItem value={AuditAction.REORDER}>REORDER</SelectItem>
            <SelectItem value={AuditAction.HIDE}>HIDE</SelectItem>
            <SelectItem value={AuditAction.MODERATE_GALLERY}>
              MODERATE_GALLERY
            </SelectItem>
            <SelectItem value={AuditAction.UPDATE_SEO}>UPDATE_SEO</SelectItem>
            <SelectItem value={AuditAction.CHANGE_ROLE}>CHANGE_ROLE</SelectItem>
            <SelectItem value={AuditAction.ADJUST_BALANCE}>ADJUST_BALANCE</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="UserId"
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);
            setExpandedId(null);
            setPage(1);
          }}
        />
      </div>

      {!auditQuery.isLoading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Receipt className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">Записей аудита не найдено</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={auditQuery.isLoading}
          getRowKey={(row) => row.id}
          expandedRowKey={expandedId}
          renderExpandedRow={(row) => (
            <div className="space-y-3">
              <p className="text-sm">Данные изменения</p>
              <div className="grid gap-3 md:grid-cols-2">
                {row.oldData != null ? (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                      До
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-[--radius-md] bg-black/20 p-3 font-mono text-xs text-[--color-foreground-muted]">
                      {JSON.stringify(row.oldData, null, 2)}
                    </pre>
                  </div>
                ) : null}

                {row.newData != null ? (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                      После
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-[--radius-md] bg-black/20 p-3 font-mono text-xs text-[--color-foreground-muted]">
                      {JSON.stringify(row.newData, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[--color-foreground-muted]">Всего: {meta.total}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => {
              setExpandedId(null);
              setPage((prev) => prev - 1);
            }}
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
            onClick={() => {
              setExpandedId(null);
              setPage((prev) => prev + 1);
            }}
          >
            Следующая
          </Button>
        </div>
      </div>
    </div>
  );
}

export { AuditClient };
export default AuditClient;
