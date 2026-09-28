"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { DataTable } from "@/components/admin/common/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Role,
  UserStatus,
  type AdminUserListItemDto,
  type PaginationMeta,
} from "@/lib/api/contract";
import { useAdminUsers } from "@/lib/hooks/users/useAdminUsers";
import { cn } from "@/lib/utils";

interface UsersClientProps {
  initialData: AdminUserListItemDto[];
  initialMeta: PaginationMeta;
}

const roleConfig: Record<Role, { label: string; className: string }> = {
  [Role.USER]: {
    label: "Пользователь",
    className: "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
  },
  [Role.CONTENT_MANAGER]: {
    label: "Контент",
    className:
      "bg-[--color-secondary]/10 text-[--color-secondary] border-[--color-secondary]/20",
  },
  [Role.ADMIN]: {
    label: "Администратор",
    className:
      "bg-[--color-primary]/10 text-[--color-primary] border-[--color-primary]/20",
  },
};

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  [UserStatus.ACTIVE]: {
    label: "Активен",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
  [UserStatus.BLOCKED]: {
    label: "Заблокирован",
    className:
      "bg-[--color-danger]/10 text-[--color-danger] border-[--color-danger]/20",
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

function UserStatusBadge({ status }: { status: UserStatus }) {
  const cfg = statusConfig[status];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

export function UsersClient({ initialData, initialMeta }: UsersClientProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [status, setStatus] = useState<UserStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const usersQuery = useAdminUsers(
    {
      search,
      role,
      status,
      page,
      pageSize: 20,
    },
    page === 1 && !search && !role && !status
      ? { data: initialData, meta: initialMeta }
      : undefined,
  );

  const rows = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta ?? initialMeta;

  const columns = useMemo<Array<ColumnDef<AdminUserListItemDto>>>(
    () => [
      {
        id: "user",
        header: "Пользователь",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.image ?? ""} alt={row.original.name} />
              <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.name}</p>
              <p className="truncate text-xs text-[--color-foreground-muted]">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "role",
        header: "Роль",
        meta: { className: "w-[160px]" },
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        id: "status",
        header: "Статус",
        meta: { className: "w-[110px]" },
        cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
      },
      {
        id: "balance",
        header: "Баланс",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => `${row.original.balance} токенов`,
      },
      {
        id: "createdAt",
        header: "Дата рег.",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("ru"),
      },
      {
        id: "details",
        header: "",
        meta: { className: "w-[120px]" },
        cell: ({ row }) => (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${row.original.id}`}>Подробнее</Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пользователи"
        description="Управление ролями и просмотр активности"
        action={
          <span className="text-sm text-[--color-foreground-muted]">
            Всего: {meta.total}
          </span>
        }
      />

      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <Input
          placeholder="Поиск по email, имени..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <Select
          value={role ?? "ALL"}
          onValueChange={(value) => {
            setRole(value === "ALL" ? undefined : (value as Role));
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все роли</SelectItem>
            <SelectItem value={Role.USER}>USER</SelectItem>
            <SelectItem value={Role.CONTENT_MANAGER}>CONTENT_MANAGER</SelectItem>
            <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status ?? "ALL"}
          onValueChange={(value) => {
            setStatus(value === "ALL" ? undefined : (value as UserStatus));
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все статусы</SelectItem>
            <SelectItem value={UserStatus.ACTIVE}>ACTIVE</SelectItem>
            <SelectItem value={UserStatus.BLOCKED}>BLOCKED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!usersQuery.isLoading && rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Users className="h-10 w-10 text-[--color-foreground-muted]" />
          <p className="text-[--color-foreground-muted]">Пользователи не найдены</p>
        </div>
      ) : (
        <DataTable columns={columns} data={rows} isLoading={usersQuery.isLoading} />
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
    </div>
  );
}
