import AdminDashboard from "@/components/admin/AdminDashboard";
import { checkAuth } from "@/lib/checkAuth";

export default async function AdminPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const user = await checkAuth();
  const { tenantSlug } = await params;

  return <AdminDashboard user={user} tenantSlug={tenantSlug} />;
}
