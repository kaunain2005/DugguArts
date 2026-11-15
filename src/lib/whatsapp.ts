import type { CartItem } from "@/context/CartContext";
import { WHATSAPP_CONFIG } from "@/lib/constants";

export interface WhatsAppOrderData {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  packagingCharge: number;
  deliveryCharge: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  pincode: string;
  city: string;
  state: string;
  customerNotes?: string;
}

function formatWhatsAppNumber(number: string): string {
  // Remove all non-digits
  const digits = number.replace(/\D/g, "");
  // Ensure it starts with country code (91 for India)
  if (digits.startsWith("91")) {
    return digits;
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

function encodeWhatsAppText(text: string): string {
  return encodeURIComponent(text);
}

export function generateWhatsAppMessage(data: WhatsAppOrderData): string {
  const lines: string[] = [
    "Hello! I would like to place an order.",
    "",
    `Order ID: ${data.orderId}`,
    "",
    "Items:",
  ];

  data.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} × ${item.quantity}`);
    if (item.selectedColour) {
      lines.push(`   Colour: ${item.selectedColour}`);
    }
    if (item.personalisation) {
      lines.push(`   Personalisation: ${item.personalisation}`);
    }
    if (item.wrapping) {
      lines.push(`   Gift Wrapping: Yes`);
    }
    if (item.messageCard) {
      lines.push(`   Message Card: ${item.messageCard}`);
    }
  });

  lines.push("");
  lines.push(`Subtotal: ₹${data.subtotal.toLocaleString("en-IN")}`);
  
  if (data.packagingCharge > 0) {
    lines.push(`Packaging: ₹${data.packagingCharge.toLocaleString("en-IN")}`);
  }
  
  if (data.deliveryCharge > 0) {
    lines.push(`Delivery: ₹${data.deliveryCharge.toLocaleString("en-IN")}`);
  }
  
  lines.push(`Total: ₹${data.totalAmount.toLocaleString("en-IN")}`);
  lines.push("");
  lines.push("Customer Details:");
  lines.push(`Name: ${data.customerName}`);
  lines.push(`Phone: ${data.phone}`);
  
  if (data.email) {
    lines.push(`Email: ${data.email}`);
  }
  
  lines.push(`Address: ${data.deliveryAddress}`);
  lines.push(`Pincode: ${data.pincode}`);
  lines.push(`City: ${data.city}`);
  lines.push(`State: ${data.state}`);
  
  if (data.customerNotes) {
    lines.push("");
    lines.push(`Notes: ${data.customerNotes}`);
  }

  lines.push("");
  lines.push("Please confirm availability, delivery charges, and final payment details.");
  lines.push("Thank you!");

  return lines.join("\n");
}

export function generateWhatsAppUrl(message: string): string {
  const phoneNumber = formatWhatsAppNumber(WHATSAPP_CONFIG.businessNumber);
  const encodedMessage = encodeWhatsAppText(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

export function openWhatsAppCheckout(data: WhatsAppOrderData): void {
  const message = generateWhatsAppMessage(data);
  const url = generateWhatsAppUrl(message);
  
  // Open in new tab
  window.open(url, "_blank", "noopener,noreferrer");
}

// Generate a unique order reference
export function generateOrderReference(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = now.toTimeString().slice(0, 5).replace(":", "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DA${dateStr}${timeStr}${random}`;
}