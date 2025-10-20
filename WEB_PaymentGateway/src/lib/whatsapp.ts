import { formatIDR } from "./format";

// Fonnte.com API Configuration
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "";
const FONNTE_URL = "https://api.fonnte.com/send";

export interface WhatsAppResponse {
  status: boolean;
  message?: string;
  error?: string;
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format Indonesian phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "");

  // Convert 0 prefix to 62
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  // Add 62 if not present
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Send OTP via WhatsApp
 */
export async function sendWhatsAppOTP(
  phone: string,
  otp: string
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    const message = `🔐 *HotKicks Verification*

Your OTP code is: *${otp}*

This code will expire in 5 minutes.
Do not share this code with anyone.

If you didn't request this, please ignore this message.`;

    const response = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return { status: true, message: "OTP sent successfully" };
    }

    return {
      status: false,
      error: data.message || "Failed to send OTP",
    };
  } catch (error) {
    console.error("WhatsApp OTP Error:", error);
    return {
      status: false,
      error: "Failed to send WhatsApp message",
    };
  }
}

/**
 * Send order confirmation notification
 */
export async function sendOrderNotification(
  phone: string,
  orderData: {
    externalId: string;
    amount: number;
    status: string;
    invoiceUrl: string;
    items?: Array<{ name: string; qty: number; price: number }>;
  }
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    let itemsList = "";
    if (orderData.items && orderData.items.length > 0) {
      itemsList =
        "\n*Items:*\n" +
        orderData.items
          .map(
            (item) => `• ${item.name} (${item.qty}x) - ${formatIDR(item.price)}`
          )
          .join("\n");
    }

    const message = `🛒 *Order Confirmation - HotKicks*

Thank you for your order!

📋 *Order Details:*
Order ID: ${orderData.externalId}
Total: ${formatIDR(orderData.amount)}
Status: ${orderData.status}${itemsList}

💳 *Payment Link:*
${orderData.invoiceUrl}

Please complete payment within 24 hours.

Thank you for shopping at HotKicks! 🙏

Need help? Contact us:
📱 WhatsApp: +62 812-3456-7890
📧 Email: support@hotkicks.com`;

    const response = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return { status: true, message: "Notification sent successfully" };
    }

    return {
      status: false,
      error: data.message || "Failed to send notification",
    };
  } catch (error) {
    console.error("WhatsApp Notification Error:", error);
    return {
      status: false,
      error: "Failed to send WhatsApp notification",
    };
  }
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(
  phone: string,
  orderData: {
    externalId: string;
    amount: number;
    paidAt?: Date;
    items?: Array<{ name: string; qty: number }>;
  }
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const paymentDate = orderData.paidAt || new Date();

    let itemsList = "";
    if (orderData.items && orderData.items.length > 0) {
      itemsList =
        "\n*Items Purchased:*\n" +
        orderData.items
          .map((item) => `• ${item.name} (${item.qty}x)`)
          .join("\n");
    }

    const message = `✅ *Payment Successful! - HotKicks*

Your payment has been confirmed!

📋 *Transaction Details:*
Order ID: ${orderData.externalId}
Amount Paid: ${formatIDR(orderData.amount)}
Payment Date: ${paymentDate.toLocaleString("id-ID")}${itemsList}

🚚 *Shipping Information:*
Your order is being processed.
Estimated delivery: 3-5 business days.

You will receive tracking information once your order ships.

Thank you for your purchase! 🎉

*Track your order:*
https://hotkicks.com/track/${orderData.externalId}

Need help? Contact us:
📱 WhatsApp: +62 812-3456-7890
📧 Email: support@hotkicks.com`;

    const response = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return { status: true, message: "Payment notification sent" };
    }

    return {
      status: false,
      error: data.message || "Failed to send payment notification",
    };
  } catch (error) {
    console.error("WhatsApp Payment Notification Error:", error);
    return {
      status: false,
      error: "Failed to send payment notification",
    };
  }
}

/**
 * Send welcome message after registration
 */
export async function sendWelcomeMessage(
  phone: string,
  name: string
): Promise<WhatsAppResponse> {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    const message = `🎉 *Welcome to HotKicks, ${name}!*

Thank you for joining our sneaker community!

✨ *Member Benefits:*
• Exclusive early access to new releases
• Special member-only discounts
• Free shipping on orders over Rp 500.000
• Birthday surprises

🎁 *First Purchase Offer:*
Use code *WELCOME10* for 10% off your first order!

Start shopping now:
https://hotkicks.com

Follow us for updates:
📱 Instagram: @hotkicks.id
📱 TikTok: @hotkicks.id

Happy shopping! 👟

Best regards,
The HotKicks Team`;

    const response = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return { status: true, message: "Welcome message sent" };
    }

    return {
      status: false,
      error: data.message || "Failed to send welcome message",
    };
  } catch (error) {
    console.error("WhatsApp Welcome Message Error:", error);
    return {
      status: false,
      error: "Failed to send welcome message",
    };
  }
}
