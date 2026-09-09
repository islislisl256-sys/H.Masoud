// Centralized Cloudinary Configuration & Automatic Background Credentials Helper

export const DEFAULT_CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dkgp5y78w",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "library_default_preset",
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "815234918742519",
  apiSecret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "default_system_secret_key",
  maxImages: 100
};

export function getCloudinaryCloudName(user: any): string {
  return user?.cloudinary_cloud_name?.trim() || DEFAULT_CLOUDINARY_CONFIG.cloudName;
}

export function getCloudinaryUploadPreset(user: any): string {
  return user?.cloudinary_upload_preset?.trim() || DEFAULT_CLOUDINARY_CONFIG.uploadPreset;
}

export function getCloudinaryApiKey(user: any): string {
  return user?.cloudinary_api_key?.trim() || DEFAULT_CLOUDINARY_CONFIG.apiKey;
}

export function getCloudinaryApiSecret(user: any): string {
  return user?.cloudinary_api_secret?.trim() || DEFAULT_CLOUDINARY_CONFIG.apiSecret;
}

export function getCloudinaryMaxImages(user: any): number {
  return user?.cloudinary_max_images ?? DEFAULT_CLOUDINARY_CONFIG.maxImages;
}
