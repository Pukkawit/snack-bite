/* import { getStrictComparableName } from "./utils"; */

export async function uploadToCloudinary(
  file: File,
  originalFileName: string,
  options: {
    cloudName: string;
    uploadPreset: string;
    folderName?: string;
    publicIdPrefix?: string; // use this to build public_id prefix
  },
  onProgress?: (p: number) => void,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file, originalFileName);
  formData.append("upload_preset", options.uploadPreset);

  // Clean folder path
  const folder = options.folderName
    ? options.folderName.replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/")
    : "";

  // Build the public_id manually, e.g. 'folderName/publicIdPrefix_basenameWithoutExt'
  // Extract basename without extension from originalFileName
  const baseNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");
  const publicId = (folder ? folder + "/" : "") +
    (options.publicIdPrefix ? options.publicIdPrefix + "_" : "") +
    baseNameWithoutExt;

  formData.append("public_id", publicId);

  if (folder) {
    formData.append("folder", folder);
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${options.cloudName.trim()}/upload`,
      true,
    );

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          success: true,
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          format: data.format,
          bytes: data.bytes,
          width: data.width,
          height: data.height,
          createdAt: data.created_at,
          version: data.version,
          signature: data.signature,
          tags: data.tags,
          isDuplicate: data.existing,
        });
      } else {
        const errorData = JSON.parse(xhr.responseText);
        console.error("Cloudinary upload API error response:", errorData);
        resolve({
          success: false,
          error: errorData.message || "Upload failed",
        });
      }
    };

    xhr.onerror = () => {
      console.error("Network error or upload failed");
      resolve({ success: false, error: "Network error or upload failed" });
    };

    xhr.send(formData);
  });
}
