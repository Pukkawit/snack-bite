import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🔹 Utility to format tenantSlug into a readable name
export function formatTenantName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function fetchTenantIdBySlug(slug: string): Promise<string> {
  const { data, error } = await supabase
    .from("snack_bite_tenants")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !data) throw new Error("Tenant not found");
  return data.id;
}
export async function fetchTenantSlugByEmail(email: string): Promise<string> {
  const { data, error } = await supabase
    .from("snack_bite_tenants")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) throw new Error("Tenant not found");
  return data.slug;
}

export async function fetchTenantSlugFromAuth(): Promise<string> {
  // Get the current logged-in user
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("User not found");

  // Fetch tenant info by user_id (foreign key to auth.users.id)
  const { data: tenant, error: tenantError } = await supabase
    .from("snack_bite_tenant_owners")
    .select("slug, user_id")
    .eq("user_id", data.user.id) // this matches the table
    .single();

  if (tenantError || !tenant) throw new Error("Tenant not found");

  /*   console.log("User Credentials", {
    "Auth Id: ": data.user.id,
    "Tenant User Id: ": tenant.user_id,
    "Tenant Slug: ": tenant.slug,
  }); */

  return tenant.slug;
}

export const getInitials = (name?: string | null) =>
  name
    ? name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "SB";

export const normalizeRestaurantName = (name?: string | null) =>
  name
    ? name.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")
    : "SnackBite";

export async function fetchRestaurantNameBySlug(
  tenantSlug: string,
): Promise<string | null> {
  const tenantId = await fetchTenantIdBySlug(tenantSlug);

  const { data, error } = await supabase
    .from("snack_bite_restaurant_info")
    .select("restaurant_name")
    .eq("tenant_id", tenantId)
    .single();

  if (error || !data) {
    console.error("Error fectching restaurant name: ", error);
    return null;
  }

  return data.restaurant_name;
}
