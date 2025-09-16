type RestaurantInfo = {
  id: string;
  tenant_id: string;
  hero_section?: {
    tagline: string;
    description: string;
    imageUrls: ExistingFile[];
  };
  about_section: {
    title: string;
    description: string;
    subtitle?: string;
    paragraphs?: string[];
    established?: string;
    happy_customers?: string;
    imageUrls?: ExistingFile[];
  };
  menu_section?: {
    title?: string;
    description?: string;
  };
  google_maps_embed?: string;
  whatsapp?: string;
  address?: string;
  phone?: string;
  additional?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
