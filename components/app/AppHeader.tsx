"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, LogOut, Sparkles, Ticket, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "@/lib/auth-client";
import { apiGet } from "@/lib/api/client";
import { API_ROUTES, type GetMeResponse } from "@/lib/api/contract";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/app/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DESKTOP_NAV_LINKS = [
  { href: "/app/create", label: "Создание" },
  { href: "/app/sessions", label: "Фотосессия" },
  { href: "/app/gallery", label: "Мои работы" },
  { href: "/app/more", label: "Ещё" },
] as const;

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

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const user = session.data?.user;
  const isCreateScenario = pathname.startsWith("/app/create");
  const isSessionsRoute =
    pathname === "/app/sessions" || pathname.startsWith("/app/sessions/");
  const isGalleryRoute =
    pathname === "/app/gallery" || pathname.startsWith("/app/gallery/");

  const meQuery = useQuery({
    queryKey: ["app", "me", "header"],
    queryFn: () => apiGet<{ data: GetMeResponse }>(API_ROUTES.AUTH_ME),
    staleTime: 60_000,
  });

  const balance = meQuery.data?.data.balance ?? 0;

  async function handleLogout(): Promise<void> {
    await signOut();
    router.replace("/");
    router.refresh();
  }

  if (isSessionsRoute || isGalleryRoute) {
    return (
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[--color-background]/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex h-10 w-full max-w-md items-center justify-center px-3">
          <Link
            href="/app/create"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <Sparkles className="h-4 w-4 text-[--color-secondary]" />
            Нейрофото
          </Link>
        </div>
      </header>
    );
  }

  if (isCreateScenario) {
    return (
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[--color-background]/95 backdrop-blur-sm lg:hidden">
        <div className="relative mx-auto flex h-10 w-full max-w-md items-center justify-center px-3">
          <Link
            href="/app/create"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <Sparkles className="h-4 w-4 text-[--color-secondary]" />
            Нейрофото
          </Link>

          <div className="absolute right-3 inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-xs text-white/75">
            <Ticket className="h-3.5 w-3.5 text-[--color-token]" />
            <span>{balance}</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-[--color-background]/95 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-10 w-full max-w-6xl items-center justify-between px-4 md:h-14 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/app/create"
            className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-foreground md:text-base"
          >
            <Sparkles className="h-4 w-4 text-[--color-secondary]" />
            Нейрофото
          </Link>

          <nav className="hidden items-center gap-5 md:flex lg:hidden">
            {DESKTOP_NAV_LINKS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm transition-colors",
                    active
                      ? "text-foreground"
                      : "text-[--color-foreground-muted] hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-[--color-foreground-muted] sm:inline-flex">
            <Ticket className="h-3.5 w-3.5 text-[--color-token]" />
            <span>{balance}</span>
          </div>
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full md:h-9 md:w-9"
                aria-label="Профиль"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image ?? ""}
                    alt={user?.name ?? "Профиль"}
                  />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">
                  {user?.name ?? "Пользователь"}
                </p>
                <p className="text-xs text-[--color-foreground-muted]">
                  {user?.email ?? ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/profile" className="gap-2">
                  <User className="h-4 w-4" />
                  Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/billing" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Пополнение
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => void handleLogout()}
                className="gap-2 text-[--color-danger] focus:text-[--color-danger]"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
