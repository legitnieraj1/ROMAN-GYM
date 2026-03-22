"use client";

import { useEffect, useState } from "react";
import { markAttendance } from "@/app/actions/attendance";
import Image from "next/image";

export default function TapPage() {
    const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [message, setMessage] = useState("");
    const [details, setDetails] = useState<{ type: string; name?: string; time?: string } | null>(null);

    useEffect(() => {
        const processTap = async () => {
            try {
                const res = await markAttendance();
                if (res.success && res.status) {
                    setStatus('SUCCESS');
                    setDetails({
                        type: res.status,
                        name: res.name || "Member",
                        time: res.time
                    });
                } else {
                    setStatus('ERROR');
                    setMessage(res.error || "Something went wrong");
                }
            } catch {
                setStatus('ERROR');
                setMessage("Network error");
            }
        };

        processTap();
    }, []);

    const isCheckIn = details?.type === 'CHECK_IN';
    const isCheckOut = details?.type === 'CHECK_OUT';
    const isAlready = details?.type === 'ALREADY_COMPLETED';

    const accentColor = isCheckIn ? '#00daf3' : isCheckOut ? '#0059ff' : '#f59e0b';
    const accentBg = isCheckIn ? 'rgba(0,218,243,0.1)' : isCheckOut ? 'rgba(0,89,255,0.1)' : 'rgba(245,158,11,0.1)';

    // --- LOADING STATE ---
    if (status === 'LOADING') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] text-white p-4">
                {/* Scanning animation */}
                <div className="relative w-32 h-32 mb-8">
                    {/* Outer ring pulse */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#0059ff]/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border border-[#00daf3]/20 animate-pulse" />
                    {/* NFC icon center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00daf3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                            <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                            <path d="M12.91 4.1a16.1 16.1 0 0 1 0 15.8" />
                            <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-2xl font-bold tracking-[0.3em] uppercase text-[#bec8d3] mb-2">
                    Reading NFC
                </h1>
                <p className="text-sm text-[#bec8d3]/50 tracking-widest uppercase">
                    Processing your tap...
                </p>
            </div>
        );
    }

    // --- ERROR STATE ---
    if (status === 'ERROR') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] text-white p-4 text-center">
                {/* Error icon */}
                <div className="w-24 h-24 rounded-full border-2 border-red-500/40 flex items-center justify-center mb-6" style={{ background: 'rgba(239,68,68,0.08)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-red-500 mb-2">
                    TAP FAILED
                </h1>
                <p className="text-[#bec8d3]/60 mb-8 max-w-xs text-sm">{message}</p>

                <div className="flex gap-3">
                    <a href="/" className="px-6 py-3 border border-[#1e1e22] text-[#bec8d3] text-sm font-semibold tracking-wider uppercase hover:border-[#0059ff]/50 transition-colors">
                        Home
                    </a>
                    <a href="/login" className="px-6 py-3 bg-gradient-to-r from-[#0059ff] to-[#00daf3] text-white text-sm font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity">
                        Login
                    </a>
                </div>
            </div>
        );
    }

    // --- SUCCESS STATE ---
    if (isCheckIn) {
        return (
            <main
                className="min-h-screen bg-[#131314] text-[#e5e2e3] relative overflow-hidden flex flex-col items-center justify-center p-8 selection:bg-[#0059ff] selection:text-white"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%231c1c1e' fill-opacity='0.4'/%3E%3C/svg%3E\")"
                }}
            >
                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl text-center">
                    {/* Hero Status */}
                    <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="text-[#b6c4ff] text-sm font-bold tracking-[0.4em] uppercase mb-4 block" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            ACCESS GRANTED
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter italic text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            WELCOME, <span className="text-[#00daf3]">WARRIOR</span>
                        </h1>
                        <h2 className="text-xl md:text-3xl font-bold uppercase tracking-wider text-[#b6c4ff] mt-2">
                            {details?.name || "LEGIONNAIRE"}
                        </h2>
                    </div>

                    {/* Streak Counter */}
                    <div className="relative group my-12">
                        <div className="absolute inset-0 bg-[#0059ff]/20 rounded-full blur-3xl animate-pulse" />
                        <div className="relative flex flex-col items-center bg-[#2a2a2b]/40 backdrop-blur-md border border-white/10 p-10 px-16 min-w-[320px]">
                            <span className="text-xs font-bold text-[#bec8d3] uppercase tracking-[0.3em] mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                STREAK INCREASED!
                            </span>
                            <div className="flex items-baseline gap-4">
                                <span className="text-2xl text-[#bec8d3]/40 line-through decoration-[#b6c4ff] decoration-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                    --
                                </span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b6c4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                                    <polyline points="13 17 18 12 13 7" />
                                    <polyline points="6 17 11 12 6 7" />
                                </svg>
                                <span className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(182,196,255,0.4)]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                    +1
                                </span>
                            </div>
                            <span className="text-lg md:text-xl font-bold text-[#00daf3] uppercase tracking-widest mt-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                DAYS OF GLORY
                            </span>
                        </div>
                    </div>

                    {/* Aurelius Creed Quote */}
                    <div className="max-w-2xl mx-auto border-y border-white/5 py-8">
                        <p className="text-[10px] text-[#b6c4ff] font-bold tracking-[0.5em] mb-4 uppercase">Aurelius Creed</p>
                        <blockquote className="text-2xl md:text-3xl font-light italic leading-tight text-[#dae4ef]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            "Virtue is the only good. What happens to you does not matter; what you do with it matters."
                        </blockquote>
                    </div>
                </div>

                {/* Return button */}
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="mt-12 relative z-20 text-[#bec8d3]/40 text-xs tracking-[0.2em] uppercase hover:text-[#bec8d3]/70 transition-colors"
                >
                    ← INITIATE TERMINAL LOCK
                </button>

                {/* Decorative Logo Anchor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none scale-[4]">
                    <img alt="Roman Fitness Logo" className="w-96 grayscale" src="/logooo.png" />
                </div>
            </main>
        );
    }

    if (isCheckOut || isAlready) {
        return (
            <main className="min-h-screen pt-12 md:pt-20 bg-[#131314] text-[#e5e2e3] relative overflow-y-auto overflow-x-hidden selection:bg-[#0059ff] selection:text-white pb-20">
                {/* CSS Scan Line Animation */}
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes scan {
                        0% { top: 0; opacity: 0; }
                        5% { opacity: 1; }
                        95% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                    .scan-line {
                        width: 100%;
                        height: 2px;
                        background: #00daf3;
                        position: fixed;
                        top: 0;
                        left: 0;
                        animation: scan 6s linear infinite;
                        z-index: 10;
                        box-shadow: 0 0 15px #00daf3;
                        pointer-events: none;
                    }
                `}} />
                
                <div className="scan-line"></div>

                {/* Background Roman Monolith Pattern */}
                <div className="fixed inset-0 opacity-5 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#b6c4ff] to-transparent"></div>
                </div>

                <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col items-center">
                    {/* Hero Completion Message */}
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 md:mb-8 rounded-full border-2 border-[#00daf3]/30 bg-[#00daf3]/5">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00daf3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        </div>
                        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                            {isAlready ? "ALREADY COMPLETED" : "WELL FOUGHT, LEGIONNAIRE"}
                        </h2>
                        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#b6c4ff] mb-6">
                            {details?.name || "WARRIOR"}
                        </h3>
                        <div className="flex items-center justify-center gap-4 text-[#00daf3]">
                            <span className="h-[2px] w-8 sm:w-12 bg-[#00daf3]"></span>
                            <span className="tracking-[0.5em] text-[10px] sm:text-sm uppercase font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                Mission Summary Archived
                            </span>
                            <span className="h-[2px] w-8 sm:w-12 bg-[#00daf3]"></span>
                        </div>
                    </div>

                    {!isAlready && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full mb-12 sm:mb-16">
                            {/* Stats Grid */}
                            <div className="bg-[#2a2a2b] border-t-2 border-[#00daf3] p-6 sm:p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(0,89,255,0.05)] hover:shadow-[0_0_30px_rgba(0,218,243,0.15)] hover:border-[#00daf3] transition-all duration-300">
                                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <p className="text-[#bec8d3] text-[10px] sm:text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Session Time</p>
                                <p className="text-4xl sm:text-5xl font-bold text-[#e5e2e3]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>01:42:18</p>
                            </div>

                            <div className="bg-[#2a2a2b] border-t-2 border-[#b6c4ff] p-6 sm:p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(0,89,255,0.05)] hover:shadow-[0_0_30px_rgba(0,218,243,0.15)] hover:border-[#b6c4ff] transition-all duration-300">
                                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                </div>
                                <p className="text-[#bec8d3] text-[10px] sm:text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Intensity Score</p>
                                <p className="text-4xl sm:text-5xl font-bold text-[#e5e2e3]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>88<span className="text-xl sm:text-2xl text-[#b6c4ff] font-medium">/100</span></p>
                            </div>

                            <div className="bg-[#2a2a2b] border-t-2 border-[#ffb4ab] p-6 sm:p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(0,89,255,0.05)] hover:shadow-[0_0_30px_rgba(0,218,243,0.15)] hover:border-[#ffb4ab] transition-all duration-300">
                                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="m5 8.5-2 2 2 2"/><path d="m5 15.5-2-2 2-2"/><path d="m19 15.5 2-2-2-2"/><path d="m19 8.5 2 2-2 2"/><path d="M9 12h6"/></svg>
                                </div>
                                <p className="text-[#bec8d3] text-[10px] sm:text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Volume Moved</p>
                                <p className="text-4xl sm:text-5xl font-bold text-[#e5e2e3]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>12,450 <span className="text-xl sm:text-2xl text-[#bec8d3] font-medium uppercase">kg</span></p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 w-full">
                        {/* Recovery Protocol */}
                        <div className="bg-[#1c1b1c] border-l-4 border-[#00daf3] p-8 sm:p-10 relative">
                            <div className="flex items-center gap-3 mb-6">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00daf3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                <p className="text-[#00daf3] text-sm lg:text-base uppercase tracking-[0.3em] font-black" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                    RECOVERY PROTOCOL
                                </p>
                            </div>
                            <p className="text-[#c3c5d9] leading-relaxed text-lg sm:text-xl lg:text-2xl">
                                Prioritize magnesium and 500ml of electrolyte hydration within the next 15 minutes. The body repairs what the arena broke.
                            </p>
                            <div className="mt-8 flex gap-2">
                                <div className="h-1 w-12 bg-[#00daf3]"></div>
                                <div className="h-1 w-4 bg-[#00daf3] opacity-30"></div>
                                <div className="h-1 w-2 bg-[#00daf3] opacity-10"></div>
                            </div>
                        </div>

                        {/* Quote / Creed */}
                        <div className="flex flex-col justify-center items-end text-right border-r-4 border-[#b6c4ff] px-6 sm:px-10 py-8">
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e5e2e3] leading-tight tracking-tighter italic uppercase" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                                "Victory is won in the silence of the arena."
                            </p>
                            <div className="mt-6 flex flex-col items-end">
                                <p className="text-[#b6c4ff] text-[10px] sm:text-sm tracking-widest uppercase" style={{ fontFamily: "Space Grotesk, sans-serif" }}>The Aurelius Creed</p>
                                <p className="text-[#bec8d3]/40 text-[8px] sm:text-[10px] tracking-[0.5em] mt-2 uppercase" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Protocol: Departure</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-16 sm:mt-20 w-full flex justify-center">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-10 sm:px-16 py-4 sm:py-5 bg-[#b6c4ff] text-[#00287d] font-black tracking-[0.2em] sm:tracking-[0.4em] text-xs sm:text-sm uppercase hover:bg-white hover:text-black transition-all active:scale-95 shadow-[0_15px_30px_rgba(0,89,255,0.3)]"
                            style={{ fontFamily: "Space Grotesk, sans-serif" }}
                        >
                            Return to Lobby
                        </button>
                    </div>
                </div>
            </main>
        );
    }
}
