"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { fetchScreenshots } from "@/lib/db/fetchScreenshots";

export default function ScreenshotList() {
  const queryClient = useQueryClient();

  const {
    data: files,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["screenshots"],
    queryFn: fetchScreenshots,
  });

  const handleDelete = async (name: string) => {
    const { error } = await supabase.storage.from("screenshots").remove([name]);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["screenshots"] });
    }
  };

  if (isLoading) return <p>Loading screenshots...</p>;
  if (error) return <p>Error loading screenshots</p>;
  if (!files || files.length === 0) return <p>No screenshots uploaded yet.</p>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {files.map((file) => (
        <div
          key={file.name}
          className="border p-2 rounded shadow-sm flex flex-col"
        >
          <Image
            src={file.url}
            alt={file.name}
            className="w-full h-32 object-cover rounded"
            height={150}
            width={150}
          />
          <p className="mt-2 text-xs break-all">{file.url}</p>
          <button
            onClick={() => handleDelete(file.name)}
            className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
