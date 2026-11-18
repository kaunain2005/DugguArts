import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/auth";
import { nodeAuthLogger } from "@/lib/logging";
import { getTimestampISO } from "@/lib/firebase/firestore-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const adminDb = getAdminFirestore();
    const sheet = adminDb.collection("settings");
    const data = await sheet.get();

    const settings: Record<string, { value: any; description: string }> = {};

    if (!data.empty) {
      data.docs.forEach((doc: any) => {
        settings[doc.id] = {
          value: doc.data().value,
          description: doc.data().description || "",
        };
      });
    }

    const defaultSettings = {
      businessName: "Duggu Arts",
      whatsappNumber: "91XXXXXXXXXX",
      instagramUrl: "https://instagram.com/dugguarts",
      contactEmail: "hello@dugguarts.com",
      announcementText: "Free delivery on orders above ₹999!",
      packagingCharge: 50,
      deliveryCharge: 100,
      freeDeliveryThreshold: 999,
      currency: "INR",
      timezone: "Asia/Kolkata",
    };

    const allSettings: Record<string, { value: any; description: string }> = {};
    Object.keys(defaultSettings).forEach((key) => {
      allSettings[key] = {
        value: settings[key]?.value ?? defaultSettings[key as keyof typeof defaultSettings],
        description: settings[key]?.description ?? `Default setting for ${key}`,
      };
    });

    return NextResponse.json({
      success: true,
      data: allSettings,
    });
  } catch (error) {
    nodeAuthLogger.error("Get settings error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch settings" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Settings object is required" } },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();
    const now = new Date();
    let updated = 0;

    const batch = adminDb.batch();

    Object.entries(settings).forEach(([key, value]) => {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      
      const docRef = adminDb.collection("settings").doc(key);
      batch.set(docRef, {
        value: stringValue,
        description: `Updated via admin on ${now}`,
        updatedAt: now,
      });
      updated++;
    });

    await batch.commit();

    const session = await import("@/lib/firebase/auth").then(m => m.getSession());
    if (session) {
      await adminDb.collection("audit_logs").add({
        logId: `LOG_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`.toUpperCase(),
        adminEmail: session?.email,
        action: "settings_updated",
        entityType: "settings",
        entityId: "multiple",
        details: { updatedCount: updated },
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      data: { updated },
      message: `${updated} settings updated successfully`,
    });
  } catch (error) {
    nodeAuthLogger.error("Update settings error", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update settings" } },
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