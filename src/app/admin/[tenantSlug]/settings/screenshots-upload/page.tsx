"use client";

import ScreenshotUploadForm from "@/components/super-admin/ScreenshotUploadForm";
import ScreenshotList from "@/components/super-admin/ScreenshotList";
import { useQueryClient } from "@tanstack/react-query";

export default function ScreenshotUploadPage() {
  const queryClient = useQueryClient();

  return (
    <div className="flex-1 p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Screenshots Upload
        </h1>
        <p className="text-muted-foreground">
          Upload and manage platform screenshots and media assets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </div>
  );
}
