type PromoBanner = {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  active: boolean;
  background_color?: string;
  text_color?: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

type NewPromoBanner = Omit<PromoBanner, "id" | "created_at" | "updated_at">;

type UpdatePromoBanner =
  & Partial<Omit<PromoBanner, "tenant_id" | "created_at" | "updated_at">>
  & { id: string };
