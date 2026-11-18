import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

const VALID_ORDER_STATUSES = [
  "new", "contacted", "confirmed", "in_production", "ready", 
  "dispatched", "delivered", "completed", "cancelled"
];

const VALID_PAYMENT_STATUSES = [
  "unpaid", "advance_received", "partially_paid", "paid", "refunded"
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const adminDb = getAdminFirestore();

    const orderDoc = await adminDb.collection("orders").doc(id).get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const data = orderDoc.data() as Record<string, unknown>;
    const order = {
      id: orderDoc.id,
      ...data,
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
    };

    const itemsSnapshot = await adminDb
      .collection("order_items")
      .where("orderId", "==", id)
      .get();

    const items = itemsSnapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
      };
    });

    return NextResponse.json({
      success: true,
      data: { ...order, items },
    });
  } catch (error) {
    nodeAuthLogger.error("Get order error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch order" } },
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

    const orderDoc = await adminDb.collection("orders").doc(id).get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    const { orderStatus, paymentStatus, internalNotes } = body;

    if (!orderStatus && !paymentStatus && internalNotes === undefined) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "At least one field to update is required" } },
        { status: 400 }
      );
    }

    if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid order status: ${orderStatus}` } },
        { status: 400 }
      );
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid payment status: ${paymentStatus}` } },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;

    await adminDb.collection("orders").doc(id).update(updates);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "order_updated",
        entityType: "order",
        entityId: id,
        details: { orderStatus, paymentStatus, hasNotes: !!internalNotes },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Update order error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update order" } },
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