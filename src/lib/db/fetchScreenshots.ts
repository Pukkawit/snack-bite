import { supabase } from "@/lib/supabase/client";

export const fetchScreenshots = async (): Promise<ScreenshotFile[]> => {
  const { data, error } = await supabase.storage
    .from("screenshots")
    .list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) throw error;

  return (
    data?.map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from("screenshots")
        .getPublicUrl(file.name);

      return {
        name: file.name,
        url: publicUrlData.publicUrl,
      };
    }) ?? []
  );
};
