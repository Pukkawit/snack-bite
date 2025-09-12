import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTenantIdBySlug } from "@/lib/utils";

// Fetcher with tenant slug
const fetchMenuItems = async (tenantId: string) => {
  const { data, error } = await supabase
    .from("snack_bite_menu_items")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Hook
export function useMenuItemsQuery() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;
  const queryClient = useQueryClient();

  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["menuItems", tenantSlug], // ✅ cache per tenant
    queryFn: async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      return fetchMenuItems(tenantId);
    },
    enabled: !!tenantSlug, // ✅ only run when tenantSlug exists
  });

  // Function to invalidate + refetch
  const handleMenuItemsUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["menuItems", tenantSlug] });
  };

  return { menuItems, isLoading, isError, error, handleMenuItemsUpdate };
}
