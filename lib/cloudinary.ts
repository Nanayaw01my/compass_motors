import { v2 as cloudinary } from "cloudinary";

// Cloudinary auto-configures from CLOUDINARY_URL env var.
// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
// Fallback: configure from individual vars
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = { folder };
    if (publicId) uploadOptions.public_id = publicId;

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error("[Cloudinary] Upload error:", JSON.stringify(error));
          reject(new Error(error.message || "Cloudinary upload failed"));
        } else {
          resolve(result!.secure_url);
        }
      })
      .end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
