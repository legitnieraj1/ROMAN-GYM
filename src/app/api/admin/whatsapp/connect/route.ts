import { NextResponse } from "next/server";

const BOT = process.env.WHATSAPP_BOT_URL ?? "http://localhost:3001";

export async function POST() {
  try {
    const res  = await fetch(`${BOT}/connect`, { method: "POST", cache: "no-store" });
    if (!res.ok) throw new Error(`Bot returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bot unreachable";
    console.error("[whatsapp/connect]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
