import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const adminDb = getAdminFirestore();

    // Get products count
    const productsSnapshot = await adminDb.collection("products").where("active", "==", true).get();
    let totalProducts = 0, activeProducts = 0;
    productsSnapshot.docs.forEach((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      totalProducts++;
      if (data.active === true) activeProducts++;
    });

    // Get orders stats
    const ordersSnapshot = await adminDb.collection("orders").get();
    let totalOrders = 0, newEnquiries = 0, totalRevenue = 0;
    const orderStatusCounts: Record<string, number> = {};
    const paymentStatusCounts: Record<string, number> = {};
    ordersSnapshot.docs.forEach((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      totalOrders++;
      const status = data.orderStatus as string;
      const payment = data.paymentStatus as string;
      const total = Number(data.totalAmount) || 0;
      
      orderStatusCounts[status] = (orderStatusCounts[status] || 0) + 1;
      paymentStatusCounts[payment] = (paymentStatusCounts[payment] || 0) + 1;
      
      if (status === "new") newEnquiries++;
      if (payment === "paid") totalRevenue += total;
    });

    // Get custom requests stats
    const requestsSnapshot = await adminDb.collection("custom_requests").get();
    let totalRequests = 0, pendingRequests = 0;
    requestsSnapshot.docs.forEach((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      totalRequests++;
      if (data.requestStatus === "pending") pendingRequests++;
    });

    // Get reviews stats
    const reviewsSnapshot = await adminDb.collection("reviews").get();
    let pendingReviews = 0;
    reviewsSnapshot.docs.forEach((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      if (data.status === "pending") pendingReviews++;
    });

    // Get low stock materials
    const inventorySnapshot = await adminDb.collection("inventory").where("active", "==", true).get();
    let lowStockCount = 0;
    inventorySnapshot.docs.forEach((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      const current = Number(data.currentStock) || 0;
      const reorder = Number(data.reorderLevel) || 0;
      if (current <= reorder) lowStockCount++;
    });

    // Recent activity (last 10 orders)
    const recentOrdersSnapshot = await adminDb.collection("orders")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    
    const recentActivity = recentOrdersSnapshot.docs.map((doc: any) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        type: "order",
        orderId: data.orderId as string,
        customerName: data.customerName as string,
        status: data.orderStatus as string,
        date: getTimestampISO(data, "createdAt"),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: { total: totalProducts, active: activeProducts },
        orders: { total: totalOrders, newEnquiries, byStatus: orderStatusCounts, byPaymentStatus: paymentStatusCounts },
        revenue: { total: totalRevenue },
        customRequests: { total: totalRequests, pending: pendingRequests },
        reviews: { pending: pendingReviews },
        inventory: { lowStock: lowStockCount },
        recentActivity,
      },
    });
  } catch (error) {
    nodeAuthLogger.error("Dashboard summary error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch dashboard stats" } },
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