import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";

async function fetchProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("snack_bite_profile")
    .select("id, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return { ...data, userId: user.id };
}

export function useProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    refetchIntervalInBackground: true,
  });

  /* invalidate and refetch */
  const queryClient = useQueryClient();
  const handleProfileUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return { profile, isLoading, handleProfileUpdate };
}
