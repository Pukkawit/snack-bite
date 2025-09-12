"use client";

import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useMenuSectionItems(tenantSlug: string | undefined) {
  const queryClient = useQueryClient();

  const fetchMenuItems = async () => {
    if (!tenantSlug) return [];

    const tenantId = await fetchTenantIdBySlug(tenantSlug);

    const { data, error } = await supabase
      .from("snack_bite_menu_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_available", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const query = useQuery({
    queryKey: ["menu-items", tenantSlug],
    queryFn: fetchMenuItems,
    enabled: !!tenantSlug,
  });

  // 👇 Subscribe to realtime changes
  useEffect(() => {
    if (!tenantSlug) return;

    const channel = supabase
      .channel(`menu-items-${tenantSlug}`)
      .on(
        "postgres_changes",
        {
          event: "*", // listen for INSERT, UPDATE, DELETE
          schema: "public",
          table: "snack_bite_menu_items",
        },
        () => {
          // invalidate cache so UI refetches
          queryClient.invalidateQueries({
            queryKey: ["menu-items", tenantSlug],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantSlug, queryClient]);

  return query;
}
