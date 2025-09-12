"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from "react-image-crop" // Import convertToPixelCrop
import "react-image-crop/dist/ReactCrop.css"
import Image from "next/image"
import browserImageCompression from "browser-image-compression"
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileUploadConfirmModal } from "@/components/FileUploadConfirmModal"
// Assuming global types are available from file-upload.d.ts
import { cn } from "@/lib/utils"
import { initializeGoogleDrive, downloadFileFromGoogleDrive } from "@/lib/google-drive"
import { getStrictComparableName, extractCloudinaryPublicId } from "@/lib/cloudinary-utils" // Import extractCloudinaryPublicId
import { uploadToCloudinary } from "@/lib/cloudinary/upload"
import { deleteFromCloudinary } from "@/lib/cloudinary/delete"

interface PhotoUploadProps {
  label: string
  name?: string
  value?: string | null // URL of uploaded photo
  onChange?: (url: string | null) => void
  onBlur?: () => void
  error?: string
  touched?: boolean
  targetDimensions?: { width: number; height: number }
  maxSizeMB?: number
  maxFileSizeMB?: number // Max file size before compression
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  cloudinaryOptions: {
    cloudName: string
    uploadPreset: string
    folderName?: string
  }
  // Custom validation function
  validate?: (file: File) => Promise<void> | void
  // Callbacks
  onUploadStart?: () => void
  onUploadSuccess?: (url: string) => void
  onUploadError?: (error: string) => void
}

