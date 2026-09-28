"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  CircleUser,
  CreditCard,
  Images,
  LogOut,
  MessageCircle,
  Sparkles,
  Ticket,
} from "lucide-react";
import { apiGet } from "@/lib/api/client";
import { signOut, useSession } from "@/lib/auth-client";
import { API_ROUTES, type GetMeResponse } from "@/lib/api/contract";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";

function getInitials(name: string | undefined): string {
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

export function MorePageClient() {
  const router = useRouter();
  const session = useSession();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const meQuery = useQuery({
    queryKey: ["app", "me"],
    queryFn: () => apiGet<{ data: GetMeResponse }>(API_ROUTES.AUTH_ME),
  });

  const user = meQuery.data?.data ?? null;
  const profileName = user?.name ?? session.data?.user?.name ?? "Пользователь";
  const profileEmail = user?.email ?? session.data?.user?.email ?? "";
  const profileImage = session.data?.user?.image ?? null;
  const balance = user?.balance ?? 0;

  async function handleLogout(): Promise<void> {
    await signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-3 py-4 md:px-6 md:py-8">
      <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-[--color-background]/40 p-3">
          <Avatar className="h-14 w-14 border-border/70">
            <AvatarImage src={profileImage ?? ""} alt={profileName} />
            <AvatarFallback>{getInitials(profileName)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {profileName}
            </p>
            <p className="truncate text-sm text-[--color-foreground-muted]">
              {profileEmail}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-[--color-background] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-[--color-foreground-muted]">
              Баланс
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground">
              <Ticket className="h-4 w-4 text-[--color-token]" />
              {balance}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-1 border-t border-border pt-4">
          <Link
            href="/app/profile"
            className="flex items-center justify-between rounded-lg px-2 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-3">
              <CircleUser className="h-4 w-4 text-[--color-foreground-muted]" />
              Профиль
            </span>
            <ChevronRight className="h-4 w-4 text-[--color-foreground-muted]" />
          </Link>

          <Link
            href="/app/billing"
            className="flex items-center justify-between rounded-lg px-2 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-[--color-foreground-muted]" />
              Пополнить баланс
            </span>
            <ChevronRight className="h-4 w-4 text-[--color-foreground-muted]" />
          </Link>

          <Link
            href="/app/gallery"
            className="flex items-center justify-between rounded-lg px-2 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-3">
              <Images className="h-4 w-4 text-[--color-foreground-muted]" />
              Мои работы
            </span>
            <ChevronRight className="h-4 w-4 text-[--color-foreground-muted]" />
          </Link>

          <Link
            href="/app/profile#ai"
            className="flex items-center justify-between rounded-lg px-2 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[--color-foreground-muted]" />
              AI-профиль
            </span>
            <ChevronRight className="h-4 w-4 text-[--color-foreground-muted]" />
          </Link>

          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left text-sm text-foreground transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-[--color-foreground-muted]" />
              Написать в поддержку
            </span>
            <ChevronRight className="h-4 w-4 text-[--color-foreground-muted]" />
          </button>

          <button
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left text-sm text-[--color-danger] transition-colors hover:bg-white/5"
          >
            <span className="inline-flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              Выйти
            </span>
          </button>
        </div>
      </div>

      <FeedbackSheet
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        userEmail={profileEmail || undefined}
      />
    </section>
  );
}
