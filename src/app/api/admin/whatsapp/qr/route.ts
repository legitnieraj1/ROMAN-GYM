import { NextResponse } from "next/server";

const BOT = process.env.WHATSAPP_BOT_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const res  = await fetch(`${BOT}/qr`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Bot returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[whatsapp/qr]", err instanceof Error ? err.message : err);
    return NextResponse.json({ qr: null, status: "DISCONNECTED" });
  }
}