export function PhotoUpload({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  targetDimensions = { width: 600, height: 600 },
  maxSizeMB = 2,
  maxFileSizeMB = 10,
  placeholder = "/images/profile_placeholder.jpg",
  disabled = false,
  required = false,
  className,
  cloudinaryOptions,
  validate,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [cropOpen, setCropOpen] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [cropping, setCropping] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadState, setUploadState] = useState<"idle" | "validating" | "uploading" | "deleting">("idle")

  // Duplicate checking states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [duplicateType, setDuplicateType] = useState<"exact" | "basename" | null>(null)
  const [duplicateFileName, setDuplicateFileName] = useState("")
  const [existingSimilarFiles, setExistingSimilarFiles] = useState<CloudinaryResource[]>([])
  const [pendingFile, setPendingFile] = useState<File | null>(null) // The file *after* cropping/processing
  const [originalSelectedFile, setOriginalSelectedFile] = useState<File | null>(null) // The file *before* cropping
  const [exactDuplicatePublicId, setExactDuplicatePublicId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null) // Declare completedCrop

  // Sync external value with internal preview
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  // Google Drive integration
  const [isGoogleDriveReady, setIsGoogleDriveReady] = useState(false)
  const [isGoogleDriveLoading, setIsGoogleDriveLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      setIsGoogleDriveLoading(true)
      const ready = await initializeGoogleDrive()
      setIsGoogleDriveReady(ready)
      setIsGoogleDriveLoading(false)
    }
    init()
  }, [])

  const openGooglePicker = useCallback(() => {
    if (!isGoogleDriveReady || !window.gapi || !window.google) {
      console.error("Google Drive API not ready")
      onUploadError?.("Google Drive API not ready. Please try again.")
      return
    }

    setIsGoogleDriveLoading(true)

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS_IMAGES)
      .setOAuthToken(process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ACCESS_TOKEN || "")
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || "")
      .setCallback(async (data: any) => {
        setIsGoogleDriveLoading(false)
        if (data.action === window.google.picker.Action.PICKED) {
          const fileInfo = data.docs[0]
          try {
            const fileObj = await downloadFileFromGoogleDrive(fileInfo.id)
            handleFileSelection(fileObj)
          } catch (error) {
            console.error("Error downloading from Google Drive:", error)
            onUploadError?.("Failed to download file from Google Drive. Check permissions.")
          }
        }
      })
      .build()

    picker.setVisible(true)
  }, [isGoogleDriveReady, onUploadError])

  const checkForDuplicates = async (fileName: string): Promise<CheckDuplicateResponse> => {
    try {
      const response = await fetch("/api/cloudinary/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          folderName: cloudinaryOptions.folderName,
          cloudName: cloudinaryOptions.cloudName, // Pass cloudName for API route
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check for duplicates")
      }

      return response.json()
    } catch (error) {
      console.error("Error checking for duplicates:", error)
      return {
        exists: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Image processing functions
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      imgRef.current = e.currentTarget
      const { naturalWidth, naturalHeight } = e.currentTarget // Use natural dimensions for initial crop calculation

      // Use requestAnimationFrame to ensure image is fully rendered and dimensions are stable
      requestAnimationFrame(() => {
        const aspect = targetDimensions.width / targetDimensions.height

        // Calculate an initial crop that fits the image while maintaining aspect ratio
        // This tries to make the crop as large as possible within the image,
        // while respecting the target aspect ratio.
        let initialPercentCrop
        const imageAspect = naturalWidth / naturalHeight

        if (imageAspect > aspect) {
          // Image is wider than target aspect
          initialPercentCrop = makeAspectCrop(
            {
              unit: "%",
              height: 100, // Fit height
            },
            aspect,
            naturalWidth,
            naturalHeight,
          )
        } else {
          // Image is taller or same aspect as target
          initialPercentCrop = makeAspectCrop(
            {
              unit: "%",
              width: 100, // Fit width
            },
            aspect,
            naturalWidth,
            naturalHeight,
          )
        }

        // Center the initial crop
        const centeredPercentCrop = centerCrop(initialPercentCrop, naturalWidth, naturalHeight)

        // Convert the initial PercentCrop to PixelCrop for completedCrop state
        const initialPixelCrop = convertToPixelCrop(centeredPercentCrop, naturalWidth, naturalHeight)

        setCrop(centeredPercentCrop) // Set the PercentCrop for ReactCrop display
        setCompletedCrop(initialPixelCrop) // Set the PixelCrop for canvas drawing
      })

      return false
    },
    [targetDimensions.width, targetDimensions.height],
  )

  async function handleFileSelection(file: File) {
    try {
      // Basic validation
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        throw new Error("Unsupported file format. Please use JPG or PNG.")
      }

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        throw new Error(`File too large. Please use an image under ${maxFileSizeMB}MB.`)
      }

      // Custom validation if provided
      if (validate) {
        await validate(file)
      }

      setOriginalSelectedFile(file) // Store the original file
      const imageUrl = URL.createObjectURL(file)
      setOriginalImage(imageUrl)
      setCropOpen(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid file"
      onUploadError?.(errorMessage)
    }
  }

  async function processImage(croppedImage: File): Promise<File> {
    try {
      return await browserImageCompression(croppedImage, {
        maxSizeMB,
        maxWidthOrHeight: Math.max(targetDimensions.width, targetDimensions.height),
        useWebWorker: true,
      })
    } catch (error) {
      console.error("Image compression failed:", error)
      return croppedImage
    }
  }

  async function handleCroppedImage() {
    if (!imgRef.current || !completedCrop || !originalImage || !originalSelectedFile) {
      console.error("Missing required data for cropping")
      return
    }

    setCropping(true)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      console.error("Canvas context not available")
      return
    }

    canvas.width = targetDimensions.width
    canvas.height = targetDimensions.height

    // Use the natural dimensions of the image for drawing
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      targetDimensions.width,
      targetDimensions.height,
    )

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas")
          return
        }

        // Ensure the file has the original name and correct type
        const fileExtension = originalSelectedFile.name.split(".").pop() || "jpg"
        const fileName = originalSelectedFile.name.replace(/\.[^/.]+$/, "") + "." + fileExtension // Reconstruct with original name and extension

        const file = new File([blob], fileName, {
          type: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`, // Use original extension for type
          lastModified: Date.now(),
        })

        try {
          const processedFile = await processImage(file)
          setPendingFile(processedFile)

          // Check for duplicates using the original file's name
          const duplicateResult = await checkForDuplicates(originalSelectedFile.name)

          if (duplicateResult.exists) {
            if (duplicateResult.duplicateType === "exact") {
              setDuplicateType("exact")
              setDuplicateFileName(originalSelectedFile.name) // Use original name for display
              setExactDuplicatePublicId(duplicateResult.file?.public_id || null)
              setConfirmModalOpen(true)
            } else if (duplicateResult.duplicateType === "basename") {
              setDuplicateType("basename")
              setDuplicateFileName(originalSelectedFile.name) // Use original name for display
              setExistingSimilarFiles(duplicateResult.allMatches || [])
              setConfirmModalOpen(true)
            }
          } else {
            // No duplicates, proceed with upload
            await uploadProcessedFile(processedFile)
          }

          setCropOpen(false)
        } catch (error) {
          console.error("Error processing cropped image:", error)
          onUploadError?.(error instanceof Error ? error.message : "Processing failed")
        } finally {
          setCropping(false)
        }
      },
      `image/${originalSelectedFile.name.split(".").pop() === "jpg" ? "jpeg" : originalSelectedFile.name.split(".").pop()}`, // Use original extension for blob type
      0.95,
    )
  }

  async function uploadProcessedFile(file: File) {
    setIsUploading(true)
    setUploadState("uploading")
    onUploadStart?.()

    try {
      // Delete previous image if exists and it's not the placeholder
      // This is for replacing the image currently linked to the form field.
      // This deletion is always done if a preview exists.
      if (preview && preview !== placeholder) {
        try {
          setUploadState("deleting")
          const publicIdToDelete = extractCloudinaryPublicId(preview) // Extract publicId from the URL
          if (publicIdToDelete) {
            const deleteResult = await deleteFromCloudinary(publicIdToDelete, cloudinaryOptions.cloudName) // Pass publicId directly
            if (!deleteResult.success) {
              console.warn("Failed to delete previous image:", deleteResult.error)
            }
          } else {
            console.warn("Could not extract publicId from preview URL for deletion:", preview)
          }
        } catch (deleteError) {
          console.warn("Non-fatal error during deletion of previous image:", deleteError)
        }
      }

      // Extract base filename for public_id_prefix using the new helper
      const baseFileName = getStrictComparableName(file.name)

      const uploadResult = await uploadToCloudinary(
        // Changed to await UploadResult
        file,
        file.name, // Pass file.name as originalFileName
        {
          cloudName: cloudinaryOptions.cloudName,
          uploadPreset: cloudinaryOptions.uploadPreset,
          folderName: cloudinaryOptions.folderName,
          publicIdPrefix: baseFileName, // Re-added public_id_prefix
        },
      )

      if (uploadResult.success && uploadResult.url) {
        setPreview(uploadResult.url)
        onChange?.(uploadResult.url)
        onUploadSuccess?.(uploadResult.url)
      } else {
        throw new Error(uploadResult.error || "Upload failed")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      onUploadError?.(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadState("idle")
      setPendingFile(null)
      setOriginalSelectedFile(null) // Clear original file after upload
    }
  }

  async function handleConfirmUpload() {
    if (!pendingFile || !cloudinaryOptions) return

    setConfirmModalOpen(false)

    if (duplicateType === "exact" && exactDuplicatePublicId) {
      // User confirmed to replace exact duplicate
      // First, delete the old file using its publicId (this is a signed request)
      try {
        setUploadState("deleting") // Indicate deletion is in progress
        const deleteResult = await deleteFromCloudinary(exactDuplicatePublicId, cloudinaryOptions.cloudName) // Pass publicId directly
        if (!deleteResult.success) {
          throw new Error(deleteResult.error || "Failed to delete old image")
        }
        console.log(`Old exact duplicate ${exactDuplicatePublicId} deleted.`)
      } catch (deleteError) {
        console.error("Error deleting old exact duplicate:", deleteError)
        onUploadError?.(deleteError instanceof Error ? deleteError.message : "Failed to delete old image")
        setIsUploading(false)
        setUploadState("idle")
        setPendingFile(null)
        setOriginalSelectedFile(null)
        setDuplicateType(null)
        setDuplicateFileName("")
        setExistingSimilarFiles([])
        setExactDuplicatePublicId(null)
        return // Stop here if deletion fails
      }
      // Then, upload the new file. It will be treated as a new upload with a public ID based on prefix.
      await uploadProcessedFile(pendingFile)
    } else {
      // User confirmed to continue with basename conflict or no conflict
      // Upload the new file. It will be treated as a new upload with a public ID based on prefix.
      await uploadProcessedFile(pendingFile)
    }

    // Reset states
    setDuplicateType(null)
    setDuplicateFileName("")
    setExistingSimilarFiles([])
    setExactDuplicatePublicId(null)
  }

  const handleCancelUpload = () => {
    setConfirmModalOpen(false)
    setPendingFile(null)
    URL.revokeObjectURL(originalImage || "") // Revoke URL if cropping was initiated
    setOriginalSelectedFile(null) // Clear original file if cancelled
    setDuplicateType(null)
    setDuplicateFileName("")
    setExistingSimilarFiles([])
    setExactDuplicatePublicId(null)
    setIsUploading(false) // Reset upload state if user cancels
    setUploadState("idle")
  }

  const getButtonText = () => {
    if (uploadState === "validating") return "Checking..."
    if (uploadState === "deleting") return "Replacing..."
    if (uploadState === "uploading") return "Uploading..."
    if (cropping) return "Processing..."
    return preview ? "Change Photo" : "Upload Photo"
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={name} className="font-medium text-sm mb-2 text-left">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="flex flex-col items-center">
        {/* Photo Preview */}
        <div className="relative h-40 w-40 border rounded-t-lg overflow-hidden">
          {preview ? (
            <Image src={preview || "/placeholder.svg"} alt="Photo preview" fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <Image src={placeholder || "/placeholder.svg"} alt="Photo placeholder" fill className="object-cover" />
            </div>
          )}
          {(isUploading || cropping) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={preview ? "secondary" : "default"}
              className="gap-2 w-40 rounded-none rounded-b-lg"
              disabled={disabled || isUploading || cropping}
              onBlur={onBlur}
            >
              <Upload className="h-4 w-4" />
              {getButtonText()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading || cropping}
            >
              From Device
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={openGooglePicker}
              disabled={!isGoogleDriveReady || disabled || isUploading || cropping || isGoogleDriveLoading}
            >
              {isGoogleDriveLoading ? "Loading..." : "From Google Drive"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelection(e.target.files[0])
          }
          e.target.value = "" // Clear the input so same file can be selected again
        }}
        disabled={disabled || isUploading || cropping}
        name={name}
        // Removed 'required={required}' from here
      />

      {/* Error Message */}
      {touched && error && <p className="text-sm text-destructive mt-2 text-left">{error}</p>}

      {/* Cropping Dialog */}
      <Dialog
        open={cropOpen}
        onOpenChange={(open) => {
          if (!open) {
            URL.revokeObjectURL(originalImage || "")
            setOriginalSelectedFile(null) // Clear original file if cropping cancelled
          }
          setCropOpen(open)
        }}
      >
        {/* FIX: Added max-h and overflow-y-auto to DialogContent for scrollability */}
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crop Your Photo</DialogTitle>
            <DialogDescription>
              Drag the corners to adjust the crop area. The image will be cropped to {targetDimensions.width}x
              {targetDimensions.height} pixels.
            </DialogDescription>
          </DialogHeader>
          <div className="relative flex items-center justify-center py-4">
            {originalImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={targetDimensions.width / targetDimensions.height}
                className="w-full" // Ensure ReactCrop takes full width
              >
                <img
                  key={originalImage} // Added key to force re-initialization
                  src={originalImage || "/placeholder.svg"}
                  alt="Original"
                  onLoad={onImageLoad}
                  className="max-w-full h-auto block" // FIX: Added h-auto and block for better scaling
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropOpen(false)} disabled={cropping}>
              Cancel
            </Button>
            <Button onClick={handleCroppedImage} disabled={cropping}>
              {cropping ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving...</span>
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirmation Modal */}
      {confirmModalOpen && duplicateType && (
        <FileUploadConfirmModal
          isOpen={confirmModalOpen}
          onClose={handleCancelUpload}
          type={duplicateType}
          fileName={duplicateFileName}
          isReplacing={isUploading}
          onConfirmReplace={handleConfirmUpload}
          existingFiles={existingSimilarFiles}
          onConfirmContinue={handleConfirmUpload}
        />
      )}
    </div>
  )
}


/* 

"use client"

import { useState } from "react"
import { PhotoUpload } from "@/components/PhotoUpload"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Example 1: Standalone usage
export function StandalonePhotoUpload() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const [touched, setTouched] = useState(false)

  const handleValidation = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File too large (max 5MB)")
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      throw new Error("Only JPEG and PNG files are allowed")
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Standalone Photo Upload</h2>
      <PhotoUpload
        label="Profile Photo"
        value={photoUrl}
        onChange={(url) => {
          setPhotoUrl(url)
          setTouched(true) // Manually set touched for standalone example
        }}
        onBlur={() => setTouched(true)} // Manually set touched on blur
        error={error}
        touched={touched}
        validate={handleValidation}
        targetDimensions={{ width: 400, height: 400 }}
        maxSizeMB={2}
        cloudinaryOptions={{
          cloudName: "your_cloud_name",
          uploadPreset: "your_preset",
          folderName: "profile_photos",
        }}
        onUploadStart={() => setError("")}
        onUploadError={setError}
        onUploadSuccess={(url) => console.log("Uploaded:", url)}
        required
      />
      {photoUrl && <p className="mt-2 text-sm text-green-600">Photo uploaded successfully!</p>}
    </div>
  )
}

// Example 2: React Hook Form with Zod
const schema = z.object({
  profilePhoto: z.string().min(1, "Profile photo is required"),
  name: z.string().min(1, "Name is required"),
})

type FormData = z.infer<typeof schema>

export function ReactHookFormExample() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      profilePhoto: "",
      name: "",
    },
  })

  const profilePhoto = watch("profilePhoto")

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data)
    alert("Form submitted successfully!")
  }

  return (
    <div className="p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">React Hook Form + Zod</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input id="name" {...register("name")} className="w-full p-2 border rounded" placeholder="Enter your name" />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <PhotoUpload
            label="Profile Photo"
            name="profilePhoto" // Pass name for RHF registration
            value={profilePhoto}
            onChange={(url) => setValue("profilePhoto", url || "", { shouldValidate: true, shouldDirty: true })}
            onBlur={() => register("profilePhoto").onBlur({ target: { name: "profilePhoto", value: profilePhoto } })} // Manually trigger RHF blur
            error={errors.profilePhoto?.message}
            touched={touchedFields.profilePhoto}
            targetDimensions={{ width: 300, height: 300 }}
            cloudinaryOptions={{
              cloudName: "your_cloud_name",
              uploadPreset: "your_preset",
              folderName: "profiles",
            }}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  )
}

// Example 3: Custom validation with async check
export function CustomValidationExample() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const [touched, setTouched] = useState(false)

  const customValidation = async (file: File) => {
    // Simulate async validation (e.g., checking file against a service)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (file.name.includes("invalid")) {
      throw new Error("This filename is not allowed")
    }

    // Check image dimensions
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        if (img.width < 200 || img.height < 200) {
          reject(new Error("Image must be at least 200x200 pixels"))
        } else {
          resolve()
        }
      }
      img.onerror = () => reject(new Error("Invalid image file"))
      img.src = URL.createObjectURL(file)
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Custom Async Validation</h2>
      <PhotoUpload
        label="Company Logo"
        value={photoUrl}
        onChange={(url) => {
          setPhotoUrl(url)
          setTouched(true)
        }}
        onBlur={() => setTouched(true)}
        error={error}
        touched={touched}
        validate={customValidation}
        targetDimensions={{ width: 500, height: 500 }}
        cloudinaryOptions={{
          cloudName: "your_cloud_name",
          uploadPreset: "your_preset",
          folderName: "custom_validation",
        }}
        onUploadStart={() => setError("")}
        onUploadError={setError}
        placeholder="/custom-placeholder.jpg"
      />
    </div>
  )
}


*/
