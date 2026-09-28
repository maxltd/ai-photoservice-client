"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTabBar } from "@/components/app/AppTabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader =
    pathname === "/app/profile" || pathname === "/app/profile/";

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-foreground]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] bg-[--color-surface] lg:block">
        <AppSidebar />
      </aside>

      <div className="min-h-screen lg:pl-[280px]">
        {!hideHeader ? <AppHeader /> : null}
        <main className="mx-auto mt-1 flex w-full rounded-t-[24px] border-t border-border pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:mt-0 md:rounded-none md:border-t-0 md:bg-[--color-background] md:pb-0">
          {children}
        </main>
        <AppTabBar />
      </div>
    </div>
  );
}
