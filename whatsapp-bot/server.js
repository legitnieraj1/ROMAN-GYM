/**
 * Roman Fitness — WhatsApp Bot Server
 * ------------------------------------
 * Standalone Express server that:
 *  1. Manages a whatsapp-web.js session (QR → link device)
 *  2. Runs bulk message blasts with human-like random delays
 *  3. Auto-replies to incoming DMs using xAI Grok
 *
 * Run: node server.js   (from /whatsapp-bot directory)
 * Requires: npm install
 */

require("dotenv").config();

const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode");
const path = require("path");

// ── Config ───────────────────────────────────────────────────────
const PORT               = process.env.PORT || 3001;
const GROK_API_KEY       = process.env.GROK_API_KEY || "";
const GROK_MODEL         = process.env.GROK_MODEL || "grok-3-mini";
const AUTO_REPLY_ENABLED = process.env.AUTO_REPLY_ENABLED !== "false";

const GYM_NAME    = process.env.GYM_NAME    || "Roman Fitness";
const GYM_PHONE   = process.env.GYM_PHONE   || "+918098834154";
const GYM_ADDRESS = process.env.GYM_ADDRESS || "No 17, Bhagat Singh Nagar, Periyanaickenpalayam, Coimbatore 641020";
const GYM_TIMINGS = process.env.GYM_TIMINGS || "Mon–Sat 5:00 AM – 11:00 PM | Sunday 6:00 AM – 2:00 PM";

const GYM_SYSTEM_PROMPT = `You are the WhatsApp AI assistant for ${GYM_NAME}, a premium gym.

GYM INFORMATION:
- Name: ${GYM_NAME}
- Phone: ${GYM_PHONE}
- Address: ${GYM_ADDRESS}
- Timings: ${GYM_TIMINGS}
- Head Trainer & Founder: Roman Prabhur (Instagram: @romanprabhur)
- Website: https://mfpgympnp.in

MEMBERSHIP PLANS:
- Basic Plan: ₹3,099 (3 months) — Full gym access + all equipment
- Pro Plan: ₹4,699 (6 months) — Most popular plan
- Elite Plan: ₹6,699 (1 year) — Best value, free diet plan included

SERVICES: Elite equipment, expert personal training, body transformation programs,
AI-powered diet plans, cinematic training environment.

RULES:
1. Be friendly, concise, and professional — max 120 words per reply.
2. Use ₹ symbol for all prices.
3. Always encourage leads to visit or call us.
4. For topics outside the gym, politely redirect to gym info.
5. Use 1–2 relevant emojis per message (💪 🔥 ✅ are good).
6. Never make up plans, timings, or prices not listed above.`;

// ── State ────────────────────────────────────────────────────────
let waClient   = null;
let currentQR  = null;  // base64 PNG data-URL
let connStatus = "DISCONNECTED"; // DISCONNECTED | INITIALIZING | QR_PENDING | AUTHENTICATED | CONNECTED | AUTH_FAILED
let connPhone  = null;  // e.164 phone number once connected

const blastState = {
  running : false,
  total   : 0,
  sent    : 0,
  failed  : 0,
  logs    : [],   // { phone, name, status, reason?, time }
};

// ── Grok AI auto-reply ───────────────────────────────────────────
async function getGrokReply(userMessage) {
  if (!GROK_API_KEY) {
    return `Hi! Thank you for contacting ${GYM_NAME}. 💪 Please call us at ${GYM_PHONE} for immediate assistance.`;
  }
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method : "POST",
      headers: {
        Authorization : `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model    : GROK_MODEL,
        max_tokens: 200,
        messages : [
          { role: "system", content: GYM_SYSTEM_PROMPT },
          { role: "user",   content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content?.trim() ||
      `Thank you for reaching out to ${GYM_NAME}! 💪 We'll connect you with our team shortly. Call us: ${GYM_PHONE}`
    );
  } catch (err) {
    console.error("[Grok] Error:", err.message);
    return `Thank you for contacting ${GYM_NAME}! 🔥 Please call ${GYM_PHONE} for quick assistance.`;
  }
}

// ── WhatsApp client lifecycle ────────────────────────────────────
function initClient() {
  if (waClient) {
    waClient.destroy().catch(() => {});
    waClient = null;
  }

  connStatus = "INITIALIZING";
  currentQR  = null;
  connPhone  = null;

  waClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, "wa-session"),
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    },
  });

  waClient.on("qr", async (qr) => {
    try {
      currentQR  = await qrcode.toDataURL(qr);
      connStatus = "QR_PENDING";
      console.log("[WA] QR code ready — waiting for scan");
    } catch (err) {
      console.error("[WA] QR generation error:", err.message);
    }
  });

  waClient.on("authenticated", () => {
    connStatus = "AUTHENTICATED";
    currentQR  = null;
    console.log("[WA] Authenticated ✅");
  });

  waClient.on("ready", () => {
    connStatus = "CONNECTED";
    currentQR  = null;
    try {
      connPhone = waClient.info?.wid?.user
        ? `+${waClient.info.wid.user}`
        : "Connected";
    } catch {
      connPhone = "Connected";
    }
    console.log(`[WA] Ready! Connected as ${connPhone}`);
  });

  waClient.on("auth_failure", (msg) => {
    connStatus = "AUTH_FAILED";
    console.error("[WA] Auth failure:", msg);
  });

  waClient.on("disconnected", (reason) => {
    connStatus = "DISCONNECTED";
    currentQR  = null;
    connPhone  = null;
    waClient   = null;
    console.log("[WA] Disconnected:", reason);
  });

  // ── Incoming message → Grok auto-reply ──────────────────────
  waClient.on("message", async (msg) => {
    if (!AUTO_REPLY_ENABLED || !GROK_API_KEY) return;
    if (msg.isGroupMsg || msg.fromMe) return;      // DMs only, skip outbound

    // Ignore media-only messages with no text
    if (!msg.body || !msg.body.trim()) return;

    try {
      const reply = await getGrokReply(msg.body);
      await msg.reply(reply);
      console.log(`[Grok] Auto-replied to ${msg.from}`);
    } catch (err) {
      console.error("[Grok] Auto-reply error:", err.message);
    }
  });

  waClient.initialize();
}

