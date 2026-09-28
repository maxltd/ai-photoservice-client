import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Role } from "@/lib/api/contract";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (user.role !== Role.ADMIN && user.role !== Role.CONTENT_MANAGER) {
    redirect("/403");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border lg:block">
        <AdminSidebar
          role={user.role}
          user={{ name: user.name, email: user.email, image: user.image }}
        />
      </aside>

      <div className="min-h-screen lg:pl-60">
        <AdminHeader
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          }}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
