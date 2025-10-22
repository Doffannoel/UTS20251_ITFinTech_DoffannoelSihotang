// src/lib/whatsapp.ts
import { formatIDR } from "./format";

const FONNTE_URL = "https://api.fonnte.com/send";

function ensureToken() {
  const token = process.env.FONNTE_TOKEN;
  if (!token)
    throw new Error(
      "FONNTE_TOKEN is missing. Set it in .env.local and restart the server."
    );
  return token;
}

// Normalisasi nomor ke 62xxxxxxxxxx (tanpa tanda +)
export function formatPhoneNumber(phone: string): string {
  let cleaned = (phone || "").replace(/\D/g, ""); // hapus non-digit
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  if (!cleaned.startsWith("62")) cleaned = "62" + cleaned;
  return cleaned;
}

// Util kirim ke Fonnte dengan logging error yang jelas
async function postFonnte(target: string, message: string) {
  const token = ensureToken();

  const res = await fetch(FONNTE_URL, {
    method: "POST",
    headers: {
      Authorization: token, // token langsung, bukan "Bearer ..."
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      target, // "62xxxxxxxxxx" atau "62xxx,62yyy"
      message, // isi pesan
      // TIDAK pakai countryCode karena target sudah 62xxxx
      // delay: 2,                       // opsional
    }),
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {}

  if (!res.ok || data?.status === false) {
    console.error("Fonnte send failed:", {
      httpStatus: res.status,
      data: text || data,
    });
    throw new Error(data?.message || `Fonnte HTTP ${res.status}`);
  }
  return data;
}

/** 6-digit OTP */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Kirim OTP login via WhatsApp */
export async function sendWhatsAppOTP(phone: string, otp: string) {
  const formattedPhone = formatPhoneNumber(phone);
  const message = `🔐 *HotKicks Verification*

Kode OTP kamu: *${otp}*
Berlaku 5 menit. Jangan bagikan kode ini ke siapa pun.

Jika kamu tidak meminta OTP, abaikan pesan ini.`;

  await postFonnte(formattedPhone, message);
  return { status: true, message: "OTP sent" };
}

/** Notif saat checkout berhasil dibuat */
export async function sendOrderCreated(
  phone: string,
  orderData: {
    externalId: string;
    amount: number;
    items?: { name: string; qty: number; price: number }[];
  }
) {
  const formattedPhone = formatPhoneNumber(phone);

  let itemsList = "";
  if (orderData.items?.length) {
    itemsList =
      "\n*Items:*\n" +
      orderData.items
        .map((it) => `• ${it.name} (${it.qty}x) - ${formatIDR(it.price)}`)
        .join("\n");
  }

  const message = `🛒 *Order Created - HotKicks*

Order ID: *${orderData.externalId}*
Total: *${formatIDR(orderData.amount)}*${itemsList}

Silakan selesaikan pembayaran untuk memproses pesananmu.`;

  await postFonnte(formattedPhone, message);
  return { status: true, message: "Checkout notification sent" };
}

/** Notif saat pembayaran lunas */
export async function sendPaymentPaid(
  phone: string,
  orderData: {
    externalId: string;
    amount: number;
  }
) {
  const formattedPhone = formatPhoneNumber(phone);
  const message = `✅ *Payment Received - HotKicks*

Order ID: *${orderData.externalId}*
Total: *${formatIDR(orderData.amount)}*

Terima kasih! Pesananmu segera diproses.`;

  await postFonnte(formattedPhone, message);
  return { status: true, message: "Payment notification sent" };
}

// lib/whatsapp.ts

export async function sendWelcomeMessage(phone: string, name: string) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
  const FONNTE_URL = "https://api.fonnte.com/send";

  if (!FONNTE_TOKEN) {
    console.error("FONNTE_TOKEN is not defined in .env");
    return;
  }

  const message = `Hi ${name}, selamat datang di Hotkicks! Kami senang Anda telah bergabung.`;

  const response = await fetch(FONNTE_URL, {
    method: "POST",
    headers: {
      Authorization: FONNTE_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: phone,
      message,
    }),
  });

  const data = await response.json();
  console.log("Welcome message sent:", data);

  return data;
}

export const sendOrderNotification = sendOrderCreated;
export const sendPaymentSuccessNotification = sendPaymentPaid;
