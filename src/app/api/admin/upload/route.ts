import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/auth.config";
import { uploadImageFile, CLOUDINARY_FOLDERS, CloudinaryUploadResult } from "@/lib/cloudinary";
import { createSecureErrorResponse } from "@/lib/security";

async function verifyAdminAuth(request: NextRequest): Promise<{ success: boolean; response?: NextResponse }> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      ),
    };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session.user.email?.toLowerCase() || "";

  if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized" } },
        { status: 403 }
      ),
    };
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (!authResult.success) return authResult.response!;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No file provided" } },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid file type. Allowed: JPEG, PNG, WebP, SVG" } },
        { status: 400 }
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "File size exceeds 5MB limit" } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const { appsScriptService } = await import("@/services/apps-script.server");
    const result = await appsScriptService.adminRequest("products.uploadImage", {
      fileName: file.name,
      mimeType: file.type,
      base64Data,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Failed to upload image" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", process.env.SITE_URL || "http://localhost:3000");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-csrf-token");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}