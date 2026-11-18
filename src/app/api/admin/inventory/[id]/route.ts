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

    const materialDoc = await adminDb.collection("inventory").doc(id).get();

    if (!materialDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Material not found" } },
        { status: 404 }
      );
    }

    const data = materialDoc.data() as Record<string, unknown>;
    const material = {
      id: materialDoc.id,
      ...materialDoc.data(),
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
    };

    return NextResponse.json({
      success: true,
      data: material,
    });
  } catch (error) {
    nodeAuthLogger.error("Get material error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch material" } },
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

    const materialDoc = await adminDb.collection("inventory").doc(id).get();

    if (!materialDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Material not found" } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    const allowedFields = ["materialName", "category", "unit", "openingStock", "currentStock", "unitCost", "reorderLevel", "active"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (["openingStock", "currentStock", "unitCost", "reorderLevel"].includes(field)) {
          updateData[field] = Number(body[field]);
        } else if (field === "active") {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    await adminDb.collection("inventory").doc(id).update(updateData);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "material_updated",
        entityType: "inventory",
        entityId: id,
        details: { updates: Object.keys(updateData) },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Material updated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Update material error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update material" } },
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

    const materialDoc = await adminDb.collection("inventory").doc(id).get();

    if (!materialDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Material not found" } },
        { status: 404 }
      );
    }

    await adminDb.collection("inventory").doc(id).update({
      active: false,
      updatedAt: new Date(),
    });

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "material_deleted",
        entityType: "inventory",
        entityId: id,
        details: {},
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Delete material error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete material" } },
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