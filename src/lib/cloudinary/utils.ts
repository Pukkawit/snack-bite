export const getStrictComparableName = (fileName: string): string => {
  const nameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
  return nameWithoutExtension.replace(/[^a-zA-Z0-9-_()\s]/g, "").toLowerCase();
};

export function getLooseComparableName(fullPublicIdOrFileName: string): string {
  const baseName = getStrictComparableName(fullPublicIdOrFileName);

  // Split by underscore and take the first part if it's a duplicated pattern
  const parts = baseName.split("_");
  let normalizedBaseName = baseName;

  // If we have exactly 2 parts and they're identical, use just one
  if (parts.length === 2 && parts[0] === parts[1]) {
    normalizedBaseName = parts[0];
  }

  // Normalize hyphens and underscores to a consistent format (e.g., all hyphens)
  // Convert to lowercase first for case-insensitive comparison
  const normalized = normalizedBaseName
    .toLowerCase()
    .replace(/_/g, "-") // Convert underscores to hyphens
    .replace(/\(/g, "") // Remove opening parentheses
    .replace(/\)/g, "") // Remove closing parentheses
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters (except numbers, hyphens, and whitespace)
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") // Trim leading/trailing hyphens
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();

  return normalized;
}

export function getBaseNameFromPublicId(
  publicId: string,
  format: string
): string {
  // Extract the filename part from the public_id
  const filenamePart = publicId.split("/").pop() || "";

  // If the filename doesn't have an extension, add the format as extension
  // This handles cases where Cloudinary stores files without extensions in public_id
  if (!filenamePart.includes(".") && format) {
    return `${filenamePart}.${format}`;
  }

  return filenamePart;
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
