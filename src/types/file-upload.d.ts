// Enhanced type definitions for file upload system
type NormalizedFileName = {
  original: string;
  normalized: string;
  baseName: string;
  extension: string;
  timestamp: string;
};

// Represents files already stored (e.g., in Firestore or from Cloudinary)

type ResourceType = "image" | "video" | "raw";

type FileTag = {
  id: string;
  label: string;
  color?: string;
};

type UploadStatus =
  | "idle"
  | "pending-title"
  | "pending"
  | "uploading"
  | "duplicates-check"
  | "replacing"
  | "removing"
  | "success"
  | "error";

type ExistingFile = {
  questionId?: string;
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  tags?: FileTag[];
  publicId?: string;
  path?: string;
  title?: string;
  status?: "removing";
  source?: "cloudinary" | "supabase" | "link";
};

// Represents files newly uploaded by the user
type FileWithPreview = {
  file: File;
  id: string;
  preview?: string;
  status:
    | "idle"
    | "uploading"
    | "success"
    | "error"
    | "pending-title"
    | "duplicates-check"
    | "removing"
    | "replacing"
    | "validating";
  progress: number;
  error?: string;
  url?: string;
  publicId?: string;
  path?: string;
  tags?: FileTag[];
  title?: string;
  uploadedAt?: Date;
  retryCount?: number;
  source?: "cloudinary" | "supabase";
  bypassDuplicateCheck?: boolean;
};

type UploadResult = SupabaseUploadResult | CloudinaryUploadResult;

type SupabaseFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  bucket: string;
  path: string;
  created_at: string;
};

type SupabaseOptions = {
  bucket?: string;
  folder?: string;
  allowedFormats?: string[];
  maxFiles?: number;
  maxFileSize?: number;
};

type SupabaseUploadResult = {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
};

type CloudinaryResource = {
  public_id: string;
  format: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  created_at: string;
};

type CheckDuplicateRequest = {
  fileName: string;
  folderName?: string;
  cloudName?: string;
  strictMode?: boolean;
  checkExtensions?: boolean;
};

type CheckDuplicateResponse = {
  exists: boolean;
  duplicateType?: "exact" | "basename";
  file?: {
    secure_url: string;
    public_id: string;
    resource_type: string;
    format: string;
    bytes: number;
    created_at: string;
  };
  allMatches?: Array<{
    secure_url: string;
    public_id: string;
    format: string;
    bytes: number;
    created_at: string;
  }>;
  message?: string;
  error?: string;
};

type CloudinaryOptions = {
  cloudName: string;
  uploadPreset: string;
  folderName?: string;
  allowedFormats?: string[];
  maxFileSize?: number;
  maxFiles: number;
  tags?: string[];
  transformation?: Record<string, unknown>;
  strictDuplicateCheck?: boolean; // New option for strict vs loose duplicate checking
};

type CloudinaryUploadResult = {
  success: boolean;
  url?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  createdAt?: string;
  version?: number;
  signature?: string;
  tags?: string[];
  error?: string;
  isDuplicate?: boolean;
  existingFile?: {
    url: string;
    publicId: string;
  };
};

type DeleteRequest = {
  publicId: string;
};

type DeleteResponse = {
  success: boolean;
  error?: string;
};
