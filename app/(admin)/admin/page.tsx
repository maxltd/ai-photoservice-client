import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, Activity, Coins, CheckCircle2 } from "lucide-react";
import {
  API_ROUTES,
  Role,
  type ApiResponseWithoutMeta,
  type DailyStatsDto,
  type OverviewStatsDto,
} from "@/lib/api/contract";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { OrdersChart } from "@/components/admin/dashboard/OrdersChart";
import { TokensChart } from "@/components/admin/dashboard/TokensChart";
import { TopContentTable } from "@/components/admin/dashboard/TopContentTable";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard | Admin",
    description: "Статистика админ-панели AI Photo Studio",
  };
}

async function fetchServerData<T>(path: string): Promise<T> {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      cookie: (await cookies()).toString(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return (await response.json()) as T;
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (user.role === Role.CONTENT_MANAGER) {
    redirect("/admin/categories");
  }

  const [overviewRes, dailyRes] = await Promise.all([
    fetchServerData<ApiResponseWithoutMeta<OverviewStatsDto>>(
      API_ROUTES.ADMIN_STATS_OVERVIEW,
    ),
    fetchServerData<ApiResponseWithoutMeta<DailyStatsDto[]>>(
      `${API_ROUTES.ADMIN_STATS_DAILY}?days=30`,
    ),
  ]);

  const overview = overviewRes.data;
  const daily = dailyRes.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Всего пользователей"
          value={overview.totalUsers}
          description={`+${overview.newUsersToday} за сегодня`}
          icon={Users}
        />
        <StatsCard
          title="Активных заказов"
          value={overview.activeOrders}
          description="Заказы в обработке"
          icon={Activity}
        />
        <StatsCard
          title="Токенов списано сегодня"
          value={overview.tokensChargedToday}
          description={`Всего: ${overview.totalTokensCharged}`}
          icon={Coins}
        />
        <StatsCard
          title="Завершено сегодня"
          value={overview.completedOrdersToday}
          description={`Ошибки: ${overview.failedOrdersToday}`}
          icon={CheckCircle2}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <OrdersChart data={daily} />
        <TokensChart data={daily} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TopContentTable
          title="Топ-5 пресетов"
          rows={overview.topPresets.slice(0, 5)}
          hrefBuilder={(slug) => `/admin/presets?slug=${slug}`}
        />
        <TopContentTable
          title="Топ-5 фотосессий"
          rows={overview.topPhotoSessions.slice(0, 5)}
          hrefBuilder={(slug) => `/admin/sessions?slug=${slug}`}
        />
      </section>
    </div>
  );
}
