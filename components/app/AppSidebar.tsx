"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  CircleUser,
  FileText,
  Flame,
  Gift,
  MapPin,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { API_ROUTES, type GetMeResponse } from "@/lib/api/contract";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SIDEBAR_ITEMS_PRIMARY: SidebarItem[] = [
  { href: "/app/create", label: "Создание", icon: Flame },
  { href: "/app/gallery", label: "Мои фото", icon: MapPin },
  { href: "/app/sessions", label: "Фотосессия", icon: Camera },
];

function isPrimaryCreateActive(pathname: string, href: string): boolean {
  if (href === "/app/create") {
    if (pathname === "/app/create") {
      return true;
    }

    return (
      pathname.startsWith("/app/create/") &&
      !pathname.startsWith("/app/create/prompt")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  const meQuery = useQuery({
    queryKey: ["app", "me", "sidebar", "users-me"],
    queryFn: () =>
      apiGet<{ data: GetMeResponse }>(API_ROUTES.USERS_ME).then(
        (response) => response.data,
      ),
    staleTime: 60_000,
  });

  const balance = meQuery.data?.balance ?? 0;

  return (
    <div className="flex h-full flex-col bg-[--color-surface] p-4">
      <Link
        href="/app/create"
        className="mb-4 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-base font-semibold text-foreground"
      >
        <Sparkles className="h-4 w-4 text-[--color-secondary]" />
        Нейрофото
      </Link>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/app/create"
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[image:radial-gradient(circle_at_0%_0%,rgba(132,60,255,1)_0%,rgba(48,249,242,1)_100%)] px-4 text-[15px] font-semibold text-[--color-foreground]"
          >
            <Plus className="h-5 w-5" />
            Создать фото
          </Link>

          <div className="space-y-1 rounded-2xl bg-white/4 p-1">
            {SIDEBAR_ITEMS_PRIMARY.map((item) => {
              const Icon = item.icon;
              const active = isPrimaryCreateActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] transition-colors",
                    active
                      ? "bg-white/8 text-foreground"
                      : "text-white/75 hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 rounded-2xl bg-white/4 p-1">
            <Link
              href="/app/create/prompt"
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] transition-colors",
                pathname === "/app/create/prompt" ||
                  pathname.startsWith("/app/create/prompt/")
                  ? "bg-white/8 text-foreground"
                  : "text-white/75 hover:bg-white/5 hover:text-foreground",
              )}
            >
              <FileText className="h-5 w-5" />
              <span>Промпт из фото</span>
            </Link>

            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] text-white/75 transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Send className="h-5 w-5" />
              <span>Подписаться в Telegram</span>
            </a>

            <Link
              href="/app/profile?panel=invite"
              className="flex h-11 items-center gap-3 rounded-xl px-4 text-[15px] text-white/75 transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <Gift className="h-5 w-5" />
              <span>Пригласить друга</span>
            </Link>
          </div>
        </div>

        <Link
          href="/app/profile"
          className="rounded-2xl bg-white/4 p-1 transition-colors hover:bg-white/5"
        >
          <div className="flex items-center gap-3 rounded-full px-4 py-3">
            <CircleUser className="h-5 w-5 text-white/75" />
            <span className="flex-1 text-[15px] text-white/75">Профиль</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1 text-[15px] font-semibold text-foreground">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-[color:var(--color-token)]"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M4 7.25A2.25 2.25 0 0 1 6.25 5h11.5A2.25 2.25 0 0 1 20 7.25v2.2a1.8 1.8 0 1 0 0 3.6v2.2a2.25 2.25 0 0 1-2.25 2.25H6.25A2.25 2.25 0 0 1 4 15.25v-2.2a1.8 1.8 0 0 0 0-3.6v-2.2Z"
                />
                <path
                  d="M12 7.5v9"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="1.25 1.6"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>
              {balance}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
