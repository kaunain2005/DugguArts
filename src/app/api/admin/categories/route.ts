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
    
    const activeOnly = searchParams.get("activeOnly") !== "false";

    let query = adminDb.collection("categories") as any;
    
    if (activeOnly) {
      query = query.where("active", "==", true);
    }

    query = query.orderBy("displayOrder", "asc");

    const snapshot = await query.get();
    const categories = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
        updatedAt: getTimestampISO(data, "updatedAt"),
      };
    });

    return NextResponse.json({
      success: true,
      data: { items: categories, total: categories.length },
    });
  } catch (error) {
    nodeAuthLogger.error("Get categories error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch categories" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const adminDb = getAdminFirestore();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and slug are required" } },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Slug can only contain lowercase letters, numbers, and hyphens" } },
        { status: 400 }
      );
    }

    const existingSlug = await adminDb.collection("categories").where("slug", "==", body.slug).limit(1).get();
    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: { code: "SLUG_EXISTS", message: "Category with this slug already exists" } },
        { status: 409 }
      );
    }

    const now = new Date();
    const categoryId = `CAT_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

    const categoryData = {
      categoryId,
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      imageUrl: body.imageUrl || "",
      imagePublicId: body.imagePublicId || "",
      active: body.active !== false,
      displayOrder: Number(body.displayOrder) || 0,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection("categories").doc(categoryId).set(categoryData);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await adminDb.collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "category_created",
        entityType: "category",
        entityId: categoryId,
        details: { name: body.name },
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: { categoryId },
      message: "Category created successfully",
    }, { status: 201 });
  } catch (error) {
    nodeAuthLogger.error("Create category error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create category" } },
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