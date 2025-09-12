// lib/db/useMenuItems.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { MenuItem, NewMenuItem, UpdateMenuItem } from "@/types/menu";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { fetchTenantIdBySlug, formatTenantName } from "../../lib/utils";

export function useMenuItems() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;
  const tenantName = tenantSlug ? formatTenantName(tenantSlug) : "Tenant";
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["menuItems", tenantSlug], [tenantSlug]);

  /** 🔹 Query */
  const menuItemsQuery = useQuery<MenuItem[]>({
    queryKey,
    queryFn: async () => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      const { data, error } = await supabase
        .from("snack_bite_menu_items")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!tenantSlug,
  });

  /** 🔹 Add Mutation */
  const addMenuItem = useMutation({
    mutationFn: async (newItem: Omit<NewMenuItem, "tenant_id">) => {
      const tenantId = await fetchTenantIdBySlug(tenantSlug);
      const { data, error } = await supabase
        .from("snack_bite_menu_items")
        .insert([{ ...newItem, tenant_id: tenantId }])
        .select()
        .single();
      if (error) throw error;
      return data as MenuItem;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<MenuItem[]>(queryKey);
      const tenantId = await fetchTenantIdBySlug(tenantSlug);

      queryClient.setQueryData<MenuItem[]>(queryKey, (old = []) => [
        {
          id: Date.now().toString(),
          ...newItem,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          optimistic: true,
        },
        ...old,
      ]);

      return { prevData };
    },
    onError: (err, _newItem, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.prevData);
      toast(
        `Failed to add item for ${tenantName}`,
      );

      console.log(
        err instanceof Error ? err.message : "Something went wrong",
      );
    },
    onSuccess: (data) => {
      toast(`${data.name} was added successfully.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /** 🔹 Update Mutation */
  const updateMenuItem = useMutation({
    mutationFn: async (updatedItem: UpdateMenuItem) => {
      const { data, error } = await supabase
        .from("snack_bite_menu_items")
        .update(updatedItem)
        .eq("id", updatedItem.id)
        .select()
        .single();
      if (error) throw error;
      return data as MenuItem;
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<MenuItem[]>(queryKey);

      queryClient.setQueryData<MenuItem[]>(
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
        `${data.name} was updated successfully.`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  /** 🔹 Delete Mutation */
  const deleteMenuItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("snack_bite_menu_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<MenuItem[]>(queryKey);

      queryClient.setQueryData<MenuItem[]>(
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
        .channel(`menu-items-${tenantSlug}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "snack_bite_menu_items",
            filter: `tenant_id=eq.${tenantId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey });
          },
        );
      return () => {
        supabase.removeChannel(channel);
      };
    })();
  }, [tenantSlug, queryClient, queryKey]);

  return {
    ...menuItemsQuery,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,

    // expose loading states
    isAdding: addMenuItem.isPending,
    isUpdating: updateMenuItem.isPending,
    isDeleting: deleteMenuItem.isPending,
  };
}
