"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ScreenshotUploadForm({
  onUploadSuccess,
}: {
  onUploadSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("screenshots")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    setUploading(false);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      setFile(null);
      alert("Upload successful!");
      onUploadSuccess?.();
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="ml-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
