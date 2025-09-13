"use client";

import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

async function getRestaurantName(userId: string) {
  // fetch profile → tenant_id
  /*  const { data: profile, error: profileError } = await supabase
    .from("snack_bite_profile")
    .select("tenant_id")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError; */

  // fetch tenant → restaurant_name
  const { data: tenant, error: tenantError } = await supabase
    .from("snack_bite_tenants")
    .select("restaurant_name")
    .eq("id", userId)
    .single();

  if (tenantError) throw tenantError;

  return tenant.restaurant_name;
}

export function useRestaurantName(userId: string) {
  return useQuery({
    queryKey: ["restaurant_name", userId],
    queryFn: () => getRestaurantName(userId),
    enabled: !!userId, // don’t run until we have a userId
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchInterval(query) {
      return query?.state?.data ? false : 1000 * 60 * 60; // refetch every 5 minutes if no data
    },
    refetchIntervalInBackground: true,
  });
}
