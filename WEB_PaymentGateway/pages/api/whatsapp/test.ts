import { NextApiRequest, NextApiResponse } from "next";
import { formatPhoneNumber } from "@/lib/whatsapp";

// Fonnte.com API Configuration
const FONNTE_TOKEN = process.env.FONNTE_TOKEN || "";
const FONNTE_URL = "https://api.fonnte.com/send";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      message: "Phone and message are required",
    });
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

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
      return res.status(200).json({
        status: true,
        message: "Test message sent successfully",
        data: data,
      });
    }

    return res.status(400).json({
      status: false,
      error: data.message || "Failed to send test message",
      data: data,
    });
  } catch (error: any) {
    console.error("Test WhatsApp Error:", error);
    return res.status(500).json({
      status: false,
      error: "Failed to send test message",
      details: error.message,
    });
  }
}
