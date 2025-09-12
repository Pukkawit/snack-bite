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
