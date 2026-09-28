"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Camera,
  FolderTree,
  FileText,
  GalleryVerticalEnd,
  Gauge,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Receipt,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { Role } from "@/lib/api/contract";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  role: Role;
  user?: {
    name: string;
    email: string;
    image: string | null;
  };
  onNavigate?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: Gauge,
        roles: [Role.ADMIN],
      },
    ],
  },
  {
    title: "КОНТЕНТ",
    items: [
      {
        title: "Категории",
        href: "/admin/categories",
        icon: FolderTree,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Пресеты",
        href: "/admin/presets",
        icon: BookOpen,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Фотосессии",
        href: "/admin/sessions",
        icon: Camera,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
    ],
  },
  {
    title: "ПУБЛИКАЦИИ",
    items: [
      {
        title: "Идеи фотосессий",
        href: "/admin/ideas",
        icon: Camera,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Стили фотосессий",
        href: "/admin/styles",
        icon: Camera,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Блог",
        href: "/admin/blog",
        icon: BookOpen,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Nano Banana",
        href: "/admin/nano-banana",
        icon: Sparkles,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Инструменты",
        href: "/admin/ai-tools",
        icon: Sparkles,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Галерея",
        href: "/admin/gallery",
        icon: GalleryVerticalEnd,
        roles: [Role.ADMIN],
      },
      {
        title: "FAQ",
        href: "/admin/faq",
        icon: FileText,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Правила",
        href: "/admin/rules",
        icon: FileText,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
    ],
  },
  {
    title: "ГЛАВНАЯ СТРАНИЦА",
    items: [
      {
        title: "Отзывы",
        href: "/admin/homepage/testimonials",
        icon: MessageCircle,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "FAQ",
        href: "/admin/homepage/faq",
        icon: FileText,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
    ],
  },
  {
    title: "ПОЛЬЗОВАТЕЛИ",
    items: [
      {
        title: "Пользователи",
        href: "/admin/users",
        icon: Users,
        roles: [Role.ADMIN],
      },
      {
        title: "Жалобы",
        href: "/admin/reports",
        icon: Shield,
        roles: [Role.ADMIN],
      },
      {
        title: "Обратная связь",
        href: "/admin/feedback",
        icon: LifeBuoy,
        roles: [Role.ADMIN],
      },
    ],
  },
  {
    title: "СИСТЕМА",
    items: [
      {
        title: "Биллинг",
        href: "/admin/billing",
        icon: Wallet,
        roles: [Role.ADMIN],
      },
      {
        title: "Страница цен",
        href: "/admin/prices",
        icon: Wallet,
        roles: [Role.ADMIN, Role.CONTENT_MANAGER],
      },
      {
        title: "Настройки",
        href: "/admin/settings",
        icon: Settings,
        roles: [Role.ADMIN],
      },
      {
        title: "Аудит",
        href: "/admin/audit",
        icon: Receipt,
        roles: [Role.ADMIN],
      },
    ],
  },
];

function isRouteActive(currentPath: string, href: string): boolean {
  if (href === "/admin") {
    return currentPath === "/admin";
  }

  return currentPath.startsWith(href);
}

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

export function AdminSidebar({ role, user, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    await signOut();
    router.push("/?auth=1");
    router.refresh();
  }

  return (
    <aside className="flex h-full flex-col bg-surface">
      <div className="h-14 border-b border-border px-4 flex items-center">
        <Link
          href="/admin"
          className="text-sm font-semibold tracking-wide text-foreground"
          onClick={onNavigate}
        >
          AI Photo Studio
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(role),
          );

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-2 text-xs uppercase tracking-widest text-foreground-muted">
                {group.title}
              </p>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const active = isRouteActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-transparent text-foreground-muted hover:bg-white/5 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {user ? (
        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.image ?? ""} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-foreground-muted">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
