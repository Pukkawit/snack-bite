// src/lib/slugify.ts
import { supabase } from "@/lib/supabase/client";
export function generateTenantSlug(name: string): string {
  if (!name || name === "") {
    return "";
  }
  return name
    .toLowerCase()
    .replace(/'/g, "") // Remove apostrophes
    .replace(/[^a-z0-9\s]+/g, "") // Remove non-alphanumeric characters except spaces
    .trim() // Trim leading/trailing spaces
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
}

function randomSuffix(len = 4) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export async function getUniqueTenantSlug(restaurantName: string) {
  const base = generateTenantSlug(restaurantName);
  let candidate = base;

  // try base once, then add random suffix until unique
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase
      .from("snack_bite_tenants")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data && !error) return candidate;
    candidate = `${base}-${randomSuffix()}`;
  }

  // super edge case fallback with timestamp
  return `${base}-${Date.now().toString(36)}`;
}
