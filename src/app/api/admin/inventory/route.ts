import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const adminDb = getAdminFirestore();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const category = searchParams.get("category") || "";
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";
    const search = searchParams.get("search") || "";

    let query = adminDb.collection("inventory") as any;

    if (category) {
      query = query.where("category", "==", category);
    }
    if (lowStockOnly) {
      query = query.where("isLowStock", "==", true);
    }

    query = query.orderBy("materialName", "asc");

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const snapshot = await query.get();
    let materials = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
        updatedAt: getTimestampISO(data, "updatedAt"),
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      materials = materials.filter((m: any) =>
        m.materialName?.toLowerCase().includes(searchLower) ||
        m.category?.toLowerCase().includes(searchLower)
      );
    }

    let countQuery = adminDb.collection("inventory") as any;
    if (category) {
      countQuery = countQuery.where("category", "==", category);
    }
    if (lowStockOnly) {
      countQuery = countQuery.where("isLowStock", "==", true);
    }

    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items: materials,
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get inventory error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch inventory" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const adminDb = getAdminFirestore();

    const requiredFields = ["materialName", "category", "unit", "openingStock", "currentStock", "unitCost", "reorderLevel"];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: `${field} is required` } },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const materialId = `MAT_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

    const materialData = {
      materialId,
      materialName: body.materialName,
      category: body.category,
      unit: body.unit,
      openingStock: Number(body.openingStock),
      currentStock: Number(body.currentStock),
      unitCost: Number(body.unitCost),
      reorderLevel: Number(body.reorderLevel),
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection("inventory").doc(materialId).set(materialData);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "material_created",
        entityType: "inventory",
        entityId: materialId,
        details: { materialName: body.materialName },
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: { materialId },
      message: "Material created successfully",
    }, { status: 201 });
  } catch (error) {
    nodeAuthLogger.error("Create material error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create material" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}