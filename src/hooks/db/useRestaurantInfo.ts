"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug } from "@/lib/utils";
import { useEffect } from "react";

export function useRestaurantInfo(tenantSlug: string | undefined) {
  const queryClient = useQueryClient();

  const fetchInfo = async () => {
    if (!tenantSlug) return null;

    const tenantId = await fetchTenantIdBySlug(tenantSlug);

    const { data, error } = await supabase
      .from("snack_bite_restaurant_info")
      .select("*")
      .eq("tenant_id", tenantId)
      .single(); // only one record per tenant

    if (error && error.code !== "PGRST116") throw error;
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant-info", tenantSlug],
    queryFn: fetchInfo,
    enabled: !!tenantSlug,
  });

  // Realtime subscription
  useEffect(() => {
    if (!tenantSlug) return;

    const channel = supabase
      .channel(`restaurant-info-${tenantSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "snack_bite_restaurant_info",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["restaurant-info", tenantSlug],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantSlug, queryClient]);

  return { data, isLoading };
}
