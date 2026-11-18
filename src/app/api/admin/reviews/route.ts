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
    const productId = searchParams.get("productId") || "";
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "reviewDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query = adminDb.collection("reviews") as any;

    if (status) {
      query = query.where("status", "==", status);
    }
    if (productId) {
      query = query.where("productId", "==", productId);
    }
    if (featured !== "") {
      query = query.where("featured", "==", featured === "true");
    }

    const validSortFields = ["reviewDate", "rating", "customerName"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "reviewDate";
    const isDesc = sortOrder === "desc";
    query = query.orderBy(sortField, isDesc ? "desc" : "asc");

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const snapshot = await query.get();
    let reviews = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        reviewDate: getTimestampISO(data, "reviewDate"),
        createdAt: getTimestampISO(data, "createdAt"),
        updatedAt: getTimestampISO(data, "updatedAt"),
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter((r: any) =>
        r.customerName?.toLowerCase().includes(searchLower) ||
        r.title?.toLowerCase().includes(searchLower) ||
        r.reviewText?.toLowerCase().includes(searchLower) ||
        r.productId?.toLowerCase().includes(searchLower)
      );
    }

    let countQuery = adminDb.collection("reviews") as any;
    if (status) {
      countQuery = countQuery.where("status", "==", status);
    }
    if (productId) {
      countQuery = countQuery.where("productId", "==", productId);
    }
    if (featured !== "") {
      countQuery = countQuery.where("featured", "==", featured === "true");
    }

    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get reviews error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch reviews" } },
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