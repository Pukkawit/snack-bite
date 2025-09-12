"use client";

import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useOpeningHoursSection(tenantSlug: string | undefined) {
  const queryClient = useQueryClient();

  const fetchOpeningHours = async () => {
    if (!tenantSlug) return [];

    const tenantId = await fetchTenantIdBySlug(tenantSlug);

    const { data, error } = await supabase
      .from("snack_bite_opening_hours")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("day_of_week", { ascending: true })
      .order("slot_index", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const openingHoursQuery = useQuery({
    queryKey: ["opening-hours", tenantSlug],
    queryFn: fetchOpeningHours,
    enabled: !!tenantSlug,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    if (!tenantSlug) return;

    const channel = supabase
      .channel(`opening-hours-${tenantSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*", // listen for INSERT, UPDATE, DELETE
          schema: "public",
          table: "snack_bite_opening_hours",
        },
        () => {
          // invalidate cache so UI refetches
          queryClient.invalidateQueries({
            queryKey: ["opening-hours", tenantSlug],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantSlug, queryClient]);

  return openingHoursQuery;
}
