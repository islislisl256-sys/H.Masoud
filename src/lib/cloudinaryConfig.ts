// Centralized Cloudinary Configuration & Automatic Background Credentials Helper

export const DEFAULT_CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dkgp5y78w",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "library_default_preset",
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "815234918742519",
  apiSecret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "default_system_secret_key",
  maxImages: 100
};

export function getCloudinaryCloudName(user: any): string {
  if (user?.cloudinary_cloud_name?.trim()) return user.cloudinary_cloud_name.trim();
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem("cloudinary_cloud_name");
    if (local) return local;
  }
  return DEFAULT_CLOUDINARY_CONFIG.cloudName;
}

export function getCloudinaryUploadPreset(user: any): string {
  if (user?.cloudinary_upload_preset?.trim()) return user.cloudinary_upload_preset.trim();
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem("cloudinary_upload_preset");
    if (local) return local;
  }
  return DEFAULT_CLOUDINARY_CONFIG.uploadPreset;
}

export function getCloudinaryApiKey(user: any): string {
  if (user?.cloudinary_api_key?.trim()) return user.cloudinary_api_key.trim();
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem("cloudinary_api_key");
    if (local) return local;
  }
  return DEFAULT_CLOUDINARY_CONFIG.apiKey;
}

export function getCloudinaryApiSecret(user: any): string {
  if (user?.cloudinary_api_secret?.trim()) return user.cloudinary_api_secret.trim();
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem("cloudinary_api_secret");
    if (local) return local;
  }
  return DEFAULT_CLOUDINARY_CONFIG.apiSecret;
}

export function getCloudinaryMaxImages(user: any): number {
  return user?.cloudinary_max_images ?? DEFAULT_CLOUDINARY_CONFIG.maxImages;
}