// ── Express app ──────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

/** GET /status — current connection state */
app.get("/status", (_req, res) => {
  res.json({ status: connStatus, phone: connPhone, hasQR: !!currentQR });
});

/** GET /qr — latest QR code as base64 data-URL */
app.get("/qr", (_req, res) => {
  res.json({ qr: currentQR, status: connStatus });
});

/** POST /connect — start WhatsApp client */
app.post("/connect", (_req, res) => {
  if (connStatus === "CONNECTED") {
    return res.json({ ok: true, message: "Already connected" });
  }
  initClient();
  res.json({ ok: true, message: "Initializing — scan QR shortly" });
});

/** POST /disconnect — destroy session */
app.post("/disconnect", async (_req, res) => {
  if (waClient) {
    await waClient.destroy().catch(() => {});
    waClient = null;
  }
  connStatus = "DISCONNECTED";
  currentQR  = null;
  connPhone  = null;
  res.json({ ok: true });
});

/** POST /blast — start bulk message campaign
 *  Body: { leads: [{phone, name?}], message: string, minDelay?: ms, maxDelay?: ms }
 *  Responds immediately; blast runs in background.
 *  Poll /blast/progress for live updates.
 */
app.post("/blast", async (req, res) => {
  const { leads, message, minDelay = 2500, maxDelay = 6000 } = req.body;

  if (connStatus !== "CONNECTED") {
    return res.status(400).json({ error: "WhatsApp not connected. Link your device first." });
  }
  if (!leads?.length) {
    return res.status(400).json({ error: "No leads provided." });
  }
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message template is required." });
  }
  if (blastState.running) {
    return res.status(400).json({ error: "A blast is already in progress. Wait for it to finish." });
  }

  // Reset state for new blast
  blastState.running = true;
  blastState.total   = leads.length;
  blastState.sent    = 0;
  blastState.failed  = 0;
  blastState.logs    = [];

  // Acknowledge immediately — blast runs async
  res.json({ ok: true, total: leads.length, message: "Blast started" });

  (async () => {
    for (const lead of leads) {
      // Normalise phone: strip all non-digits, then ensure country code
      let phone = (lead.phone || "").replace(/\D/g, "");
      if (!phone) {
        blastState.failed++;
        blastState.logs.push({
          phone : lead.phone || "—",
          name  : lead.name  || "",
          status: "failed",
          reason: "Invalid phone number",
          time  : new Date().toISOString(),
        });
        continue;
      }

      // If no country code prefix, assume India (+91)
      if (phone.length === 10) phone = "91" + phone;

      const chatId           = `${phone}@c.us`;
      const personalizedMsg  = message
        .replace(/\{name\}/gi,  lead.name || "there")
        .replace(/\{phone\}/gi, lead.phone || "")
        .replace(/\{gym\}/gi,   GYM_NAME);

      try {
        await waClient.sendMessage(chatId, personalizedMsg);
        blastState.sent++;
        blastState.logs.push({
          phone : `+${phone}`,
          name  : lead.name || "",
          status: "sent",
          time  : new Date().toISOString(),
        });
        console.log(`[Blast] ✅ Sent to +${phone}`);
      } catch (err) {
        blastState.failed++;
        blastState.logs.push({
          phone : `+${phone}`,
          name  : lead.name || "",
          status: "failed",
          reason: err.message,
          time  : new Date().toISOString(),
        });
        console.error(`[Blast] ❌ Failed +${phone}: ${err.message}`);
      }

      // Random human-like delay to avoid WhatsApp ban
      const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
      await new Promise((r) => setTimeout(r, delay));
    }

    blastState.running = false;
    console.log(`[Blast] Done — ${blastState.sent} sent, ${blastState.failed} failed`);
  })();
});

/** GET /blast/progress — live blast stats */
app.get("/blast/progress", (_req, res) => {
  res.json({ ...blastState });
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏛️  Roman Fitness WhatsApp Bot`);
  console.log(`   Running on  http://localhost:${PORT}`);
  console.log(`   Grok AI     ${GROK_API_KEY ? "✅ Enabled" : "⚠️  No key — auto-reply disabled"}`);
  console.log(`   Auto-reply  ${AUTO_REPLY_ENABLED ? "ON" : "OFF"}\n`);
});
