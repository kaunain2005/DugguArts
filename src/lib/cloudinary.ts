import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("Cloudinary environment variables not fully configured");
}

cloudinary.config({
  cloud_name: cloudName || "demo",
  api_key: apiKey || "",
  api_secret: apiSecret || "",
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
  created_at: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: Record<string, unknown>;
  tags?: string[];
  context?: Record<string, string>;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const CLOUDINARY_FOLDERS = {
  PRODUCTS: "duggu-arts/products",
  CATEGORIES: "duggu-arts/categories",
  REVIEWS: "duggu-arts/reviews",
  PROFILES: "duggu-arts/profiles",
  CUSTOM_REQUESTS: "duggu-arts/custom-requests",
} as const;

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, SVG" };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size exceeds 5MB limit" };
  }
  
  return { valid: true };
}

export async function uploadToCloudinary(
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const uploadOptions: Record<string, unknown> = {
    resource_type: "auto",
    overwrite: true,
    ...options,
  };

  if (options.folder) {
    uploadOptions.folder = options.folder;
  }

  if (options.public_id) {
    uploadOptions.public_id = options.public_id;
  }

  if (options.transformation) {
    uploadOptions.transformation = options.transformation;
  }

  if (options.tags) {
    uploadOptions.tags = options.tags;
  }

  if (options.context) {
    uploadOptions.context = options.context;
  }

  const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error("Upload failed - no result returned"));
        }
      }
    );

    if (typeof file === "string") {
      if (file.startsWith("data:")) {
        uploadStream.end(file);
      } else {
        cloudinary.uploader.upload(file, uploadOptions).then(resolve).catch(reject);
      }
    } else {
      uploadStream.end(file);
    }
  });

  return uploadPromise;
}

export async function uploadImageFile(
  file: File,
  folder: string = CLOUDINARY_FOLDERS.PRODUCTS
): Promise<CloudinaryUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadToCloudinary(buffer, {
    folder,
    resource_type: "image",
    transformation: {
      quality: "auto:good",
      fetch_format: "auto",
    },
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === "ok" };
  } catch (error: unknown) {
    console.error("Cloudinary delete error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<{ success: boolean; results: Array<{ public_id: string; success: boolean }> }> {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    const results = Object.entries(result.deleted || {}).map(([public_id, result]) => ({
      public_id,
      success: result === "deleted",
    }));
    return { success: true, results };
  } catch (error: unknown) {
    console.error("Cloudinary bulk delete error:", error);
    return { success: false, results: [] };
  }
}

export function getOptimizedImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
  crop?: "fill" | "scale" | "fit" | "thumb";
  gravity?: "auto" | "center" | "face" | "center";
} = {}): string {
  const transformations: Record<string, unknown> = {
    fetch_format: options.format || "auto",
    quality: options.quality || "auto:good",
  };

  if (options.width) transformations.width = options.width;
  if (options.height) transformations.height = options.height;
  if (options.crop) transformations.crop = options.crop;
  if (options.gravity) transformations.gravity = options.gravity;

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations,
  });
}

export function getCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    if (match) {
      return match[1];
    }
    const altMatch = url.match(/\/([^/]+)\.\w+$/);
    if (altMatch) {
      return altMatch[1];
    }
    return null;
  } catch {
    return null;
  }
}