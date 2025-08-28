import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: "snacks" | "drinks" | "specials" | "desserts";
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface RestaurantInfo {
  id: number;
  name: string;
  tagline: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  google_maps_embed: string | null;
  updated_at: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  background_color: string;
  text_color: string;
  created_at: string;
  expires_at: string | null;
}
