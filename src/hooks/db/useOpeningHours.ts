// hooks/useOpeningHours.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { NewOpeningHour, OpeningHour } from "@/types/opening-hours";
import toast from "react-hot-toast";

/** Query */
const fetchOpeningHours = async (tenantId: string): Promise<OpeningHour[]> => {
  const { data, error } = await supabase
    .from("snack_bite_opening_hours")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("day_of_week", { ascending: true })
    .order("slot_index", { ascending: true });

  if (error) throw error;
  return data || [];
};

export function useOpeningHours(tenantId?: string) {
  return useQuery({
    queryKey: ["openingHours", tenantId],
    queryFn: () => fetchOpeningHours(tenantId as string),
    enabled: !!tenantId,
  });
}

/** Types for inputs (we add tenant_id in the mutation) */
type NewOpeningHourInput = Omit<NewOpeningHour, "tenant_id" | "id">;
type UpdateOpeningHourInput = {
  id: string;
  open_time: string;
  close_time: string;
  slot_index: number;
};

/** Add */
export function useAddOpeningHour(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newHour: NewOpeningHourInput) => {
      const { error } = await supabase
        .from("snack_bite_opening_hours")
        .insert([{ ...newHour, tenant_id: tenantId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Opening hour added");
      queryClient.invalidateQueries({ queryKey: ["openingHours", tenantId] });
    },
    onError: () => toast.error("Failed to add opening hour"),
  });
}

/** Update */
export function useUpdateOpeningHour(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hour: UpdateOpeningHourInput) => {
      const { error } = await supabase
        .from("snack_bite_opening_hours")
        .update({
          open_time: hour.open_time,
          close_time: hour.close_time,
          slot_index: hour.slot_index,
        })
        .eq("id", hour.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Opening hour updated");
      queryClient.invalidateQueries({ queryKey: ["openingHours", tenantId] });
    },
    onError: () => toast.error("Failed to update opening hour"),
  });
}

/** Delete */
export function useDeleteOpeningHour(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("snack_bite_opening_hours")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Opening hour deleted");
      queryClient.invalidateQueries({ queryKey: ["openingHours", tenantId] });
    },
    onError: () => toast.error("Failed to delete opening hour"),
  });
}
