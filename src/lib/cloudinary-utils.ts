// Helper to get a strict comparable base name (for exact matches)
export function getStrictComparableName(
  fullPublicIdOrFileName: string
): string {
  // Get the part after the last slash (filename with extension)
  const nameWithExt =
    fullPublicIdOrFileName.split("/").pop() || fullPublicIdOrFileName;

  // Remove the extension
  const lastDotIndex = nameWithExt.lastIndexOf(".");
  let baseName =
    lastDotIndex !== -1 ? nameWithExt.substring(0, lastDotIndex) : nameWithExt;

  // Remove Cloudinary's random suffix (e.g., "_qrfwhi")
  // This regex targets an underscore followed by exactly 6 alphanumeric characters at the end.
  baseName = baseName.replace(/(_[a-zA-Z0-9]{6})$/, "");

  return baseName;
}

// Helper to get a loose comparable base name (for basename matches)
export function getLooseComparableName(fullPublicIdOrFileName: string): string {
  // Start with the strict comparable name
  const baseName = getStrictComparableName(fullPublicIdOrFileName);

  // Normalize hyphens and underscores to a consistent format (e.g., all hyphens)
  // Convert to lowercase first for case-insensitive comparison
  const normalized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // Convert non-alphanumeric (except numbers) to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens

  return normalized;
}

export const extractCloudinaryPublicId = (url: string): string | null => {
  if (!url || typeof url !== "string" || !url.trim()) {
    console.log("❌ Invalid or empty URL for Cloudinary publicId extraction");
    return null;
  }

  try {
    // Cloudinary URL patterns:
    // https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    // https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    // https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?([^/]+?)(?:\.[^/]+)?$/);
    if (match && match[1]) {
      // The public_id might contain folders, e.g., 'folder/subfolder/image_name'
      // We need to ensure we capture the full public_id including folders.
      // The regex above captures everything after /upload/(vXX/)? up to the last dot before the end.
      // If it's a transformation URL, it might be more complex.
      // Let's try a more robust approach by splitting and finding the 'upload' segment.

      const parts = url.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1 && parts.length > uploadIndex + 1) {
        // After 'upload', the next part might be 'v' (version) or the public_id itself.
        let publicIdParts = parts.slice(uploadIndex + 1);
        if (publicIdParts[0].startsWith("v")) {
          // Skip version part if present
          publicIdParts = publicIdParts.slice(1);
        }
        const fullPublicIdWithExtension = publicIdParts.join("/");
        // Remove the file extension
        const lastDotIndex = fullPublicIdWithExtension.lastIndexOf(".");
        if (lastDotIndex !== -1) {
          return fullPublicIdWithExtension.substring(0, lastDotIndex);
        }
        return fullPublicIdWithExtension; // No extension found, return as is
      }
    }

    console.log("❌ Could not extract publicId from URL pattern");
    return null;
  } catch (error) {
    console.error("Error extracting Cloudinary publicId:", error);
    return null;
  }
};
