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
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query = adminDb.collection("orders") as any;

    if (status) {
      query = query.where("orderStatus", "==", status);
    }
    if (paymentStatus) {
      query = query.where("paymentStatus", "==", paymentStatus);
    }
    if (startDate) {
      query = query.where("createdAt", ">=", new Date(startDate));
    }
    if (endDate) {
      query = query.where("createdAt", "<=", new Date(endDate));
    }

    const validSortFields = ["createdAt", "updatedAt", "totalAmount", "orderStatus", "paymentStatus"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const isDesc = sortOrder === "desc";
    query = query.orderBy(sortField, isDesc ? "desc" : "asc");

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const snapshot = await query.get();
    let orders = snapshot.docs.map((doc: any) => {
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
      orders = orders.filter((o: any) =>
        o.orderId?.toLowerCase().includes(searchLower) ||
        o.customerName?.toLowerCase().includes(searchLower) ||
        o.phone?.includes(searchLower) ||
        o.email?.toLowerCase().includes(searchLower)
      );
    }

    let countQuery = adminDb.collection("orders") as any;
    if (status) {
      countQuery = countQuery.where("orderStatus", "==", status);
    }
    if (paymentStatus) {
      countQuery = countQuery.where("paymentStatus", "==", paymentStatus);
    }
    if (startDate) {
      countQuery = countQuery.where("createdAt", ">=", new Date(startDate));
    }
    if (endDate) {
      countQuery = countQuery.where("createdAt", "<=", new Date(endDate));
    }

    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items: orders,
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get orders error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch orders" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}