import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/checkAuth";
import { AdminPanel } from "@/components/admin/admin-panel";
import type { Metadata } from "next";

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

  return (
    <div className="mx-auto flex flex-col h-screen">
      <AdminPanel />
      {children}
    </div>
  );
}
