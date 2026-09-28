import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BillingClient from "@/components/admin/billing/BillingClient";
import {
  API_ROUTES,
  type BillingPlanResponse,
  type PaginatedResponse,
  type TokenTransactionResponse,
} from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  const cookieStore = await cookies();
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("API_URL is not set");
  }

  const [transactionsRes, plansRes] = await Promise.all([
    fetch(`${apiUrl}${API_ROUTES.ADMIN_BILLING_TRANSACTIONS}?pageSize=25`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
    fetch(`${apiUrl}${API_ROUTES.ADMIN_BILLING_PLANS}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    }),
  ]);

  if (transactionsRes.status === 401 || plansRes.status === 401) {
    redirect("/?auth=1");
  }

  if (transactionsRes.status === 403 || plansRes.status === 403) {
    redirect("/403");
  }

  if (!transactionsRes.ok) {
    throw new Error("Failed to load admin billing transactions");
  }

  if (!plansRes.ok) {
    throw new Error(
      `Failed to load admin billing plans (status: ${plansRes.status})`,
    );
  }

  const transactionsResult =
    (await transactionsRes.json()) as PaginatedResponse<TokenTransactionResponse>;
  const plansResult = (await plansRes.json()) as {
    data: BillingPlanResponse[];
  };

  return (
    <BillingClient
      initialData={transactionsResult.data}
      initialMeta={transactionsResult.meta}
      initialPlans={plansResult.data}
    />
  );
}
