"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MessageCircle, Smartphone, Send, Upload, Zap, Loader2,
  CheckCircle2, XCircle, RefreshCw, Copy, Trash2, FileText,
  Wifi, WifiOff, Clock, ChevronRight, AlertTriangle, Bot,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
type BotStatus = "DISCONNECTED" | "INITIALIZING" | "QR_PENDING" | "AUTHENTICATED" | "CONNECTED" | "AUTH_FAILED";

interface BlastLog {
  phone  : string;
  name   : string;
  status : "sent" | "failed";
  reason?: string;
  time   : string;
}

interface BlastProgress {
  running: boolean;
  total  : number;
  sent   : number;
  failed : number;
  logs   : BlastLog[];
}

interface Lead { phone: string; name: string; }

// ── Helpers ──────────────────────────────────────────────────────
const STATUS_MAP: Record<BotStatus, { label: string; color: string; dot: string }> = {
  DISCONNECTED  : { label: "Disconnected",    color: "text-white/30",   dot: "bg-white/20"    },
  INITIALIZING  : { label: "Initializing…",   color: "text-amber-400",  dot: "bg-amber-400"   },
  QR_PENDING    : { label: "Scan QR Code",     color: "text-amber-400",  dot: "bg-amber-400 animate-pulse" },
  AUTHENTICATED : { label: "Authenticating…", color: "text-amber-400",  dot: "bg-amber-400 animate-pulse" },
  CONNECTED     : { label: "Connected",        color: "text-green-400",  dot: "bg-green-400"   },
  AUTH_FAILED   : { label: "Auth Failed",      color: "text-[#E8192B]",  dot: "bg-[#E8192B]"   },
};

/** Parse a raw text block into leads: accepts 10-digit, +91xxxxxxxxxx, CSV "name,phone" */
function parseLeads(raw: string): Lead[] {
  const seen = new Set<string>();
  const out: Lead[] = [];

  for (const line of raw.split(/[\n,;]+/)) {
    const parts = line.split(",").map((s) => s.trim()).filter(Boolean);
    let name  = "";
    let phone = "";

    if (parts.length >= 2) {
      // CSV format: first col name, second col phone OR vice-versa
      const maybePhone = parts.find((p) => /\d{7,}/.test(p));
      const maybeName  = parts.find((p) => !/\d{7,}/.test(p));
      phone = (maybePhone || "").replace(/\D/g, "");
      name  = maybeName || "";
    } else {
      phone = line.replace(/\D/g, "");
    }

    if (phone.length >= 10 && !seen.has(phone)) {
      seen.add(phone);
      out.push({ phone, name });
    }
  }
  return out;
}

const DEFAULT_MESSAGE = `Hi {name}! 👋

This is *Roman Fitness* — the premier gym in Periyanaickenpalayam, Coimbatore.

🏛️ *We're offering exclusive membership deals!*

✅ Basic Plan  — ₹3,099 (3 months)
✅ Pro Plan    — ₹4,699 (6 months) ⭐ Most Popular
✅ Elite Plan  — ₹6,699 (1 year)   💪 Best Value

Reply *PLANS* to know more or just walk in!

📍 No 17, Bhagat Singh Nagar, PNP
📞 +918098834154
⏰ Mon–Sat 5AM–11PM | Sun 6AM–2PM

*Roman Fitness — Enter The Empire 🏛️*`;

