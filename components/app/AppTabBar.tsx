"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Flame, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS_APP: TabItem[] = [
  { href: "/app/create", label: "Создание", icon: Flame },
  { href: "/app/gallery", label: "Мои фото", icon: MapPin },
  { href: "/app/sessions", label: "Фотосессия", icon: Camera },
  { href: "/app/more", label: "Еще", icon: Plus },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/app/more") {
    return !["/app/create", "/app/sessions", "/app/gallery"].some(
      (basePath) =>
        pathname === basePath || pathname.startsWith(`${basePath}/`),
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppTabBar() {
  const pathname = usePathname();
  const tabs = TABS_APP;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-gradient-to-t from-black/90 to-black/5 px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto mt-2 w-full max-w-md rounded-full bg-black/60 p-1 backdrop-blur">
        <ul
          className={cn(
            "grid h-[59px] w-full",
            tabs.length === 4 ? "grid-cols-4" : "grid-cols-5",
          )}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActivePath(pathname, tab.href);

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    "mx-0.5 flex h-full flex-col items-center justify-center gap-1 rounded-full text-[11px] transition-colors",
                    active
                      ? "bg-white/8 text-foreground"
                      : "text-white/75 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-foreground" : "text-white/75",
                    )}
                  />
                  <span className="leading-none">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
