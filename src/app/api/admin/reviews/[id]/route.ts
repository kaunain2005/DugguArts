import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

const VALID_APPROVAL_STATUSES = ["pending", "approved", "rejected"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const adminDb = getAdminFirestore();

    const reviewDoc = await adminDb.collection("reviews").doc(id).get();

    if (!reviewDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 }
      );
    }

    const data = reviewDoc.data() as Record<string, unknown>;
    const review = {
      id: reviewDoc.id,
      ...data,
      reviewDate: getTimestampISO(data, "reviewDate"),
      createdAt: getTimestampISO(data, "createdAt"),
      updatedAt: getTimestampISO(data, "updatedAt"),
    };

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    nodeAuthLogger.error("Get review error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch review" } },
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

    const reviewDoc = await adminDb.collection("reviews").doc(id).get();

    if (!reviewDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Review not found" } },
        { status: 404 }
      );
    }

    const { approvalStatus, featured } = body;

    if (!approvalStatus && featured === undefined) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "At least approvalStatus or featured is required" } },
        { status: 400 }
      );
    }

    if (approvalStatus && !["pending", "approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: `Invalid approval status: ${approvalStatus}` } },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (approvalStatus) updates.status = approvalStatus;
    if (featured !== undefined) updates.featured = Boolean(featured);

    await adminDb.collection("reviews").doc(id).update(updates);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await getAdminFirestore().collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "review_moderated",
        entityType: "review",
        entityId: id,
        details: { approvalStatus, featured },
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review moderated successfully",
    });
  } catch (error) {
    nodeAuthLogger.error("Moderate review error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to moderate review" } },
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