// ── Main Page ────────────────────────────────────────────────────
export default function WhatsAppLeadsPage() {
  const [tab, setTab] = useState<"device" | "blast" | "logs">("device");

  // Device state
  const [status,   setStatus]   = useState<BotStatus>("DISCONNECTED");
  const [phone,    setPhone]    = useState<string | null>(null);
  const [qr,       setQR]       = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Blast state
  const [rawInput,  setRawInput]  = useState("");
  const [leads,     setLeads]     = useState<Lead[]>([]);
  const [message,   setMessage]   = useState(DEFAULT_MESSAGE);
  const [minDelay,  setMinDelay]  = useState(2500);
  const [maxDelay,  setMaxDelay]  = useState(6000);
  const [blasting,  setBlasting]  = useState(false);
  const [progress,  setProgress]  = useState<BlastProgress>({
    running: false, total: 0, sent: 0, failed: 0, logs: [],
  });

  const pollRef    = useRef<NodeJS.Timeout | null>(null);
  const blastPoll  = useRef<NodeJS.Timeout | null>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  // ── Poll status + QR ──────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/whatsapp/status");
      const data = await res.json();
      setStatus(data.status  ?? "DISCONNECTED");
      setPhone(data.phone    ?? null);

      if (data.status === "QR_PENDING") {
        const qrRes  = await fetch("/api/admin/whatsapp/qr");
        const qrData = await qrRes.json();
        setQR(qrData.qr ?? null);
      } else {
        setQR(null);
      }
    } catch {
      setStatus("DISCONNECTED");
    }
  }, []);

  // Poll every 2 s while not connected
  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStatus]);

  // Stop heavy polling once connected
  useEffect(() => {
    if (status === "CONNECTED" && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(fetchStatus, 8000); // slower keep-alive
    }
  }, [status, fetchStatus]);

  // ── Blast progress polling ────────────────────────────────────
  const fetchProgress = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/whatsapp/progress");
      const data = await res.json();
      setProgress(data);
      if (!data.running) {
        if (blastPoll.current) clearInterval(blastPoll.current);
        setBlasting(false);
        if (data.total > 0) setTab("logs");  // auto-switch to logs when done
      }
    } catch { /* ignore */ }
  }, []);

  // ── Actions ───────────────────────────────────────────────────
  const handleConnect = async () => {
    setConnecting(true);
    try {
      await fetch("/api/admin/whatsapp/connect", { method: "POST" });
      await fetchStatus();
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await fetch("/api/admin/whatsapp/disconnect", { method: "POST" });
    setStatus("DISCONNECTED");
    setQR(null);
    setPhone(null);
  };

  const handleRawChange = (val: string) => {
    setRawInput(val);
    setLeads(parseLeads(val));
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawInput(text);
      setLeads(parseLeads(text));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBlast = async () => {
    if (!leads.length || !message.trim() || status !== "CONNECTED") return;
    setBlasting(true);

    const res = await fetch("/api/admin/whatsapp/blast", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ leads, message, minDelay, maxDelay }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Blast failed to start");
      setBlasting(false);
      return;
    }

    // Start polling progress
    blastPoll.current = setInterval(fetchProgress, 1200);
    setTab("logs");
  };

  const copyTemplate = () => navigator.clipboard.writeText(message);

  const info = STATUS_MAP[status] ?? STATUS_MAP.DISCONNECTED;
  const pct  = progress.total > 0
    ? Math.round(((progress.sent + progress.failed) / progress.total) * 100)
    : 0;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <p className="text-[#E8192B] text-[10px] tracking-[0.45em] uppercase font-medium mb-1">Admin Panel</p>
          <h1 className="font-heading text-4xl uppercase tracking-wider text-white">WhatsApp Leads</h1>
          <p className="text-white/25 text-sm mt-1">Bulk blast + Grok AI auto-reply via linked device.</p>
        </div>

        {/* Connection badge */}
        <div className={`flex items-center gap-2.5 px-4 py-2 border ${
          status === "CONNECTED"
            ? "border-green-500/20 bg-green-500/05"
            : "border-white/[0.06] bg-white/[0.02]"
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${info.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${info.color}`}>{info.label}</span>
          {phone && <span className="text-[10px] text-white/30 font-mono ml-1">{phone}</span>}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {([
          { id: "device", label: "Link Device",     icon: Smartphone  },
          { id: "blast",  label: "Compose Blast",   icon: Send        },
          { id: "logs",   label: "Blast Log",        icon: FileText    },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] border-b-2 transition-all -mb-px ${
              tab === id
                ? "border-[#E8192B] text-white"
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            <Icon size={13} /> {label}
            {id === "blast" && leads.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#E8192B]/20 text-[#E8192B] text-[9px] rounded-full font-bold">
                {leads.length}
              </span>
            )}
            {id === "logs" && progress.running && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#E8192B] animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: LINK DEVICE
      ══════════════════════════════════════════════════════════ */}
      {tab === "device" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: QR / Connected state */}
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-8 flex flex-col items-center justify-center min-h-[420px]">
            <div className="flex items-center gap-3 w-full mb-8">
              <div className="w-[2px] h-5 bg-[#E8192B]" />
              <h2 className="font-heading text-lg uppercase tracking-wider text-white">WhatsApp Device</h2>
            </div>

            {status === "CONNECTED" ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-400" />
                </div>
                <div>
                  <p className="font-heading text-2xl tracking-wider text-white mb-1">DEVICE LINKED</p>
                  <p className="text-white/40 text-sm font-mono">{phone}</p>
                </div>
                <p className="text-white/25 text-xs max-w-xs leading-relaxed">
                  Your WhatsApp is connected. You can now send bulk blasts and the AI will auto-reply to incoming messages.
                </p>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.04] border border-white/[0.06] hover:border-[#E8192B]/30 hover:text-[#E8192B] text-white/50 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  <WifiOff size={13} /> Disconnect Device
                </button>
              </div>
            ) : status === "QR_PENDING" && qr ? (
              <div className="flex flex-col items-center gap-5">
                <div className="p-3 bg-white border-4 border-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="WhatsApp QR" className="w-56 h-56" />
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-bold mb-1">Scan with WhatsApp</p>
                  <p className="text-white/30 text-xs">
                    Open WhatsApp → Settings → Linked Devices → Link a Device
                  </p>
                </div>
                <div className="flex items-center gap-2 text-amber-400 text-xs">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Waiting for scan…</span>
                </div>
              </div>
            ) : status === "INITIALIZING" || status === "AUTHENTICATED" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 size={36} className="text-amber-400 animate-spin" />
                <p className="text-amber-400 text-sm font-bold uppercase tracking-wider">
                  {status === "INITIALIZING" ? "Starting WhatsApp…" : "Authenticating…"}
                </p>
                <p className="text-white/25 text-xs">This takes 10–20 seconds on first run.</p>
              </div>
            ) : status === "AUTH_FAILED" ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <XCircle size={36} className="text-[#E8192B]" />
                <p className="text-[#E8192B] text-sm font-bold uppercase tracking-wider">Auth Failed</p>
                <p className="text-white/25 text-xs">Session expired. Connect again to regenerate QR.</p>
                <button onClick={handleConnect} className="px-6 py-2.5 bg-[#E8192B] text-white text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(232,25,43,0.4)] transition-shadow">
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Smartphone size={32} className="text-white/20" />
                </div>
                <div>
                  <p className="text-white/60 text-sm font-bold mb-1">No device linked</p>
                  <p className="text-white/25 text-xs max-w-[240px] leading-relaxed">
                    Start the WhatsApp bot server, then click Connect to generate a QR code.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="group relative flex items-center gap-2 px-8 py-3 bg-[#E8192B] text-white text-xs font-bold uppercase tracking-widest overflow-hidden hover:shadow-[0_0_30px_rgba(232,25,43,0.4)] transition-shadow disabled:opacity-50"
                >
                  {connecting ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                  {connecting ? "Starting…" : "Connect Device"}
                  <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Instructions + bot setup */}
          <div className="space-y-4">
            <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-[2px] h-5 bg-[#E8192B]" />
                <h2 className="font-heading text-lg uppercase tracking-wider text-white">Setup Guide</h2>
              </div>
              <ol className="space-y-4">
                {[
                  { n: "1", title: "Start the bot server", body: "Open a terminal and run:", code: "cd whatsapp-bot && npm install && node server.js" },
                  { n: "2", title: "Add your Grok key", body: "Create whatsapp-bot/.env from the .env.example file and paste your xAI Grok API key (console.x.ai).", code: null },
                  { n: "3", title: "Connect & scan QR", body: 'Click "Connect Device" above, then scan the QR code with your WhatsApp.', code: null },
                  { n: "4", title: "Blast your leads", body: "Switch to Compose Blast, paste your phone numbers, write your message, and fire!", code: null },
                ].map(({ n, title, body, code }) => (
                  <li key={n} className="flex gap-4">
                    <span className="w-6 h-6 bg-[#E8192B]/10 border border-[#E8192B]/20 text-[#E8192B] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-bold">{title}</p>
                      <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{body}</p>
                      {code && (
                        <code className="block mt-1.5 px-3 py-2 bg-black/60 border border-white/[0.06] text-[#E8192B] text-[11px] font-mono break-all">
                          {code}
                        </code>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Grok AI auto-reply info */}
            <div className="bg-[#0f0f0f] border border-white/[0.06] p-5">
              <div className="flex items-center gap-3 mb-3">
                <Bot size={16} className="text-[#E8192B]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Grok AI Auto-Reply</h3>
              </div>
              <p className="text-white/30 text-xs leading-relaxed">
                When someone replies to your blast, the Grok AI automatically responds 24/7 with answers about membership plans, timings, and pricing — trained on Roman Fitness data. Set{" "}
                <code className="text-[#E8192B]">AUTO_REPLY_ENABLED=true</code> in the bot&apos;s .env to activate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: COMPOSE BLAST
      ══════════════════════════════════════════════════════════ */}
      {tab === "blast" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Leads input */}
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-[2px] h-5 bg-[#E8192B]" />
                <h2 className="font-heading text-lg uppercase tracking-wider text-white">Leads</h2>
              </div>
              {leads.length > 0 && (
                <span className="px-3 py-1 bg-[#E8192B]/10 border border-[#E8192B]/20 text-[#E8192B] text-[10px] font-bold uppercase tracking-widest">
                  {leads.length} numbers
                </span>
              )}
            </div>

            {/* Paste area */}
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">
              Paste Phone Numbers
            </label>
            <textarea
              value={rawInput}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder={"Paste numbers — one per line or comma separated:\n\n9876543210\n+919876543211\nJohn,9876543212\nPriya,+919876543213"}
              className="w-full h-44 bg-[#080808] border border-white/[0.06] focus:border-[#E8192B]/50 text-white/80 text-xs font-mono px-4 py-3 resize-none outline-none placeholder:text-white/15 transition-colors"
            />
            <p className="text-white/20 text-[10px] mt-1.5">
              Supports: 10-digit, +91 prefix, or CSV format <code className="text-white/35">name,phone</code>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/20 text-[10px] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* CSV Upload */}
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSV} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/[0.10] hover:border-[#E8192B]/30 text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-all"
            >
              <Upload size={13} /> Upload CSV (name, phone)
            </button>

            {/* Parsed leads preview */}
            {leads.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Preview</p>
                  <button
                    onClick={() => { setRawInput(""); setLeads([]); }}
                    className="flex items-center gap-1 text-white/20 hover:text-[#E8192B] text-[10px] transition-colors"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {leads.slice(0, 50).map((l, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-1.5 bg-[#080808] border border-white/[0.04]">
                      <span className="text-white/20 text-[9px] w-5 text-right">{i + 1}</span>
                      <span className="text-white/70 text-xs font-mono flex-1">{l.phone}</span>
                      {l.name && <span className="text-white/30 text-[10px]">{l.name}</span>}
                    </div>
                  ))}
                  {leads.length > 50 && (
                    <p className="text-center text-white/20 text-[10px] py-1">
                      +{leads.length - 50} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Message + send */}
          <div className="space-y-4">
            <div className="bg-[#0f0f0f] border border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-[2px] h-5 bg-[#E8192B]" />
                  <h2 className="font-heading text-lg uppercase tracking-wider text-white">Message</h2>
                </div>
                <button
                  onClick={copyTemplate}
                  className="flex items-center gap-1.5 text-white/25 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  <Copy size={11} /> Copy
                </button>
              </div>

              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">
                Message Template
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-52 bg-[#080808] border border-white/[0.06] focus:border-[#E8192B]/50 text-white/80 text-xs font-mono px-4 py-3 resize-none outline-none transition-colors"
              />
              <div className="flex justify-between items-center mt-1.5">
                <p className="text-white/20 text-[10px]">
                  Variables: <code className="text-[#E8192B]">{"{name}"}</code> · <code className="text-[#E8192B]">{"{gym}"}</code>
                </p>
                <span className="text-white/20 text-[10px]">{message.length} chars</span>
              </div>

              {/* Delay settings */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1.5">
                    Min Delay (ms)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    max={60000}
                    value={minDelay}
                    onChange={(e) => setMinDelay(Number(e.target.value))}
                    className="w-full bg-[#080808] border border-white/[0.06] focus:border-[#E8192B]/50 text-white text-xs px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1.5">
                    Max Delay (ms)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    max={60000}
                    value={maxDelay}
                    onChange={(e) => setMaxDelay(Number(e.target.value))}
                    className="w-full bg-[#080808] border border-white/[0.06] focus:border-[#E8192B]/50 text-white text-xs px-3 py-2 outline-none"
                  />
                </div>
              </div>
              <p className="text-white/15 text-[10px] mt-1.5">
                Random delay between each message to avoid WhatsApp spam detection.
              </p>
            </div>

            {/* Blast button + status warnings */}
            {status !== "CONNECTED" && (
              <div className="flex items-start gap-3 p-4 bg-amber-500/05 border border-amber-500/20">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-400/80 text-xs">
                  Device not linked. Go to <strong>Link Device</strong> tab and connect your WhatsApp first.
                </p>
              </div>
            )}

            <button
              onClick={handleBlast}
              disabled={blasting || status !== "CONNECTED" || !leads.length || !message.trim()}
              className="group relative w-full py-4 bg-[#E8192B] text-white font-bold text-sm uppercase tracking-[0.25em] overflow-hidden hover:shadow-[0_0_40px_rgba(232,25,43,0.45)] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {blasting ? (
                <><Loader2 size={16} className="animate-spin" /> Blasting…</>
              ) : (
                <><Zap size={16} /> Launch Blast — {leads.length} leads</>
              )}
              <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
            </button>

            <p className="text-center text-white/15 text-[10px] leading-relaxed">
              Messages send with a {minDelay}–{maxDelay}ms random delay.<br />
              Do NOT close the bot server while blasting.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: BLAST LOG
      ══════════════════════════════════════════════════════════ */}
      {tab === "logs" && (
        <div className="space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total",   value: progress.total,  color: "text-white",      border: "#E8192B" },
              { label: "Sent",    value: progress.sent,   color: "text-green-400",  border: "#22c55e" },
              { label: "Failed",  value: progress.failed, color: "text-[#E8192B]",  border: "#E8192B" },
              { label: "Pending", value: Math.max(0, progress.total - progress.sent - progress.failed),
                color: "text-amber-400", border: "#f59e0b" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#0f0f0f] border border-white/[0.06] p-5"
                style={{ borderLeftWidth: 2, borderLeftColor: s.border }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold mb-2">{s.label}</p>
                <p className={`font-heading text-3xl tracking-wider ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {progress.total > 0 && (
            <div className="bg-[#0f0f0f] border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {progress.running ? (
                    <><Loader2 size={13} className="text-[#E8192B] animate-spin" />
                      <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Blasting in progress…</span></>
                  ) : (
                    <><CheckCircle2 size={13} className="text-green-400" />
                      <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Blast complete</span></>
                  )}
                </div>
                <span className="text-white/40 text-xs font-mono">{pct}%</span>
              </div>
              <div className="h-2 bg-white/[0.04] border border-white/[0.04]">
                <div
                  className="h-full bg-[#E8192B] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-white/20 text-[10px] mt-2">
                {progress.sent + progress.failed} / {progress.total} processed
              </p>
            </div>
          )}

          {/* Log table */}
          <div className="bg-[#0f0f0f] border border-white/[0.06]">
            <div className="flex items-center gap-3 p-5 border-b border-white/[0.06]">
              <div className="w-[2px] h-5 bg-[#E8192B]" />
              <h2 className="font-heading text-lg uppercase tracking-wider text-white">Delivery Log</h2>
              <span className="ml-auto text-white/25 text-xs">{progress.logs.length} entries</span>
              {progress.running && (
                <RefreshCw size={12} className="text-[#E8192B] animate-spin" />
              )}
            </div>

            {progress.logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Clock size={32} className="text-white/10" />
                <p className="text-white/20 text-sm">No blast started yet.</p>
                <button
                  onClick={() => setTab("blast")}
                  className="flex items-center gap-1.5 text-[#E8192B] text-xs hover:text-white transition-colors"
                >
                  Go to Compose Blast <ChevronRight size={12} />
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["#", "Phone", "Name", "Status", "Reason", "Time"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...progress.logs].reverse().map((log, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-white/20 font-mono">{progress.logs.length - i}</td>
                        <td className="px-4 py-3 text-white/70 font-mono">{log.phone}</td>
                        <td className="px-4 py-3 text-white/50">{log.name || "—"}</td>
                        <td className="px-4 py-3">
                          {log.status === "sent" ? (
                            <span className="flex items-center gap-1.5 text-green-400 font-bold">
                              <CheckCircle2 size={11} /> Sent
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[#E8192B] font-bold">
                              <XCircle size={11} /> Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/25 max-w-[180px] truncate">{log.reason || "—"}</td>
                        <td className="px-4 py-3 text-white/25 font-mono whitespace-nowrap">
                          {new Date(log.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
