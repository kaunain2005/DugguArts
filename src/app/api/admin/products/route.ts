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
    const category = searchParams.get("category") || "";
    const stockStatus = searchParams.get("stockStatus") || "";
    const featured = searchParams.get("featured");
    const active = searchParams.get("active") || "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query = adminDb.collection("products") as any;

    if (active !== "") {
      query = query.where("active", "==", active === "true");
    }
    
    if (category) {
      query = query.where("categoryId", "==", category);
    }
    
    if (stockStatus) {
      query = query.where("stockStatus", "==", stockStatus);
    }
    
    if (featured !== "") {
      query = query.where("featured", "==", featured === "true");
    }

    const validSortFields = ["createdAt", "updatedAt", "price", "name", "featured"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const isDesc = sortOrder === "desc";
    query = query.orderBy(sortField, isDesc ? "desc" : "asc");

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const snapshot = await query.get();
    const products = snapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
        createdAt: getTimestampISO(data, "createdAt"),
        updatedAt: getTimestampISO(data, "updatedAt"),
      };
    });

    let filteredProducts = products;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = products.filter((p: any) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.slug?.toLowerCase().includes(searchLower)
      );
    }

    let countQuery = adminDb.collection("products") as any;
    if (active !== "") {
      countQuery = countQuery.where("active", "==", active === "true");
    }
    if (category) {
      countQuery = countQuery.where("categoryId", "==", category);
    }
    if (stockStatus) {
      countQuery = countQuery.where("stockStatus", "==", stockStatus);
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
        items: filteredProducts,
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Get products error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch products" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const adminDb = getAdminFirestore();

    const requiredFields = ["name", "slug", "categoryId", "description", "price", "colours"];
    for (const field of requiredFields) {
      if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
        return NextResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: `${field} is required` } },
          { status: 400 }
        );
      }
    }

    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Slug can only contain lowercase letters, numbers, and hyphens" } },
        { status: 400 }
      );
    }

    const existingSlug = await adminDb.collection("products").where("slug", "==", body.slug).limit(1).get();
    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: { code: "SLUG_EXISTS", message: "Product with this slug already exists" } },
        { status: 409 }
      );
    }

    const categoryDoc = await adminDb.collection("categories").doc(body.categoryId).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "CATEGORY_NOT_FOUND", message: "Category not found" } },
        { status: 404 }
      );
    }

    const now = new Date();
    const productId = `PROD_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase();

    const productData = {
      productId,
      name: body.name,
      slug: body.slug,
      categoryId: body.categoryId,
      description: body.description,
      price: Number(body.price),
      imageUrl: body.imageUrl || "",
      imagePublicId: body.imagePublicId || "",
      galleryUrls: body.galleryUrls || [],
      galleryPublicIds: body.galleryPublicIds || [],
      colours: Array.isArray(body.colours) ? body.colours : body.colours.split(",").map((c: string) => c.trim()).filter(Boolean),
      stockStatus: body.stockStatus || "in_stock",
      featured: Boolean(body.featured),
      active: Boolean(body.active),
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection("products").doc(productId).set(productData);

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await adminDb.collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "product_created",
        entityType: "product",
        entityId: productId,
        details: { name: body.name },
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: { productId },
      message: "Product created successfully",
    }, { status: 201 });
  } catch (error) {
    nodeAuthLogger.error("Create product error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create product" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.SITE_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}