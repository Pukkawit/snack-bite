"use client";

import ScreenshotUploadForm from "@/components/super-admin/ScreenshotUploadForm";
import ScreenshotList from "@/components/super-admin/ScreenshotList";
import { useQueryClient } from "@tanstack/react-query";

export default function ScreenshotUploadPage() {
  const queryClient = useQueryClient();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">Upload Screenshot</h2>
        <ScreenshotUploadForm
          onUploadSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["screenshots"] })
          }
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Uploaded Screenshots</h2>
        <ScreenshotList />
      </div>
    </div>
  );
}
