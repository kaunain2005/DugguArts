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
    const materialId = searchParams.get("materialId") || "";
    const movementType = searchParams.get("movementType") || "";

    let query = adminDb.collection("inventory_movements") as any;

    if (materialId) {
      query = query.where("materialId", "==", materialId);
    }
    if (movementType) {
      query = query.where("movementType", "==", movementType);
    }

    query = query.orderBy("createdAt", "desc");

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const snapshot = await query.get();
    const movements = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
      };
    });

    let countQuery = adminDb.collection("inventory_movements") as any;
    if (materialId) {
      countQuery = countQuery.where("materialId", "==", materialId);
    }
    if (movementType) {
      countQuery = countQuery.where("movementType", "==", movementType);
    }

    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items: movements,
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get inventory movements error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch movements" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const adminDb = getAdminFirestore();

    if (!body.materialId || !body.movementType || body.quantity === undefined) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "materialId, movementType, and quantity are required" } },
        { status: 400 }
      );
    }

    if (!["in", "out", "adjustment"].includes(body.movementType)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid movement type" } },
        { status: 400 }
      );
    }

    const quantity = Number(body.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Quantity must be a positive number" } },
        { status: 400 }
      );
    }

    const materialDoc = await adminDb.collection("inventory").doc(body.materialId).get();

    if (!materialDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Material not found" } },
        { status: 404 }
      );
    }

    const materialData = materialDoc.data() as Record<string, unknown>;
    const currentStock = Number(materialData.currentStock) || 0;
    let newStock = currentStock;

    if (body.movementType === "in") {
      newStock += quantity;
    } else if (body.movementType === "out") {
      newStock -= quantity;
      if (newStock < 0) {
        return NextResponse.json(
          { success: false, error: { code: "INSUFFICIENT_STOCK", message: "Insufficient stock for this movement" } },
          { status: 400 }
        );
      }
    } else if (body.movementType === "adjustment") {
      newStock = quantity;
    }

    const now = new Date();
    const movementId = `MOV_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

    await adminDb.runTransaction(async (transaction: any) => {
      transaction.update(adminDb.collection("inventory").doc(body.materialId), {
        currentStock: newStock,
        updatedAt: now,
      });

      const movementData = {
        movementId,
        materialId: body.materialId,
        movementType: body.movementType,
        quantity,
        referenceId: body.referenceId || "",
        notes: body.notes || "",
        createdAt: now,
      };

      transaction.set(adminDb.collection("inventory_movements").doc(movementId), movementData);
    });

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "stock_movement_recorded",
        entityType: "inventory",
        entityId: body.materialId,
        details: { movementType: body.movementType, quantity, newStock },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: { movementId, newStock },
      message: "Stock movement recorded successfully",
    }, { status: 201 });
  } catch (error) {
    nodeAuthLogger.error("Create stock movement error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to record stock movement" } },
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