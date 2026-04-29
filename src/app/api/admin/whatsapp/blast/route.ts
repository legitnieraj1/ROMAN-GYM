import { NextRequest, NextResponse } from "next/server";

const BOT = process.env.WHATSAPP_BOT_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.leads?.length) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }
    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const res = await fetch(`${BOT}/blast`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(body),
      cache  : "no-store",
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bot unreachable";
    console.error("[whatsapp/blast]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
