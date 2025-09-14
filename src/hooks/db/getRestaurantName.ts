"use client";

import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

async function getRestaurantName(tenantSlug: string | undefined) {
  if (!tenantSlug) return null;

  const tenant_id = await fetchTenantIdBySlug(tenantSlug);

  // fetch profile → tenant_id
  const { data: restaurantInfo, error: restaurantInfoError } = await supabase
    .from("snack_bite_restaurant_info")
    .select("restaurant_name")
    .eq("tenant_id", tenant_id)
    .single();

  if (restaurantInfoError) throw restaurantInfoError;

  return restaurantInfo.restaurant_name;
}

export function useRestaurantName(tenant_id: string) {
  return useQuery({
    queryKey: ["restaurant_name", tenant_id],
    queryFn: () => getRestaurantName(tenant_id),
    enabled: !!tenant_id, // don’t run until we have a tenant_id
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchInterval(query) {
      return query?.state?.data ? false : 1000 * 60 * 60; // refetch every 5 minutes if no data
    },
    refetchIntervalInBackground: true,
  });
}
