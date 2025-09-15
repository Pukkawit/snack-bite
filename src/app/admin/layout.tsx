import type React from "react";
import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/checkAuth";
import { AdminPanel } from "@/components/admin/admin-panel";
import type { Metadata } from "next";
import { SuperAdminSidebar } from "@/components/admin/super-admin-sidebar";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";

export const metadata: Metadata = {
  title: "SnackBite Admin - Manage Your Restaurant",
  description: "Admin dashboard for SnackBite restaurant.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await checkAuth();

  if (!user) {
    redirect("/auth/login");
  }

  const superAdmin =
    user?.id === process.env.NEXT_PUBLIC_DEFAULT_BOSS_SUPABASE_UID;

  return (
    <div className="mx-auto flex flex-col h-screen">
      <div className="fixed top-0 left-0 right-0 z-40">
        <AdminPanel />
      </div>

      <div className="flex pt-[88px]">
        {superAdmin && <SuperAdminSidebar />}
        <div
          className={`flex flex-1 flex-col min-h-screen ${
            superAdmin ? "md:ml-64" : ""
          }`}
        >
          {children}
        </div>
      </div>
      {superAdmin && <MobileAdminNav />}
    </div>
  );
}
