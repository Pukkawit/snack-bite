"use client";

import type React from "react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import SparkMD5 from "spark-md5";
import {
  X,
  UploadCloud,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploadConfirmModal } from "@/components/FileUploadConfirmModal";
import { getStrictComparableName } from "@/lib/cloudinary-utils"; // Import extractCloudinaryPublicId
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete";
import Notification from "./Notification";

interface NotificationState {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
  id: string;
}

interface FileState {
  id: string;
  file?: File;
  url?: string;
  name: string;
  size: number;
  type: "image" | "video" | "other";
  status:
    | "pending"
    | "uploading"
    | "uploaded"
    | "failed"
    | "duplicate_exact"
    | "duplicate_basename"
    | "deleting_old";
  progress: number;
  error?: string;
  md5?: string;
  publicId?: string;
  source?: "cloudinary" | "supabase" | "link"; // Added source
}

interface MediaUploaderMultiProps {
  label?: string;
  folder?: string;
  maxFiles?: number;
  accept?: string;
  value?: ExistingFile[]; // Changed to ExistingFile[]
  onUpload?: (files: ExistingFile[]) => void; // Changed to ExistingFile[]
  info?: string | React.ReactNode;
  error?: string;
  maxFileSize?: number;
  cloudinaryOptions: {
    cloudName: string;
    uploadPreset: string;
  };
  onValidateUpload?: () => boolean | Promise<boolean>;
}

