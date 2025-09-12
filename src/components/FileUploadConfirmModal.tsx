"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn for conditional class names

interface FileUploadConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "exact" | "basename"; // Determines which dialog to show
  fileName: string;
  // For 'exact' type
  isReplacing?: boolean;
  onConfirmReplace?: () => void;
  // For 'basename' type
  existingFiles?: Array<{ format: string; public_id: string }>;
  onConfirmContinue?: () => void;
}
export function FileUploadConfirmModal({
  isOpen,
  onClose,
  type,
  fileName,
  isReplacing = false,
  onConfirmReplace,
  existingFiles = [],
  onConfirmContinue,
}: FileUploadConfirmModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {type === "exact" ? (
          <>
            <DialogHeader>
              <DialogTitle
                className={cn(
                  "flex items-center gap-2",
                  "text-red-600 dark:text-red-400"
                )}
              >
                <AlertTriangle className="h-5 w-5" />
                Duplicate File Detected
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3">
                  <div
                    className={cn(
                      "rounded-lg p-4",
                      "bg-red-50 border border-red-200",
                      "dark:bg-red-950/20 dark:border-red-800"
                    )}
                  >
                    <div
                      className={cn(
                        "font-medium",
                        "text-red-800 dark:text-red-200"
                      )}
                    >
                      A file with the exact same name already exists:
                    </div>
                    <div
                      className={cn(
                        "text-sm font-mono px-2 py-1 rounded mt-2",
                        "bg-red-100 text-red-700",
                        "dark:bg-red-900/30 dark:text-red-300"
                      )}
                    >
                      {fileName}
                    </div>
                  </div>
                  <div className="text-sm text-foreground">
                    Would you like to <strong>replace</strong> the existing file
                    with your new upload? This action cannot be undone.
                  </div>
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      "bg-red-50 border border-red-200",
                      "dark:bg-red-950/20 dark:border-red-800"
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs flex items-center gap-2",
                        "text-red-700 dark:text-red-300"
                      )}
                    >
                      <AlertCircle className="h-4 w-4" />
                      <strong>Warning:</strong> The original file will be
                      permanently deleted.
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isReplacing}
              >
                Keep Original
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirmReplace}
                disabled={isReplacing}
                className="min-w-[120px]"
              >
                {isReplacing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Replace File
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle
                className={cn(
                  "flex items-center gap-2",
                  "text-blue-600 dark:text-blue-400"
                )}
              >
                <Info className="h-5 w-5" />
                Similar Files Found
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4">
                  <div
                    className={cn(
                      "rounded-lg p-4",
                      "bg-blue-50 border border-blue-200",
                      "dark:bg-blue-950/20 dark:border-blue-800"
                    )}
                  >
                    <div
                      className={cn(
                        "font-medium mb-2",
                        "text-blue-800 dark:text-blue-200"
                      )}
                    >
                      You are uploading:{" "}
                      <span className="font-mono">{fileName}</span>
                    </div>
                    <div
                      className={cn(
                        "text-sm",
                        "text-blue-700 dark:text-blue-300"
                      )}
                    >
                      Similar files with different extensions already exist:
                    </div>
                    <div className="mt-3 space-y-1">
                      {existingFiles.map((file, index) => (
                        <div
                          key={index}
                          className={cn(
                            "text-sm font-mono px-2 py-1 rounded flex items-center gap-2",
                            "bg-blue-100",
                            "dark:bg-blue-900/30"
                          )}
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {file.public_id.split("/").pop()}.{file.format}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This might be intentional (different file formats of the
                    same content) or you might want to review your upload. Would
                    you like to continue?
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex items-center justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancel & Review
              </Button>
              <Button onClick={onConfirmContinue} className="min-w-[120px]">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Continue Upload
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
