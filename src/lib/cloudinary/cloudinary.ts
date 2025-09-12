export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
};

export const cloudinaryPreset =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
