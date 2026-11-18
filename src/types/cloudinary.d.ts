declare module "cloudinary" {
  export interface ConfigOptions {
    cloud_name: string;
    api_key: string;
    api_secret: string;
    secure?: boolean;
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

  export interface UploadResult {
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

  export const v2: {
    config: (options: ConfigOptions) => void;
    uploader: {
      upload_stream: (options: Record<string, unknown>, callback: (error: Error | null, result: UploadResult | undefined) => void) => NodeJS.WritableStream;
      upload: (file: string | Buffer, options: Record<string, unknown>) => Promise<UploadResult>;
      destroy: (publicId: string) => Promise<{ result: string }>;
      explicit: (publicId: string, options: Record<string, unknown>) => Promise<UploadResult>;
    };
    api: {
      delete_resources: (publicIds: string[]) => Promise<{ deleted: Record<string, string> }>;
    };
    url: (publicId: string, options: Record<string, unknown>) => string;
  };
}