import { cookies } from "next/headers";
import { redirectToAuth } from "@/lib/auth/auth-redirect";
import {
  API_ROUTES,
  type ApiErrorResponse,
  type BillingPlanResponse,
  type PaginatedResponse,
  type TokenTransactionResponse,
} from "@/lib/api/contract";
import { toServerApiUrl } from "@/lib/api/server";
import { BillingPageClient } from "@/components/billing/BillingPageClient";

interface BillingBalance {
  balance: number;
  currency: "TOKEN";
}

interface BalanceApiResponse {
  data: BillingBalance;
}

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const [balanceRes, transactionsRes, plansRes] = await Promise.all([
    fetch(toServerApiUrl(API_ROUTES.BILLING_BALANCE), {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(
      toServerApiUrl(`${API_ROUTES.BILLING_TRANSACTIONS}?page=1&pageSize=20`),
      {
        headers: { cookie },
        cache: "no-store",
      },
    ),
    fetch(toServerApiUrl(API_ROUTES.BILLING_PLANS), {
      headers: { cookie },
      cache: "no-store",
    }),
  ]);

  if (
    balanceRes.status === 401 ||
    transactionsRes.status === 401 ||
    plansRes.status === 401
  ) {
    redirectToAuth("/app/billing");
  }

  if (!balanceRes.ok) {
    const errorPayload = (await balanceRes
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(
      `Failed to load billing balance (status: ${balanceRes.status}, code: ${errorPayload?.error?.code ?? "UNKNOWN"})`,
    );
  }

  if (!transactionsRes.ok) {
    const errorPayload = (await transactionsRes
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(
      `Failed to load billing transactions (status: ${transactionsRes.status}, code: ${errorPayload?.error?.code ?? "UNKNOWN"})`,
    );
  }

  if (!plansRes.ok) {
    const errorPayload = (await plansRes
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    throw new Error(
      `Failed to load billing plans (status: ${plansRes.status}, code: ${errorPayload?.error?.code ?? "UNKNOWN"})`,
    );
  }

  const balanceJson = (await balanceRes.json()) as BalanceApiResponse;
  const transactionsJson =
    (await transactionsRes.json()) as PaginatedResponse<TokenTransactionResponse>;
  const plansJson = (await plansRes.json()) as { data: BillingPlanResponse[] };

  return (
    <BillingPageClient
      initialBalance={balanceJson.data}
      initialTransactions={transactionsJson.data}
      initialMeta={transactionsJson.meta}
      initialPlans={plansJson.data}
    />
  );
}
