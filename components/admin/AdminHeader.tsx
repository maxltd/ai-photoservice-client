"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, Menu, User } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Role } from "@/lib/api/contract";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    image: string | null;
    role: Role;
  };
}

const breadcrumbLabels: Record<string, string> = {
  admin: "Dashboard",
  categories: "Категории",
  presets: "Пресеты",
  sessions: "Фотосессии",
  cms: "CMS-страницы",
  faq: "FAQ",
  ideas: "Идеи фотосессий",
  styles: "Стили фотосессий",
  blog: "Блог",
  "nano-banana": "Nano Banana",
  gallery: "Галерея",
  users: "Пользователи",
  reports: "Жалобы",
  feedback: "Обратная связь",
  homepage: "Главная страница",
  testimonials: "Отзывы",
  billing: "Биллинг",
  settings: "Настройки",
  audit: "Аудит",
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

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        href,
        label: breadcrumbLabels[segment] ?? segment,
      };
    });
  }, [pathname]);

  async function handleLogout(): Promise<void> {
    await signOut();
    router.push("/?auth=1");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Открыть меню"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <AdminSidebar
                role={user.role}
                user={{ name: user.name, email: user.email, image: user.image }}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={crumb.href} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <ChevronRight className="h-3.5 w-3.5 text-foreground-muted" />
                  ) : null}
                  {isLast ? (
                    <span className="font-medium text-foreground">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-foreground-muted hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto px-2 py-1.5">
              <Avatar>
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-foreground-muted">{user.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="gap-2">
                <User className="h-4 w-4" />
                Профиль
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => void handleLogout()}
              className="gap-2 text-danger focus:text-danger"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
