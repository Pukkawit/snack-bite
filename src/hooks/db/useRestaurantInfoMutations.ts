"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug } from "@/lib/utils";
import toast from "react-hot-toast";
import type { RestaurantInfoFormValues } from "@/components/admin/restaurant-info-form";

export function useRestaurantInfoMutations(tenantSlug: string) {
  const queryClient = useQueryClient();

  // ---------------- UPSERT ----------------
  const upsert = useMutation({
    mutationFn: async (values: RestaurantInfoFormValues) => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);

      // Convert file objects -> string URLs for DB
      const payload = {
        tenant_id: tenantId,
        hero_section: {
          ...values.hero_section,
          imageUrls: values.hero_section.imageUrls.map((f) => f.url),
        },
        about_section: values.about_section
          ? {
            ...values.about_section,
            paragraphs: values.about_section.paragraphs?.filter(Boolean),
            imageUrls: values.about_section.imageUrls?.map((f) => f.url),
          }
          : null,
        menu_section: values.menu_section ?? null,
        google_maps_embed: values.google_maps_embed || null,
        whatsapp: values.whatsapp || null,
        address: values.address || null,
        phone: values.phone || null,
        additional: values.additional_json
          ? JSON.parse(values.additional_json)
          : null,
      };

      const { error } = await supabase
        .from("snack_bite_restaurant_info")
        .upsert(payload, { onConflict: "tenant_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Restaurant info saved!");
      queryClient.invalidateQueries({
        queryKey: ["restaurant-info", tenantSlug],
      });
    },
    onError: (err: unknown) => {
      toast.error((err as Error).message || "Failed to save restaurant info");
    },
  });

  // ---------------- DELETE ----------------
  const remove = useMutation({
    mutationFn: async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);

      const { error } = await supabase
        .from("snack_bite_restaurant_info")
        .delete()
        .eq("tenant_id", tenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Restaurant info deleted!");
      queryClient.invalidateQueries({
        queryKey: ["restaurant-info", tenantSlug],
      });
    },
    onError: (err: unknown) => {
      toast.error((err as Error).message || "Failed to delete restaurant info");
    },
  });

  return { upsert, remove };
}
