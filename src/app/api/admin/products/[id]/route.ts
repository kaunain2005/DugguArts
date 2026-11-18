import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const adminDb = getAdminFirestore();

    const productDoc = await adminDb.collection("products").doc(id).get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    const data = productDoc.data() as Record<string, unknown>;
    const product = {
      id: productDoc.id,
      ...data,
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
    };

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    nodeAuthLogger.error("Get product error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch product" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const adminDb = getAdminFirestore();

    const productDoc = await adminDb.collection("products").doc(id).get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Slug can only contain lowercase letters, numbers, and hyphens" } },
        { status: 400 }
      );
    }

    if (body.slug && body.slug !== (productDoc.data() as Record<string, unknown>)?.slug) {
      const existingSlug = await adminDb.collection("products").where("slug", "==", body.slug).limit(1).get();
      if (!existingSlug.empty) {
        return NextResponse.json(
          { success: false, error: { code: "SLUG_EXISTS", message: "Product with this slug already exists" } },
          { status: 409 }
        );
      }
    }

    if (body.categoryId) {
      const categoryDoc = await adminDb.collection("categories").doc(body.categoryId).get();
      if (!categoryDoc.exists) {
        return NextResponse.json(
          { success: false, error: { code: "CATEGORY_NOT_FOUND", message: "Category not found" } },
          { status: 404 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    const allowedFields = [
      "name", "slug", "categoryId", "description", "price",
      "imageUrl", "imagePublicId", "galleryUrls", "galleryPublicIds",
      "colours", "stockStatus", "featured", "active"
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "colours" && typeof body[field] === "string") {
          updateData[field] = body[field].split(",").map((c: string) => c.trim()).filter(Boolean);
        } else if (field === "price") {
          updateData[field] = Number(body[field]);
        } else if (field === "featured" || field === "active") {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    await adminDb.collection("products").doc(id).update(updateData);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "product_updated",
        entityType: "product",
        entityId: id,
        details: { updates: Object.keys(updateData) },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Update product error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update product" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const adminDb = getAdminFirestore();

    const productDoc = await adminDb.collection("products").doc(id).get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    await adminDb.collection("products").doc(id).update({
      active: false,
      updatedAt: new Date(),
    });

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "product_archived",
        entityType: "product",
        entityId: id,
        details: {},
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product archived successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Delete product error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to archive product" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}