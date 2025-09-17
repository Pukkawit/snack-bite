"use client";

import { supabase } from "@/lib/supabase/client";
import { fetchTenantIdBySlug, formatTenantName } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";

export function usePromoBanners() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;
  const tenantName = tenantSlug ? formatTenantName(tenantSlug) : "Tenant";
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["promo-banners", tenantSlug], [tenantSlug]);
  const activeBannerQueryKey = useMemo(
    () => ["active-promo-banners", tenantSlug],
    [tenantSlug],
  );

  /* Query */
  const promoBannersQuery = useQuery<PromoBanner[]>({
    queryKey,
    queryFn: async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      const { data, error } = await supabase
        .from("snack_bite_promo_banners")
        .select("*")
        .eq("tenant_id", tenantId);

      if (error) throw error;
      return data as PromoBanner[];
    },
    enabled: !!tenantSlug,
  });

  /*Active Bammers Query */
  const activePromoBannersQuery = useQuery<PromoBanner[]>({
    queryKey: activeBannerQueryKey,
    queryFn: async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      const { data, error } = await supabase
        .from("snack_bite_promo_banners")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("active", true)
        .or("expires_at.is.null,expires_at.gt.now()");

      if (error) throw error;
      return data as PromoBanner[];
    },
    enabled: !!tenantSlug,
  });

  /**  Add Mutation */
  const addPromoBanner = useMutation({
    mutationFn: async (newPromoBanner: Omit<NewPromoBanner, "tenant_id">) => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      const { data, error } = await supabase
        .from("snack_bite_promo_banners")
        .insert([{ ...newPromoBanner, tenant_id: tenantId }])
        .select()
        .single();
      if (error) throw error;
      return data as PromoBanner;
    },
    onMutate: async (newPromoBanner) => {
      await queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<PromoBanner[]>(queryKey);
      const tenantId = await fetchTenantIdBySlug(tenantSlug);

      queryClient.setQueryData<PromoBanner[]>(queryKey, (old = []) => [
        {
          id: Date.now().toString(),
          ...newPromoBanner,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          optimistic: true,
        },
        ...old,
      ]);

      return { prevData };
    },
    onError: (err, _newPromoBanner, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prevData);
      toast(
        `Failed to add item for ${tenantName}`,
      );

      console.log(
        err instanceof Error ? err.message : "Something went wrong",
      );
    },
    onSuccess: (data) => {
      toast(`${data.title} was added successfully.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /** 🔹 Update Mutation */
  const updatePromoBanner = useMutation({
    mutationFn: async (updatedItem: UpdatePromoBanner) => {
      const { data, error } = await supabase
        .from("snack_bite_promo_banners")
        .update(updatedItem)
        .eq("id", updatedItem.id)
        .select()
        .single();
      if (error) throw error;
      return data as PromoBanner;
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<PromoBanner[]>(queryKey);

      queryClient.setQueryData<PromoBanner[]>(
        queryKey,
        (old = []) =>
          old.map((
            item,
          ) => (item.id === updatedItem.id
            ? { ...item, ...updatedItem }
            : item)
          ),
      );

      return { prevData };
    },
    onError: (err, _updatedItem, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prevData);
      toast(
        `Update failed for ${tenantName}`,
      );

      console.log(
        err instanceof Error ? err.message : "Could not update item",
      );
    },
    onSuccess: (data) => {
      toast(
        `${data.title} was updated successfully.`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /** 🔹 Delete Mutation */
  const deletePromoBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("snack_bite_promo_banners")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<PromoBanner[]>(queryKey);

      queryClient.setQueryData<PromoBanner[]>(
        queryKey,
        (old = []) => old.filter((item) => item.id !== id),
      );

      return { prevData };
    },
    onError: (err, _id, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prevData);
      toast(
        `Delete failed for ${tenantName}`,
      );

      console.log(
        err instanceof Error ? err.message : "Could not delete item",
      );
    },
    onSuccess: () => {
      toast("The item was removed successfully.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /**Realtime subscription */
  useEffect(() => {
    if (!tenantSlug) return;

    (async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);

      const channel = supabase
        .channel(`promo-banners-${tenantSlug}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "snack_bite_promo_banners",
            filter: `tenant_id=eq.${tenantId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey });
            queryClient.invalidateQueries({ queryKey: activeBannerQueryKey });
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    })();
  }, [tenantSlug, queryClient, queryKey, activeBannerQueryKey]);

  return {
    allBanners: promoBannersQuery,
    activeBanners: activePromoBannersQuery,
    addPromoBanner,
    updatePromoBanner,
    deletePromoBanner,
    isAdding: addPromoBanner.isPending,
    isUpdating: updatePromoBanner.isPending,
    isDeleting: deletePromoBanner.isPending,
  };
}
