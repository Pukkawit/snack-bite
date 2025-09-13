"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Notification from "@/components/Notification";
import { FileUploadConfirmModal } from "@/components/FileUploadConfirmModal"; // Import the modal
import { getStrictComparableName } from "@/lib/cloudinary-utils";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import { deleteFromCloudinary } from "@/lib/cloudinary/delete"; // Declare the variable before using it

interface NotificationState {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
}

interface ImageUploadFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "onBlur" | "value" | "ref" | "type"
  > {
  label: string;
  instruction?: string;
  labelClassName?: string;
  inputClassName?: string;
  width?: string;
  error?: string | false | undefined;
  touched?: boolean;
  imageUploadButtonText1?: string;
  imageUploadButtonText2?: string;
  imageUploadButtonDisabled?: boolean;
  cloudinaryOptions: {
    cloudName: string;
    uploadPreset: string;
    folderName?: string;
  };
  imageDimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    previewWidth?: string;
    previewHeight?: string;
  };
  value?: string | number | string[] | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
}

const ImageUploadField = React.forwardRef<
  HTMLInputElement,
  ImageUploadFieldProps
>(
  (
    {
      label,
      instruction,
      id,
      name,
      value, // This is the value from RHF or parent
      required = false,
      className = "",
      labelClassName = "",
      /*  inputClassName = "", */
      disabled = false, // This prop is correctly typed and used below
      width = "100%",
      error,
      touched,
      imageUploadButtonText1,
      imageUploadButtonText2,
      imageUploadButtonDisabled,
      cloudinaryOptions,
      imageDimensions,
      onChange, // This is the onChange from RHF or parent
      onBlur, // This is the onBlur from RHF or parent
      /*  autoFocus,
      onKeyDown, */
      ...htmlInputProps
    },
    ref
  ) => {
    const [internalImageUrl, setInternalImageUrl] = useState<string>(
      String(value || "")
    );
    const [isUploading, setIsUploading] = useState(false);
    const [uploadState, setUploadState] = useState<
      "idle" | "validating" | "uploading" | "deleting"
    >("idle");

    // State for the confirmation modal
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmModalType, setConfirmModalType] = useState<
      "exact" | "basename" | null
    >(null);
    const [confirmFileName, setConfirmFileName] = useState("");
    const [existingSimilarFiles, setExistingSimilarFiles] = useState<
      CloudinaryResource[]
    >([]);
    const fileToProcessRef = useRef<File | null>(null); // To hold the file while modal is open
    const exactDuplicatePublicIdRef = useRef<string | null>(null); // To hold the public_id of the exact duplicate

    const [notification, setNotification] = useState<NotificationState>({
      message: "",
      type: "error",
      visible: false,
    });

    // Sync external value with internal state
    useEffect(() => {
      setInternalImageUrl(String(value || ""));
    }, [value]);

    // --- Cloudinary API Calls ---
    const checkCloudinaryForDuplicates = async (
      fileName: string,
      folderName?: string
    ): Promise<CheckDuplicateResponse> => {
      try {
        const response = await fetch("/api/cloudinary/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            folderName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to check for duplicates");
        }

        return response.json() as Promise<CheckDuplicateResponse>;
      } catch (error) {
        console.error("Error checking for duplicates:", error);
        setNotification({
          message: "Failed to check for duplicate files. Please try again.",
          type: "error",
          visible: true,
        });
        return {
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    };

    // --- Image Validation ---
    const validateImageDimensions = async (
      file: File,
      dimensions: ImageUploadFieldProps["imageDimensions"]
    ): Promise<void> => {
      console.group("[Debug] Image Validation");
      console.log("Starting validation for file:", file.name);

      return new Promise((resolve, reject) => {
        if (!dimensions) {
          console.log("No dimensions specified - skipping validation");
          console.groupEnd();
          return resolve();
        }

        console.log("Validation rules:", dimensions);

        const img = new window.Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          console.log(
            "Image loaded - actual dimensions:",
            img.width,
            "x",
            img.height
          );

          const errors: string[] = [];
          const addError = (message: string) => {
            console.error("Validation failed:", message);
            errors.push(message);
          };

          if (
            typeof dimensions.minWidth === "number" &&
            img.width < dimensions.minWidth
          ) {
            addError(
              `Width (${img.width}px) below minimum (${dimensions.minWidth}px)`
            );
          }
          if (
            typeof dimensions.maxWidth === "number" &&
            img.width > dimensions.maxWidth
          ) {
            addError(
              `Width (${img.width}px) exceeds maximum (${dimensions.maxWidth}px)`
            );
          }

          if (
            typeof dimensions.minHeight === "number" &&
            img.height < dimensions.minHeight
          ) {
            addError(
              `Height (${img.height}px) below minimum (${dimensions.minHeight}px)`
            );
          }
          if (
            typeof dimensions.maxHeight === "number" &&
            img.height > dimensions.maxHeight
          ) {
            addError(
              `Height (${img.height}px) exceeds maximum (${dimensions.maxHeight}px)`
            );
          }

          if (errors.length > 0) {
            console.log("Validation failed with errors:", errors);
            console.groupEnd();
            reject(new Error(errors.join("\n")));
          } else {
            console.log("Validation passed");
            console.groupEnd();
            resolve();
          }
        };

        img.onerror = () => {
          console.error("Image loading failed");
          console.groupEnd();
          reject(new Error("Could not load image for validation"));
        };

        try {
          console.log("Creating object URL for validation");
          img.src = URL.createObjectURL(file);
        } catch (e) {
          console.error("Error creating object URL:", e);
          console.groupEnd();
          reject(new Error("Invalid image file"));
        }
      });
    };

    // --- Main File Processing Logic ---
    const processFileUpload = async (file: File) => {
      if (!cloudinaryOptions) {
        console.warn("Cloudinary options missing, cannot upload.");
        setNotification({
          message: "Cloudinary configuration is missing.",
          type: "error",
          visible: true,
        });
        setIsUploading(false);
        setUploadState("idle");
        return;
      }

      setIsUploading(true); // Set uploading state when actual upload begins
      setUploadState("uploading");
      console.groupCollapsed("[Image Upload Debug]");
      console.log(
        "Processing file:",
        file.name,
        `${(file.size / 1024).toFixed(2)}kb`
      );

      try {
        setUploadState("validating");
        console.log("Validating image dimensions...");
        await validateImageDimensions(file, imageDimensions);
        console.log("Dimension validation passed");

        // Delete previous image associated with THIS field (if any)
        // This is for replacing the image currently linked to the form field,
        // not necessarily an exact duplicate in Cloudinary.
        if (internalImageUrl) {
          try {
            setUploadState("deleting");
            console.log(
              "Deleting previous image associated with this field:",
              internalImageUrl
            );
            await deleteFromCloudinary(
              String(internalImageUrl),
              cloudinaryOptions.cloudName
            ); // Pass cloudName
            console.log("Previous image deleted successfully");
          } catch (deleteError) {
            console.warn(
              "Non-fatal error during deletion of previous field image:",
              deleteError
            );
            // Do not re-throw, continue with upload
          }
        }

        console.log("Uploading to Cloudinary...");
        // Extract base filename for public_id_prefix using the new helper
        const baseFileName = getStrictComparableName(file.name);

        const uploadResult = await uploadToCloudinary(file, file.name, {
          // Pass file.name as originalFileName
          cloudName: cloudinaryOptions.cloudName.trim(),
          uploadPreset: cloudinaryOptions.uploadPreset.trim(),
          folderName: cloudinaryOptions.folderName?.trim(),
          publicIdPrefix: baseFileName, // Re-added public_id_prefix
        });
        console.log("Upload successful. URL:", uploadResult);

        setInternalImageUrl(uploadResult.url || ""); // Update internal state with the URL string, fallback to empty string
        if (onChange) {
          const syntheticEvent = {
            target: { value: uploadResult.url, name: name || "" },
            currentTarget: { value: uploadResult.url, name: name || "" },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent); // Propagate to RHF
        }

        setNotification({
          message: "Image uploaded successfully",
          type: "success",
          visible: true,
        });
      } catch (error) {
        console.error("Upload process failed:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Image upload failed";

        setNotification({
          message: errorMessage.includes("Invalid dimensions")
            ? `Please check image size:\n${errorMessage}`
            : errorMessage,
          type: "error",
          visible: true,
        });
      } finally {
        console.log("Upload process complete");
        console.groupEnd();
        setIsUploading(false);
        setUploadState("idle");
        fileToProcessRef.current = null; // Clear the ref
        exactDuplicatePublicIdRef.current = null; // Clear the ref
      }
    };

    const handleImageChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) {
        console.warn("No file selected.");
        return;
      }

      e.target.value = ""; // Clear the file input after selection
      fileToProcessRef.current = file; // Store the file for later processing

      // Do NOT set isUploading/uploadState here. Only set it after user confirms.
      // setUploadState("validating"); // Initial state for duplicate check

      console.groupCollapsed("[Image Upload - Duplicate Check Debug]");
      console.log("Selected file for duplicate check:", file.name);

      try {
        const duplicateCheckResult = await checkCloudinaryForDuplicates(
          file.name,
          cloudinaryOptions.folderName
        );

        if (duplicateCheckResult.exists) {
          if (duplicateCheckResult.duplicateType === "exact") {
            setConfirmModalType("exact");
            setConfirmFileName(file.name);
            setConfirmModalOpen(true);
            // Store the public_id of the existing exact duplicate for deletion
            if (duplicateCheckResult.file?.public_id) {
              exactDuplicatePublicIdRef.current =
                duplicateCheckResult.file.public_id;
            }
            console.log("Exact duplicate found. Opening confirmation modal.");
          } else if (duplicateCheckResult.duplicateType === "basename") {
            setConfirmModalType("basename");
            setConfirmFileName(file.name);
            setExistingSimilarFiles(duplicateCheckResult.allMatches || []);
            setConfirmModalOpen(true);
            console.log(
              "Basename duplicate found. Opening confirmation modal."
            );
          }
        } else {
          console.log(
            "No duplicates found. Proceeding with upload (Cloudinary will auto-generate public_id)."
          );
          await processFileUpload(file);
        }
      } catch (error) {
        console.error("Error during duplicate check:", error);
        setNotification({
          message: "Failed to check for duplicates. Please try again.",
          type: "error",
          visible: true,
        });
        setIsUploading(false); // Ensure uploading state is reset on error
        setUploadState("idle");
        fileToProcessRef.current = null;
        exactDuplicatePublicIdRef.current = null;
      } finally {
        console.groupEnd();
      }
    };

    const handleConfirmReplace = async () => {
      setConfirmModalOpen(false);
      if (
        !fileToProcessRef.current ||
        !exactDuplicatePublicIdRef.current ||
        !cloudinaryOptions
      ) {
        console.error(
          "Missing file, public ID, or cloudinary options for replacement."
        );
        setNotification({
          message: "Failed to replace image: Missing data.",
          type: "error",
          visible: true,
        });
        setIsUploading(false);
        setUploadState("idle");
        return;
      }

      setIsUploading(true); // Set uploading state when user confirms
      setUploadState("deleting"); // Indicate deletion is in progress

      try {
        console.log(
          "Attempting to delete existing exact duplicate:",
          exactDuplicatePublicIdRef.current
        );
        // Construct a dummy URL to pass to deleteFromCloudinary, as it expects a URL
        const dummyUrl = `https://res.cloudinary.com/${cloudinaryOptions.cloudName}/image/upload/${exactDuplicatePublicIdRef.current}`;
        await deleteFromCloudinary(dummyUrl, cloudinaryOptions.cloudName); // Pass cloudName
        console.log("Existing exact duplicate deleted successfully.");

        // After successful deletion, proceed with uploading the new file
        // It will be treated as a new upload, with a public ID based on prefix.
        await processFileUpload(fileToProcessRef.current);
      } catch (error) {
        console.error(
          "Error during replace (delete then upload) process:",
          error
        );
        setNotification({
          message: `Failed to replace image: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          type: "error",
          visible: true,
        });
        setIsUploading(false);
        setUploadState("idle");
      } finally {
        fileToProcessRef.current = null;
        exactDuplicatePublicIdRef.current = null;
      }
    };

    const handleConfirmContinue = async () => {
      setConfirmModalOpen(false);
      if (fileToProcessRef.current) {
        // User confirmed continue: Cloudinary will auto-generate public_id based on prefix
        await processFileUpload(fileToProcessRef.current);
      }
    };

    const handleModalClose = () => {
      setConfirmModalOpen(false);
      setConfirmModalType(null);
      setConfirmFileName("");
      setExistingSimilarFiles([]);
      setIsUploading(false); // Reset upload state if user cancels
      setUploadState("idle");
      fileToProcessRef.current = null; // Clear the ref
      exactDuplicatePublicIdRef.current = null; // Clear the ref
    };

    const getButtonText = () => {
      if (uploadState === "validating") return "Checking..."; // During duplicate check
      if (uploadState === "deleting") return "Replacing..."; // During delete-then-upload
      if (uploadState === "uploading") return "Uploading...";
      return internalImageUrl
        ? imageUploadButtonText2 || "Replace image"
        : imageUploadButtonText1 || "Upload image";
    };

    return (
      <>
        <div
          className={cn(
            `flex flex-col gap-[2px]`,
            className,
            disabled ? "opacity-50 cursor-not-allowed" : "" // Changed to ternary
          )}
          style={{ width }}
        >
          {label && (
            <div className="flex justify-between items-center">
              <label
                htmlFor={id}
                className={cn(
                  `block text-sm font-medium text-foreground/90 tracking-wide`,
                  labelClassName
                )}
              >
                {label}
              </label>
            </div>
          )}
          {instruction && (
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              {instruction}
            </p>
          )}
          {imageDimensions && (
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Required dimensions:{" "}
              {[
                imageDimensions.maxWidth &&
                  `Max width: ${imageDimensions.maxWidth}px`,
                imageDimensions.maxHeight &&
                  `Max height: ${imageDimensions.maxHeight}px`,
              ]
                .filter(Boolean)
                .join(" | ")}
            </p>
          )}
          {internalImageUrl && typeof internalImageUrl === "string" && (
            <div className="mb-3">
              <p className="text-sm mb-1 text-muted-foreground">Preview</p>
              <div
                className={cn(
                  `grid place-content-center relative border rounded-md overflow-hidden`,
                  imageDimensions?.maxWidth &&
                    imageDimensions?.maxHeight &&
                    imageDimensions.maxWidth > imageDimensions.maxHeight
                    ? "aspect-video"
                    : "aspect-square"
                )}
              >
                <Image
                  src={internalImageUrl || "/placeholder.svg"}
                  alt="Preview"
                  width={imageDimensions?.maxWidth}
                  height={imageDimensions?.maxHeight}
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="relative flex items-center">
            {/* Hidden input for RHF to register the value */}
            <input
              {...htmlInputProps}
              type="hidden" // Keep this hidden, the actual file input is separate
              ref={ref}
              id={id}
              name={name}
              value={internalImageUrl} // RHF will get the URL from here
              onChange={onChange} // Propagate changes to RHF
              onBlur={onBlur}
              required={required}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => document.getElementById(`${id}-file`)?.click()}
              className={cn(
                `p-2 h-[2.45rem] text-sm rounded-md whitespace-nowrap w-full`,
                internalImageUrl
                  ? "bg-secondary hover:bg-secondary-hover text-secondary-foreground"
                  : "bg-primary hover:bg-primary-hover text-primary-foreground",
                isUploading ? "opacity-50 cursor-wait" : ""
              )}
              disabled={imageUploadButtonDisabled || disabled || isUploading} // Disable button during any upload state
            >
              {getButtonText()}
            </button>
            <input
              type="file"
              name={`${id}-file`}
              id={`${id}-file`}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            {touched && error ? (
              <p className="mt-1 text-sm text-destructive text-left">{error}</p>
            ) : null}
          </div>
        </div>

        <Notification
          isVisible={notification.visible}
          message={notification.message}
          onClose={() =>
            setNotification((prev) => ({ ...prev, visible: false }))
          }
          type={notification.type}
        />

        {confirmModalOpen && confirmModalType && (
          <FileUploadConfirmModal
            isOpen={confirmModalOpen}
            onClose={handleModalClose}
            type={confirmModalType}
            fileName={confirmFileName}
            isReplacing={isUploading}
            onConfirmReplace={handleConfirmReplace}
            existingFiles={existingSimilarFiles}
            onConfirmContinue={handleConfirmContinue}
          />
        )}
      </>
    );
  }
);

ImageUploadField.displayName = "ImageUploadField";

export default ImageUploadField;
