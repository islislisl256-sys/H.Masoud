-- Migration: add cloudinary_max_images column to app_accounts table
ALTER TABLE app_accounts
ADD COLUMN cloudinary_max_images INTEGER DEFAULT 100;
