import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
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

    const customerDoc = await adminDb.collection("users").doc(id).get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    const data = customerDoc.data() as Record<string, unknown>;
    const customer = {
      id: customerDoc.id,
      ...data,
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
      lastLoginAt: getTimestampISO(data, "lastLoginAt"),
    };

    const ordersSnapshot = await adminDb
      .collection("orders")
      .where("customerId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
        updatedAt: getTimestampISO(data, "updatedAt"),
      };
    });

    const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        orders,
        totalOrders: orders.length,
        totalSpent,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get customer error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch customer" } },
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

    const customerDoc = await adminDb.collection("users").doc(id).get();

    if (!customerDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    const allowedFields = ["name", "email", "phone", "active", "role"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "active") {
          updateData[field] = Boolean(body[field]);
        } else if (field === "role") {
          if (!["admin", "customer"].includes(body[field])) {
            return NextResponse.json(
              { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid role" } },
              { status: 400 }
            );
          }
          updateData[field] = body[field];
          
          const adminAuth = await import("@/lib/firebase/admin").then(m => m.getAdminAuth());
          await adminAuth.setCustomUserClaims(id, { role: body[field] });
        } else {
          updateData[field] = body[field];
        }
      }
    }

    await adminDb.collection("users").doc(id).update(updateData);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "customer_updated",
        entityType: "customer",
        entityId: id,
        details: { updates: Object.keys(updateData) },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Update customer error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update customer" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}