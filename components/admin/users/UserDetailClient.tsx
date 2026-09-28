"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ban } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OrderSourceType,
  OrderStatus,
  Role,
  UserStatus,
  type AdminUserDetailDto,
} from "@/lib/api/contract";
import {
  useAdminUserById,
  useUpdateUserRole,
} from "@/lib/hooks/users/useAdminUsers";
import { cn } from "@/lib/utils";

interface UserDetailClientProps {
  initialData: AdminUserDetailDto;
}

const roleConfig: Record<Role, { label: string; className: string }> = {
  [Role.USER]: {
    label: "Пользователь",
    className:
      "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
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

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  [OrderStatus.PENDING]: {
    label: "Ожидает",
    className:
      "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  },
  [OrderStatus.PROCESSING]: {
    label: "В обработке",
    className:
      "bg-[--color-secondary]/10 text-[--color-secondary] border-[--color-secondary]/20",
  },
  [OrderStatus.COMPLETED]: {
    label: "Завершён",
    className:
      "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  },
  [OrderStatus.FAILED]: {
    label: "Ошибка",
    className:
      "bg-[--color-danger]/10 text-[--color-danger] border-[--color-danger]/20",
  },
  [OrderStatus.CANCELLED]: {
    label: "Отменён",
    className:
      "bg-white/5 text-[--color-foreground-muted] border-[--color-border]",
  },
};

function getInitials(name?: string | null): string {
  if (!name) {
    return "U";
  }

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
  const cfg = roleConfig[role] ?? roleConfig[Role.USER];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

function UserStatusBadge({ status }: { status: UserStatus }) {
  const cfg = statusConfig[status] ?? statusConfig[UserStatus.ACTIVE];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg =
    orderStatusConfig[status] ?? orderStatusConfig[OrderStatus.PENDING];
  return <Badge className={cn("border", cfg.className)}>{cfg.label}</Badge>;
}

export function UserDetailClient({ initialData }: UserDetailClientProps) {
  const userQuery = useAdminUserById(initialData.id);
  const user = userQuery.data ?? initialData;

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { mutateAsync: updateRole, isPending } = useUpdateUserRole(user.id);
  const currentRole = user.role;
  const effectiveSelectedRole = selectedRole ?? currentRole;

  const displayName =
    typeof user.name === "string" && user.name.trim().length > 0
      ? user.name
      : user.email;

  const recentOrders = Array.isArray(user.recentOrders)
    ? user.recentOrders
    : [];

  const stats = useMemo(
    () => [
      { label: "Всего заказов", value: user.totalOrders },
      { label: "Потрачено токенов", value: user.totalTokensSpent },
      { label: "Баланс", value: `${user.balance} токенов` },
    ],
    [user.balance, user.totalOrders, user.totalTokensSpent],
  );

  async function handleSaveRole(): Promise<void> {
    await updateRole(effectiveSelectedRole);
    setSelectedRole(null);
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/admin/users">← К пользователям</Link>
      </Button>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? ""} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-2">
              <h1 className="truncate text-xl font-semibold">{displayName}</h1>
              <p className="truncate text-[--color-foreground-muted]">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={currentRole} />
                <UserStatusBadge status={user.status} />
              </div>
              <p className="text-sm text-[--color-foreground-muted]">
                Зарегистрирован:{" "}
                {new Date(user.createdAt).toLocaleDateString("ru")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4"
            >
              <p className="text-sm text-[--color-foreground-muted]">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-[--color-foreground]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4">
        <h2 className="text-base font-semibold">Управление</h2>

        <div className="grid gap-3 md:grid-cols-[260px_auto] md:items-center">
          <Select
            value={effectiveSelectedRole}
            onValueChange={(v) => setSelectedRole(v as Role)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Role.USER}>USER</SelectItem>
              <SelectItem value={Role.CONTENT_MANAGER}>
                CONTENT_MANAGER
              </SelectItem>
              <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => void handleSaveRole()}
            disabled={effectiveSelectedRole === currentRole || isPending}
          >
            Сохранить
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            disabled
            className="cursor-not-allowed text-[--color-danger] opacity-40"
          >
            <Ban className="mr-2 h-4 w-4" />
            {user.status === UserStatus.BLOCKED
              ? "Разблокировать"
              : "Заблокировать"}
          </Button>
          <p className="text-xs text-[--color-foreground-muted]">
            Управление блокировкой реализуется — доступно позже.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] p-4">
        <h2 className="text-base font-semibold">Последние заказы</h2>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-[--color-foreground-muted]">
            Заказов пока нет
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[--color-border]">
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                    Тип
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                    Стоимость
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                    Статус
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-[--color-foreground-muted]">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[--color-border] last:border-0"
                  >
                    <td className="px-3 py-2 text-[--color-foreground-muted]">
                      {`${order.id.slice(0, 8)}…`}
                    </td>
                    <td className="px-3 py-2">
                      {order.sourceType === OrderSourceType.PRESET
                        ? "Пресет"
                        : "Фотосессия"}
                    </td>
                    <td className="px-3 py-2">{order.totalCost} токенов</td>
                    <td className="px-3 py-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2">
                      {new Date(order.createdAt).toLocaleDateString("ru")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
