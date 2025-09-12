export interface OpeningHour {
  id: string;
  tenant_id: string;
  day_of_week: number; // 0 = Sunday, ... 6 = Saturday
  open_time: string; // "08:00:00"
  close_time: string; // "12:00:00"
  slot_index: number;
  created_at: string;
  updated_at: string;
}

/* type OpeningHour = {
  id: string;
  tenant_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ...
  open_time: string;
  close_time: string;
  slot_index: number;
}; */

export type NewOpeningHour = Omit<
  OpeningHour,
  "id" | "created_at" | "updated_at"
>;
