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
    const search = searchParams.get("search") || "";

    let query = adminDb.collection("users") as any;

    query = query.orderBy("createdAt", "desc");

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const snapshot = await query.get();
    let customers = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
        updatedAt: getTimestampISO(data, "updatedAt"),
        lastLoginAt: getTimestampISO(data, "lastLoginAt"),
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter((c: any) =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.includes(searchLower)
      );
    }

    const countSnapshot = await adminDb.collection("users").get();
    const total = countSnapshot.size;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items: customers,
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get customers error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch customers" } },
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