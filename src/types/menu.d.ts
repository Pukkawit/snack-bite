type MenuItem = {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  optimistic?: boolean; // for temporary optimistic state
};

export type NewMenuItem = Omit<MenuItem, "id" | "created_at" | "updated_at">;
export type UpdateMenuItem =
  & Partial<Omit<MenuItem, "tenant_id" | "created_at">>
  & { id: string };
