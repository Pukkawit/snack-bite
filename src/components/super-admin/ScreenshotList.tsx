"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { fetchScreenshots } from "@/lib/db/fetchScreenshots";
import Link from "next/link";

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
          <div className="flex p-4 items-center justify-center">
            <Link
              href={file.url}
              target="_blank"
              className="text-xs text-muted-foreground/50 break-all hover:text-violet-400"
            >
              {file.url}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(file.name)}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
