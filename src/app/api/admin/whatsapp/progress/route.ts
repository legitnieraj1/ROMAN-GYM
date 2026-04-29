import { NextResponse } from "next/server";

const BOT = process.env.WHATSAPP_BOT_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const res  = await fetch(`${BOT}/blast/progress`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Bot returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[whatsapp/progress]", err instanceof Error ? err.message : err);
    return NextResponse.json({ running: false, total: 0, sent: 0, failed: 0, logs: [] });
  }
}
