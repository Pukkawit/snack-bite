import { createClient } from "@/lib/supabase/server";

export async function checkAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;

  const user = data.user;

  return user;
}
