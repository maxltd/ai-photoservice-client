import Image from "next/image";
import { Gift, Ticket } from "lucide-react";
import type { BillingPlanResponse } from "@/lib/api/contract";
import { PricingPurchaseButton } from "@/components/pricing/PricingPurchaseButton";

interface Props {
  plans: BillingPlanResponse[];
}

const PRICE_IMAGES: Record<number, string> = {
  50: "/images/funds/price-1.png",
  100: "/images/funds/price-2.png",
  500: "/images/funds/price-3.png",
};

function VerifyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-0.5 h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path
        d="m21.56 10.739-1.36-1.58c-.26-.3-.47-.86-.47-1.26v-1.7c0-1.06-.87-1.93-1.93-1.93h-1.7c-.39 0-.96-.21-1.26-.47l-1.58-1.36c-.69-.59-1.82-.59-2.52 0l-1.57 1.37c-.3.25-.87.46-1.26.46H6.18c-1.06 0-1.93.87-1.93 1.93v1.71c0 .39-.21.95-.46 1.25l-1.35 1.59c-.58.69-.58 1.81 0 2.5l1.35 1.59c.25.3.46.86.46 1.25v1.71c0 1.06.87 1.93 1.93 1.93h1.73c.39 0 .96.21 1.26.47l1.58 1.36c.69.59 1.82.59 2.52 0l1.58-1.36c.3-.26.86-.47 1.26-.47h1.7c1.06 0 1.93-.87 1.93-1.93v-1.7c0-.39.21-.96.47-1.26l1.36-1.58c.58-.69.58-1.83-.01-2.52Zm-5.4-.63-4.83 4.83a.75.75 0 0 1-1.06 0l-2.42-2.42a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l1.89 1.89 4.3-4.3c.29-.29.77-.29 1.06 0  .29.29.29.77 0 1.06Z"
        fill="var(--color-profile-link)"
      />
    </svg>
  );
}

export function PricingCards({ plans }: Props) {
  if (plans.length === 0) {
    return (
      <p className="rounded-[--radius-md] border border-dashed border-border p-6 text-center text-foreground-muted">
        Тарифы пока не настроены.
      </p>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-3">
      {plans.map((plan, index) => {
        const bonus = Math.ceil(plan.tickets * 0.1);
        const imageSrc =
          PRICE_IMAGES[plan.tickets] ??
          `/images/funds/price-${Math.min(index + 1, 3)}.png`;

        return (
          <article
            key={plan.id}
            className="flex min-h-[874px] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black px-6 pb-6 md:min-h-[778px] md:rounded-[36px]"
          >
            <div className="relative h-[210px] w-full shrink-0 overflow-hidden rounded-b-2xl bg-black">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[-12px] h-[218px] w-[218px] -translate-x-1/2 rounded-2xl bg-[image:var(--gradient-pricing-glow)] opacity-60 blur-[50px]"
              />
              <Image
                src={imageSrc}
                alt={`${plan.tickets} тикетов`}
                fill
                sizes="(min-width: 1280px) 33vw, 100vw"
                className="relative z-10 object-contain"
              />
            </div>

            <div className="mt-0 flex min-h-0 flex-1 flex-col gap-6">
              <div className="flex h-[552px] min-h-0 flex-1 flex-col items-stretch justify-center gap-3 rounded-2xl bg-pricing-panel bg-[image:var(--gradient-pricing-panel)] p-4 md:h-[456px] md:min-h-[456px]">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[32px] font-medium leading-9 tracking-[-0.02em] text-white">
                    {plan.price} ₽
                  </p>
                  <span className="inline-flex h-7 min-w-[47px] shrink-0 items-center justify-center gap-1 rounded-full bg-pricing-panel bg-[image:var(--gradient-pricing-badge)] px-1.5 py-0.5 text-base leading-6 text-white">
                    <Ticket className="h-3 w-3 text-token" />
                    {plan.tickets}
                  </span>
                </div>

                <div className="h-px w-full bg-white/[0.08]" />

                <div className="space-y-2">
                  <h2 className="text-xl font-medium leading-7 text-white">
                    Что вы получите:
                  </h2>
                  <ul className="space-y-2 text-base leading-6 text-white/[0.8]">
                    {plan.whatYouGet.map((item, itemIndex) => (
                      <li
                        key={`${plan.id}-get-${itemIndex}`}
                        className="flex items-start gap-1.5"
                      >
                        <VerifyIcon />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.included.length > 0 ? (
                  <div className="space-y-2">
                    <h2 className="text-xl font-medium leading-7 text-white">
                      Включено:
                    </h2>
                    <ul className="space-y-2 text-base leading-6 text-white/[0.8]">
                      {plan.included.map((item, itemIndex) => (
                        <li
                          key={`${plan.id}-included-${itemIndex}`}
                          className="flex items-start gap-1.5"
                        >
                          <VerifyIcon />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-[image:var(--gradient-pricing-bonus)] px-3 py-2.5 text-base leading-6 text-white/80">
                  <Gift className="h-5 w-5 shrink-0 text-white" />
                  <span>{bonus} тикетов в подарок</span>
                </div>
              </div>

              <PricingPurchaseButton
                planId={plan.id}
                tickets={plan.tickets}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