export default function MediaUploader({
  label,
  folder = "vendors/stores",
  maxFiles = 5,
  accept = "image/*",
  value = [],
  onUpload,
  info,
  error,
  maxFileSize = 5 * 1024 * 1024,
  cloudinaryOptions,
  onValidateUpload,
}: MediaUploaderMultiProps) {
  // Initialize files state only once from value prop
  const [files, setFiles] = useState<FileState[]>(() => {
    console.log(
      "[MediaUploader] Initializing files state from value prop:",
      value
    );
    return (value || []).map((existingFile) => ({
      id: existingFile.id,
      url: existingFile.url,
      name: existingFile.name,
      size: existingFile.size || 0,
      type: existingFile.type?.includes("video")
        ? "video"
        : existingFile.type?.includes("image")
        ? "image"
        : "other",
      status: "uploaded" as const,
      progress: 100,
      publicId: existingFile.publicId,
      source: existingFile.source,
    }));
  });

  const [uploadQueue, setUploadQueue] = useState<FileState[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isWaitingForUserInput, setIsWaitingForUserInput] = useState(false);
  const [exactDuplicateConflict, setExactDuplicateConflict] = useState<{
    fileName: string;
    type: "image" | "video" | "other";
    file: File;
    id: string;
    publicId: string;
  } | null>(null);
  const [basenameConflict, setBasenameConflict] = useState<{
    fileName: string;
    type: "image" | "video" | "other";
    file: File;
    existingMatches: CloudinaryResource[];
    id: string;
  } | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "error",
    visible: false,
    id: uuidv4(),
  });

  // Track the last uploaded ExistingFile[] to prevent unnecessary onUpload calls
  const lastUploadedFilesRef = useRef<ExistingFile[]>([]);

  // Only sync from external value prop when it's genuinely different (e.g., form reset)
  const previousValueRef = useRef<ExistingFile[]>(value || []);
  useEffect(() => {
    const newValue = value || [];
    const previousValue = previousValueRef.current;

    // Only update if the external value has changed AND it's different from our current uploaded files
    const currentUploadedFiles = files
      .filter((f) => f.status === "uploaded" && f.url)
      .map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url!,
        type: f.type,
        size: f.size,
        source: f.source || "cloudinary", // Default to cloudinary if not set
        publicId: f.publicId,
      })) as ExistingFile[];

    // Check if this is an external change (not from our own onUpload call)
    const isExternalChange =
      JSON.stringify(newValue.map((f) => f.url).sort()) !==
        JSON.stringify(currentUploadedFiles.map((f) => f.url).sort()) &&
      JSON.stringify(newValue.map((f) => f.url).sort()) !==
        JSON.stringify(previousValue.map((f) => f.url).sort());

    if (isExternalChange) {
      console.log(
        "[MediaUploader] External value change detected, resetting files:",
        newValue
      );
      setFiles(
        newValue.map((existingFile) => ({
          id: existingFile.id,
          url: existingFile.url,
          name: existingFile.name,
          size: existingFile.size || 0,
          type: existingFile.type?.includes("video")
            ? "video"
            : existingFile.type?.includes("image")
            ? "image"
            : "other",
          status: "uploaded" as const,
          progress: 100,
          publicId: existingFile.publicId,
          source: existingFile.source,
        }))
      );
      lastUploadedFilesRef.current = newValue;
    }

    previousValueRef.current = newValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Memoize the current uploaded ExistingFile[] to prevent unnecessary re-renders
  const currentUploadedExistingFiles = useMemo(() => {
    return files
      .filter((f) => f.status === "uploaded" && f.url)
      .map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url!,
        type: f.type,
        size: f.size,
        source: f.source || "cloudinary", // Default to cloudinary if not set
        publicId: f.publicId,
      })) as ExistingFile[];
  }, [files]);

  // Only call onUpload when uploaded ExistingFile[] actually change
  useEffect(() => {
    const urlsString = JSON.stringify(
      currentUploadedExistingFiles.map((f) => f.url).sort()
    );
    const lastUrlsString = JSON.stringify(
      lastUploadedFilesRef.current.map((f) => f.url).sort()
    );

    if (urlsString !== lastUrlsString) {
      console.log(
        "[MediaUploader] Uploaded ExistingFiles changed, calling onUpload:",
        currentUploadedExistingFiles
      );
      lastUploadedFilesRef.current = currentUploadedExistingFiles;
      onUpload?.(currentUploadedExistingFiles);
    }
  }, [currentUploadedExistingFiles, onUpload]);

  const fileToMD5 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const hash = SparkMD5.ArrayBuffer.hash(reader.result as ArrayBuffer);
        resolve(hash);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const isVideo = (type: string) => type.includes("video");

  const checkCloudinaryForDuplicates = useCallback(
    async (
      fileName: string,
      folderName?: string
    ): Promise<CheckDuplicateResponse> => {
      console.log(
        `[MediaUploader] Checking for duplicates for file: ${fileName} in folder: ${
          folderName || "root"
        }`
      );
      try {
        const response = await fetch("/api/cloudinary/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            folderName,
            cloudName: cloudinaryOptions.cloudName, // Pass cloudName for API route
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to check for duplicates");
        }

        const result = (await response.json()) as CheckDuplicateResponse;
        console.log("[MediaUploader] Duplicate check result:", result);
        return result;
      } catch (error) {
        console.error("[MediaUploader] Error checking for duplicates:", error);
        setNotification({
          message: "Failed to check for duplicate files. Please try again.",
          type: "error",
          visible: true,
          id: uuidv4(),
        });
        return {
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [cloudinaryOptions.cloudName]
  );

  const validateMediaDimensions = useCallback(
    async (file: File): Promise<void> => {
      console.group("[MediaUploader] Media Validation");
      console.log("Starting validation for file:", file.name);

      return new Promise((resolve, reject) => {
        if (file.type.startsWith("image/")) {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            console.log(
              "Image loaded - actual dimensions:",
              img.width,
              "x",
              img.height
            );
            resolve();
          };
          img.onerror = () => {
            console.error("Image loading failed");
            reject(new Error("Could not load image for validation"));
          };
          img.src = URL.createObjectURL(file);
        } else if (file.type.startsWith("video/")) {
          const video = document.createElement("video");
          video.preload = "metadata";
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            console.log(
              "Video loaded - actual dimensions:",
              video.videoWidth,
              "x",
              video.videoHeight
            );
            resolve();
          };
          video.onerror = () => {
            URL.revokeObjectURL(video.src);
            console.error("Video loading failed");
            reject(new Error("Could not load video for validation"));
          };
          video.src = URL.createObjectURL(file);
        } else {
          resolve();
        }
      });
    },
    []
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (onValidateUpload) {
        try {
          const isValid = await onValidateUpload();
          if (!isValid) {
            // Validation failed, don't process the files
            return;
          }
        } catch (error) {
          console.error(
            "[MediaUploader] Validation function threw an error:",
            error
          );
          setNotification({
            message: "Upload validation failed. Please check your inputs.",
            type: "error",
            visible: true,
            id: uuidv4(),
          });
          return;
        }
      }

      const newFilesToAdd: FileState[] = [];
      const currentUploadedCount = files.filter(
        (f) => f.status === "uploaded"
      ).length;
      const availableSlots = maxFiles - currentUploadedCount;

      if (acceptedFiles.length > availableSlots) {
        setNotification({
          message: `Too many files selected. Max ${availableSlots} more allowed.`,
          type: "warning",
          visible: true,
          id: uuidv4(),
        });
        console.warn(
          `[MediaUploader] Too many files selected. Max ${availableSlots} more allowed.`
        );
        return;
      }

      for (const file of acceptedFiles) {
        if (file.size > maxFileSize) {
          setNotification({
            message: `File "${file.name}" is too large (max ${(
              maxFileSize /
              1024 /
              1024
            ).toFixed(2)} MB).`,
            type: "error",
            visible: true,
            id: uuidv4(),
          });
          console.warn(
            `[MediaUploader] File ${file.name} (${(
              file.size /
              1024 /
              1024
            ).toFixed(2)} MB) exceeds max size of ${(
              maxFileSize /
              1024 /
              1024
            ).toFixed(2)} MB.`
          );
          setFiles((prev) => [
            ...prev,
            {
              id: uuidv4(),
              name: file.name,
              size: file.size,
              type: file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("video/")
                ? "video"
                : "other",
              status: "failed",
              progress: 0,
              error: `File too large (max ${(maxFileSize / 1024 / 1024).toFixed(
                2
              )} MB)`,
            },
          ]);
          continue;
        }

        const fileType = isVideo(file.type)
          ? "video"
          : file.type.startsWith("image/")
          ? "image"
          : "other";
        const newFileState: FileState = {
          id: uuidv4(),
          file,
          name: file.name,
          size: file.size,
          type: fileType,
          status: "pending",
          progress: 0,
          source: "cloudinary", // MediaUploader only handles Cloudinary for now
        };
        newFilesToAdd.push(newFileState);
      }

      setFiles((prevFiles) => [...prevFiles, ...newFilesToAdd]);
      setUploadQueue((prevQueue) => [...prevQueue, ...newFilesToAdd]);
    },
    [files, maxFiles, maxFileSize, onValidateUpload] // Added onValidateUpload to dependencies
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: accept
        .split(",")
        .reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {}),
      maxFiles: maxFiles,
      maxSize: maxFileSize,
      noClick: isProcessingQueue,
      noDrag: isProcessingQueue,
    });

  // Process upload queue
  useEffect(() => {
    const processNextFileInQueue = async () => {
      if (
        uploadQueue.length === 0 ||
        isProcessingQueue ||
        isWaitingForUserInput
      ) {
        return;
      }

      setIsProcessingQueue(true);
      const currentFileState = uploadQueue[0];
      console.log(
        `[MediaUploader] Processing next file: ${currentFileState.name} (ID: ${currentFileState.id})`
      );

      setFiles((prev) =>
        prev.map((f) =>
          f.id === currentFileState.id
            ? { ...f, status: "uploading", progress: 0, error: undefined }
            : f
        )
      );

      try {
        const md5 = await fileToMD5(currentFileState.file!);
        console.log(`[MediaUploader] MD5 for ${currentFileState.name}: ${md5}`);

        const duplicateCheckResult = await checkCloudinaryForDuplicates(
          currentFileState.name,
          folder
        );

        if (duplicateCheckResult.exists) {
          if (duplicateCheckResult.duplicateType === "exact") {
            console.log(
              `[MediaUploader] Exact duplicate detected for ${currentFileState.name}.`
            );
            setExactDuplicateConflict({
              fileName: currentFileState.name,
              type: currentFileState.type,
              file: currentFileState.file!,
              id: currentFileState.id,
              publicId: duplicateCheckResult.file?.public_id || "",
            });
            setFiles((prev) =>
              prev.map((f) =>
                f.id === currentFileState.id
                  ? {
                      ...f,
                      status: "duplicate_exact",
                      md5,
                      publicId: duplicateCheckResult.file?.public_id,
                    }
                  : f
              )
            );
            setIsWaitingForUserInput(true);
            setConfirmModalOpen(true);
            setIsProcessingQueue(false);
            setNotification({
              message: `Exact duplicate found for "${currentFileState.name}". Please confirm replacement.`,
              type: "warning",
              visible: true,
              id: uuidv4(),
            });
            return;
          } else if (duplicateCheckResult.duplicateType === "basename") {
            console.log(
              `[MediaUploader] Basename duplicate detected for ${currentFileState.name}.`
            );
            setBasenameConflict({
              fileName: currentFileState.name,
              type: currentFileState.type,
              file: currentFileState.file!,
              existingMatches: duplicateCheckResult.allMatches || [],
              id: currentFileState.id,
            });
            setFiles((prev) =>
              prev.map((f) =>
                f.id === currentFileState.id
                  ? { ...f, status: "duplicate_basename", md5 }
                  : f
              )
            );
            setIsWaitingForUserInput(true);
            setConfirmModalOpen(true);
            setNotification({
              message: `Similar files found for "${currentFileState.name}". Please confirm continuation.`,
              type: "info",
              visible: true,
              id: uuidv4(),
            });
            setIsProcessingQueue(false);
            return;
          }
        }

        console.log(
          `[MediaUploader] Validating dimensions for ${currentFileState.name}...`
        );
        await validateMediaDimensions(currentFileState.file!);
        console.log(
          `[MediaUploader] Dimension validation passed for ${currentFileState.name}.`
        );

        console.log(
          `[MediaUploader] Uploading ${currentFileState.name} to Cloudinary...`
        );
        // Extract base filename for public_id_prefix using the new helper
        const baseFileName = getStrictComparableName(currentFileState.name);

        const uploadResult = await uploadToCloudinary(
          // Changed to await UploadResult
          currentFileState.file!,
          currentFileState.name, // Pass currentFileState.name as originalFileName
          {
            cloudName: cloudinaryOptions.cloudName.trim(),
            uploadPreset: cloudinaryOptions.uploadPreset.trim(),
            folderName: folder,
            publicIdPrefix: baseFileName, // Re-added public_id_prefix
          },
          (p) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === currentFileState.id ? { ...f, progress: p } : f
              )
            );
          }
        );

        if (uploadResult.success && uploadResult.url) {
          console.log(
            `[MediaUploader] Upload successful for ${currentFileState.name}. URL: ${uploadResult.url}`
          );

          setFiles((prev) =>
            prev.map((f) =>
              f.id === currentFileState.id
                ? {
                    ...f,
                    status: "uploaded",
                    url: uploadResult.url,
                    progress: 100,
                    md5,
                    publicId: uploadResult.publicId,
                    source: "cloudinary",
                  }
                : f
            )
          );
          setUploadQueue((prev) => prev.slice(1));
          setNotification({
            message: `File "${currentFileState.name}" uploaded successfully!`,
            type: "success",
            visible: true,
            id: uuidv4(),
          });
        } else {
          throw new Error(uploadResult.error || "Upload failed");
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error(
          `[MediaUploader] Upload failed for ${currentFileState.name}:`,
          error
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === currentFileState.id
              ? { ...f, status: "failed", error: error.message }
              : f
          )
        );
        setUploadQueue((prev) => prev.slice(1));
        setNotification({
          message: `Failed to upload "${currentFileState.name}": ${error.message}`,
          type: "error",
          visible: true,
          id: uuidv4(),
        });
      } finally {
        setIsProcessingQueue(false);
      }
    };

    processNextFileInQueue();
  }, [
    uploadQueue,
    isProcessingQueue,
    isWaitingForUserInput,
    folder,
    cloudinaryOptions.cloudName,
    cloudinaryOptions.uploadPreset,
    fileToMD5,
    checkCloudinaryForDuplicates,
    validateMediaDimensions,
  ]);

  const handleConfirmUpload = useCallback(async () => {
    setIsWaitingForUserInput(false);
    if (exactDuplicateConflict) {
      console.log(
        `[MediaUploader] User confirmed REPLACE for ${exactDuplicateConflict.fileName}.`
      );
      setConfirmModalOpen(false);

      const fileToUpload = exactDuplicateConflict.file;
      const oldPublicId = exactDuplicateConflict.publicId;
      const fileId = exactDuplicateConflict.id;

      if (!fileToUpload || !oldPublicId) {
        console.error(
          "[MediaUploader] Missing file or old public ID for replacement."
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "failed",
                  error: "Missing data for replacement",
                }
              : f
          )
        );
        setUploadQueue((prev) => prev.slice(1));
        setIsProcessingQueue(false);
        setExactDuplicateConflict(null);
        setNotification({
          message: "Failed to replace image: Missing data.",
          type: "error",
          visible: true,
          id: uuidv4(),
        });
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "deleting_old", progress: 0, error: undefined }
            : f
        )
      );
      setIsProcessingQueue(true);

      try {
        console.log(
          `[MediaUploader] Deleting old file with public_id: ${oldPublicId}`
        );
        const deleteResult = await deleteFromCloudinary(
          oldPublicId,
          cloudinaryOptions.cloudName
        ); // Pass publicId directly
        if (!deleteResult.success) {
          throw new Error(deleteResult.error || "Failed to delete old image");
        }
        console.log(
          `[MediaUploader] Old file ${oldPublicId} deleted successfully.`
        );

        console.log(
          `[MediaUploader] Uploading new file ${fileToUpload.name} after deletion.`
        );
        // Extract base filename for public_id_prefix using the new helper
        const baseFileName = getStrictComparableName(fileToUpload.name);

        const newUploadResult = await uploadToCloudinary(
          // Changed to await UploadResult
          fileToUpload,
          fileToUpload.name, // Pass fileToUpload.name as originalFileName
          {
            cloudName: cloudinaryOptions.cloudName.trim(),
            uploadPreset: cloudinaryOptions.uploadPreset.trim(),
            folderName: folder,
            publicIdPrefix: baseFileName, // Re-added public_id_prefix
          },
          (p) => {
            console.log(
              `[MediaUploader] Upload progress for ${fileToUpload.name}: ${p}%`
            );
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileId ? { ...f, progress: p, status: "uploading" } : f
              )
            );
          }
        );

        if (newUploadResult.success && newUploadResult.url) {
          console.log(
            `[MediaUploader] New file ${fileToUpload.name} uploaded successfully. URL: ${newUploadResult.url}`
          );

          // Update the file state with the NEW file's information
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "uploaded",
                    url: newUploadResult.url,
                    progress: 100,
                    publicId: newUploadResult.publicId,
                    source: "cloudinary",
                    md5: undefined, // Will be recalculated if needed
                  }
                : f
            )
          );

          console.log(
            `[MediaUploader] Successfully updated file state for ${fileToUpload.name} with new URL: ${newUploadResult.url}`
          );
          setUploadQueue((prev) => prev.slice(1));
          setNotification({
            message: `File "${fileToUpload.name}" replaced successfully!`,
            type: "success",
            visible: true,
            id: uuidv4(),
          });
        } else {
          throw new Error(
            newUploadResult.error || "Upload failed after deletion"
          );
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error(
          `[MediaUploader] Replacement failed for ${exactDuplicateConflict.fileName}:`,
          error
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "failed", error: error.message }
              : f
          )
        );
        setUploadQueue((prev) => prev.slice(1));
        setNotification({
          message: `Failed to replace "${exactDuplicateConflict.fileName}": ${error.message}`,
          type: "error",
          visible: true,
          id: uuidv4(),
        });
      } finally {
        setIsProcessingQueue(false);
        setExactDuplicateConflict(null);
      }
    } else if (basenameConflict) {
      console.log(
        `[MediaUploader] User confirmed CONTINUE for ${basenameConflict.fileName}.`
      );
      setConfirmModalOpen(false);

      const fileToUpload = basenameConflict.file;
      const fileId = basenameConflict.id;

      if (!fileToUpload) {
        console.error(
          "[MediaUploader] Missing file for basename conflict continuation."
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "failed", error: "Missing file for upload" }
              : f
          )
        );
        setUploadQueue((prev) => prev.slice(1));
        setIsProcessingQueue(false);
        setBasenameConflict(null);
        setNotification({
          message: "Failed to upload: Missing file data.",
          type: "error",
          visible: true,
          id: uuidv4(),
        });
        return;
      }

      console.log(
        `[MediaUploader] Starting upload for basename conflict file: ${fileToUpload.name}`
      );
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "uploading", progress: 0, error: undefined }
            : f
        )
      );
      setIsProcessingQueue(true);

      try {
        console.log(
          `[MediaUploader] Uploading new file ${fileToUpload.name} (basename conflict).`
        );
        // Extract base filename for public_id_prefix using the new helper
        const baseFileName = getStrictComparableName(fileToUpload.name);

        const newUploadResult = await uploadToCloudinary(
          // Changed to await UploadResult
          fileToUpload,
          fileToUpload.name, // Pass fileToUpload.name as originalFileName
          {
            cloudName: cloudinaryOptions.cloudName.trim(),
            uploadPreset: cloudinaryOptions.uploadPreset.trim(),
            folderName: folder,
            publicIdPrefix: baseFileName, // Re-added public_id_prefix
          },
          (p) => {
            console.log(
              `[MediaUploader] Upload progress for ${fileToUpload.name}: ${p}%`
            );
            setFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, progress: p } : f))
            );
          }
        );

        if (newUploadResult.success && newUploadResult.url) {
          console.log(
            `[MediaUploader] New file ${fileToUpload.name} uploaded successfully. NEW URL: ${newUploadResult.url}`
          );

          // Update the file state with the NEW file's information
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "uploaded",
                    url: newUploadResult.url,
                    progress: 100,
                    publicId: newUploadResult.publicId,
                    source: "cloudinary",
                    md5: undefined, // Will be recalculated if needed
                  }
                : f
            )
          );

          console.log(
            `[MediaUploader] Successfully updated file state for ${fileToUpload.name} with new URL: ${newUploadResult.url}`
          );
          setUploadQueue((prev) => prev.slice(1));
          setNotification({
            message: `File "${fileToUpload.name}" uploaded successfully!`,
            type: "success",
            visible: true,
            id: uuidv4(),
          });
        } else {
          throw new Error(newUploadResult.error || "Upload failed");
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error(
          `[MediaUploader] Basename conflict upload failed for ${basenameConflict.fileName}:`,
          error
        );
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "failed", error: error.message }
              : f
          )
        );
        setUploadQueue((prev) => prev.slice(1));
        setNotification({
          message: `Failed to upload "${basenameConflict.fileName}": ${error.message}`,
          type: "error",
          visible: true,
          id: uuidv4(),
        });
      } finally {
        setIsProcessingQueue(false);
        setBasenameConflict(null); // Clear the conflict state
      }
    }
  }, [exactDuplicateConflict, basenameConflict, cloudinaryOptions, folder]);

  const handleCancelConflict = useCallback(() => {
    setConfirmModalOpen(false);
    setIsWaitingForUserInput(false);
    if (exactDuplicateConflict) {
      setFiles((prev) =>
        prev.filter((f) => f.id !== exactDuplicateConflict.id)
      );
      setExactDuplicateConflict(null);
      setNotification({
        message: `Upload of "${exactDuplicateConflict.fileName}" cancelled.`,
        type: "info",
        visible: true,
        id: uuidv4(),
      });
    } else if (basenameConflict) {
      setFiles((prev) => prev.filter((f) => f.id !== basenameConflict.id));
      setBasenameConflict(null);
      setNotification({
        message: `Upload of "${basenameConflict.fileName}" cancelled.`,
        type: "info",
        visible: true,
        id: uuidv4(),
      });
    }
    setUploadQueue((prev) => prev.slice(1));
    setIsProcessingQueue(false);
  }, [exactDuplicateConflict, basenameConflict]);

  const removeFile = useCallback(
    async (id: string) => {
      const fileToRemove = files.find((f) => f.id === id);
      if (!fileToRemove) return;

      if (
        fileToRemove.status === "uploaded" &&
        fileToRemove.publicId &&
        fileToRemove.source === "cloudinary"
      ) {
        try {
          console.log(
            `[MediaUploader] Deleting file: ${fileToRemove.publicId}`
          );
          const deleteResult = await deleteFromCloudinary(
            fileToRemove.publicId,
            cloudinaryOptions.cloudName
          );

          if (!deleteResult.success) {
            console.error(
              `[MediaUploader] Failed to delete from Cloudinary:`,
              deleteResult.error
            );
            setNotification({
              message: `Failed to delete "${fileToRemove.name}" from Cloudinary: ${deleteResult.error}`,
              type: "error",
              visible: true,
              id: uuidv4(),
            });
            return;
          }

          console.log(
            `[MediaUploader] Successfully deleted from Cloudinary: ${fileToRemove.publicId}`
          );
          setNotification({
            message: `"${fileToRemove.name}" deleted successfully!`,
            type: "success",
            visible: true,
            id: uuidv4(),
          });
        } catch (error) {
          console.error(
            `[MediaUploader] Error deleting from Cloudinary:`,
            error
          );
          setNotification({
            message: `Failed to delete "${fileToRemove.name}": ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            type: "error",
            visible: true,
            id: uuidv4(),
          });
          return;
        }
      }

      // Remove from local state
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [files, cloudinaryOptions.cloudName]
  );

  const uploadedCount = files.filter((f) => f.status === "uploaded").length;
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const failedCount = files.filter((f) => f.status === "failed").length;
  const remainingSlots =
    maxFiles - uploadedCount - pendingCount - uploadingCount - failedCount;

  return (
    <>
      <div className="space-y-4">
        {label && (
          <label className="text-sm font-medium text-foreground">{label}</label>
        )}
        {info && <div className="text-xs text-muted-foreground">{info}</div>}

        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-300 min-h-[120px]",
            isDragActive
              ? "border-primary bg-primary-subtle"
              : "border-border bg-card hover:bg-card-foreground/5",
            (isProcessingQueue || remainingSlots <= 0) &&
              "opacity-70 cursor-not-allowed"
          )}
        >
          <input
            {...getInputProps()}
            disabled={isProcessingQueue || remainingSlots <= 0}
          />
          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
            <UploadCloud className="h-8 w-8" />
            <p className="text-sm text-center">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-xs">
              {uploadedCount} of {maxFiles} files uploaded. Max{" "}
              {(maxFileSize / 1024 / 1024).toFixed(1)} MB per file.
            </p>
          </div>
        </div>

        {fileRejections.length > 0 && (
          <div className="text-destructive text-sm">
            {fileRejections.map(({ file, errors }) => (
              <p key={file.name}>
                <AlertCircle className="inline-block h-4 w-4 mr-1" /> File
                &ldquo;
                {file.name}&rdquo; rejected:{" "}
                {errors.map((e) => e.message).join(", ")}
              </p>
            ))}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">
            <AlertCircle className="inline-block h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {files.map((fileState) => (
              <div
                key={fileState.id}
                className="relative group aspect-video rounded-md overflow-hidden border border-border bg-card flex flex-col"
              >
                <div className="relative flex-1 flex items-center justify-center bg-muted/50">
                  {fileState.url && fileState.type === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={fileState.url} // Add key to force re-render when URL changes
                      src={fileState.url || "/placeholder.svg"}
                      alt={fileState.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {fileState.url && fileState.type === "video" && (
                    <video
                      key={fileState.url} // Add key to force re-render when URL changes
                      src={fileState.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!fileState.url && fileState.type === "image" && (
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                  {!fileState.url && fileState.type === "video" && (
                    <VideoIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                  {!fileState.url && fileState.type === "other" && (
                    <FileTextIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                  {(fileState.status === "deleting_old" ||
                    fileState.status === "uploading") && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="p-2 text-xs flex flex-col">
                  <span className="font-medium truncate">{fileState.name}</span>
                  <span className="text-muted-foreground">
                    {fileState.size > 0
                      ? `${(fileState.size / 1024 / 1024).toFixed(2)} MB`
                      : "Size unknown"}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {fileState.status === "uploaded" && (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Uploaded</span>
                      </>
                    )}
                    {fileState.status === "failed" && (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">Failed</span>
                      </>
                    )}
                    {fileState.status === "uploading" && (
                      <span className="text-blue-500">Uploading...</span>
                    )}
                    {fileState.status === "deleting_old" && (
                      <span className="text-orange-500">Replacing...</span>
                    )}
                    {fileState.status === "pending" && (
                      <span className="text-muted-foreground">Pending...</span>
                    )}
                    {fileState.status === "duplicate_exact" && (
                      <>
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-amber-500">Exact Duplicate</span>
                      </>
                    )}
                    {fileState.status === "duplicate_basename" && (
                      <>
                        <AlertCircle className="h-3 w-3 text-blue-500" />
                        <span className="text-blue-500">Name Conflict</span>
                      </>
                    )}
                  </div>
                  {(fileState.status === "uploading" ||
                    fileState.status === "deleting_old") && (
                    <Progress value={fileState.progress} className="h-1 mt-1" />
                  )}
                  {fileState.error && (
                    <p className="text-red-500 text-xs mt-1 truncate">
                      {fileState.error}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(fileState.id)}
                  disabled={isProcessingQueue}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {(exactDuplicateConflict || basenameConflict) && (
          <FileUploadConfirmModal
            isOpen={confirmModalOpen}
            onClose={handleCancelConflict}
            type={exactDuplicateConflict ? "exact" : "basename"}
            fileName={
              exactDuplicateConflict?.fileName ||
              basenameConflict?.fileName ||
              ""
            }
            onConfirmReplace={handleConfirmUpload}
            existingFiles={basenameConflict?.existingMatches || []}
            onConfirmContinue={handleConfirmUpload}
            isReplacing={isProcessingQueue}
          />
        )}
      </div>
      <Notification
        isVisible={notification.visible}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
        type={notification.type}
      />
    </>
  );
}
