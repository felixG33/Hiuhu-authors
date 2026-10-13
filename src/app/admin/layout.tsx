import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canAccessAdmin(user)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-parchment-100/50 dark:bg-ink-950 flex flex-col md:flex-row font-sans text-ink-950 dark:text-parchment-50 antialiased">
      {/* Sidebar */}
      <AdminSidebar userRole={user.role} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <AdminHeader
          user={user}
          onToggleSidebar={() => {
            // Handled via client trigger in header
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
