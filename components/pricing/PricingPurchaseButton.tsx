"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoginModal } from "@/components/auth/login-modal";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useTopup } from "@/lib/hooks/billing/useBilling";

interface Props {
  planId: string;
  tickets: number;
}

export function PricingPurchaseButton({ planId, tickets }: Props) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const topupMutation = useTopup();

  async function handleClick(): Promise<void> {
    if (isPending || topupMutation.isPending) return;
    if (!session?.user) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const payment = await topupMutation.mutateAsync({ billingPlanId: planId });
      window.location.assign(payment.paymentUrl);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        toast.error("Не удалось создать платёжную ссылку");
      }
    }
  }

  return (
    <>
      <Button
        type="button"
        className="h-16 w-full rounded-full bg-pricing-button bg-[image:var(--gradient-pricing-button)] bg-blend-color-dodge text-lg font-bold leading-6 text-white"
        disabled={isPending || topupMutation.isPending}
        onClick={() => void handleClick()}
      >
        Купить {tickets} тикетов
      </Button>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
