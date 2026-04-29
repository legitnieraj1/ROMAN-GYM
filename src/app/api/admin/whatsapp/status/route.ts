import { NextResponse } from "next/server";

const BOT = process.env.WHATSAPP_BOT_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const res  = await fetch(`${BOT}/status`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Bot returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bot unreachable";
    console.error("[whatsapp/status]", msg);
    return NextResponse.json({ status: "DISCONNECTED", phone: null, hasQR: false });
  }
}
