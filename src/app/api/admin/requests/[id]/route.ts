import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

const VALID_REQUEST_STATUSES = [
  "pending", "contacted", "quoted", "confirmed", "in_production", 
  "ready", "delivered", "completed", "cancelled"
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const adminDb = getAdminFirestore();

    const requestDoc = await adminDb.collection("custom_requests").doc(id).get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Custom request not found" } },
        { status: 404 }
      );
    }

    const data = requestDoc.data() as Record<string, unknown>;
    const requestData = {
      id: requestDoc.id,
      ...data,
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
    };

    return NextResponse.json({
      success: true,
      data: requestData,
    });
  } catch (error) {
    nodeAuthLogger.error("Get custom request error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch custom request" } },
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

    const requestDoc = await adminDb.collection("custom_requests").doc(id).get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Custom request not found" } },
        { status: 404 }
      );
    }

    const { requestStatus, quotedPrice, internalNotes } = body;

    if (!requestStatus && quotedPrice === undefined && !internalNotes) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "At least one field to update is required" } },
        { status: 400 }
      );
    }

    if (requestStatus && !VALID_REQUEST_STATUSES.includes(requestStatus)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid request status: ${requestStatus}` } },
        { status: 400 }
      );
    }

    if (quotedPrice !== undefined && (isNaN(Number(quotedPrice)) || Number(quotedPrice) < 0)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Quoted price must be a positive number" } },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (requestStatus) updates.requestStatus = requestStatus;
    if (quotedPrice !== undefined) updates.quotedPrice = Number(quotedPrice);
    if (internalNotes !== undefined) updates.internalNotes = internalNotes;

    await adminDb.collection("custom_requests").doc(id).update(updates);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "custom_request_updated",
        entityType: "custom_request",
        entityId: id,
        details: { requestStatus, quotedPrice, hasNotes: !!internalNotes },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Custom request updated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Update custom request error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update custom request" } },
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