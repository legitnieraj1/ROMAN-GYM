"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const SLIDES = [
    "/gym/corridor-1.jpg",
    "/gym/bench-press.jpg",
    "/gym/cable-machine.jpg",
    "/gym/smith-machine-2.jpg",
];

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500);
        return () => clearInterval(t);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Login failed");
            } else {
                window.location.href = "/admin/dashboard";
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-[#080808]">

            {/* ── LEFT: Image panel ── */}
            <div className="hidden lg:flex relative flex-col" style={{ width: "55%" }}>
                {SLIDES.map((src, i) => (
                    <div
                        key={src}
                        className="absolute inset-0 transition-opacity duration-[1400ms]"
                        style={{ opacity: i === slide ? 1 : 0 }}
                    >
                        <Image src={src} alt="" fill sizes="55vw" className="object-cover" priority={i === 0} />
                    </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/25 to-black/80 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65 z-10" />
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 25% 75%, rgba(232,25,43,0.2) 0%, transparent 55%)" }}
                />

                {/* Brand */}
                <div className="relative z-20 p-10 flex items-center gap-3">
                    <Image src="/logoroman.png" alt="Roman Fitness" width={44} height={44} className="h-11 w-auto" />
                    <div>
                        <p className="font-heading text-white text-xl tracking-[0.25em] leading-none">ROMAN</p>
                        <p className="text-white/35 text-[8px] tracking-[0.5em] uppercase">FITNESS</p>
                    </div>
                </div>

                <div className="relative z-20 mt-auto p-10 pb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8192B]/20 border border-[#E8192B]/40 mb-6">
                        <ShieldCheck size={12} className="text-[#E8192B]" />
                        <span className="text-[#E8192B] text-[9px] tracking-[0.45em] uppercase font-bold">Restricted Access</span>
                    </div>
                    <h1
                        className="font-heading text-white leading-none tracking-wider uppercase"
                        style={{ fontSize: "clamp(3rem, 5.5vw, 5.5rem)" }}
                    >
                        ARENA<br />
                        <span
                            className="text-[#E8192B]"
                            style={{ textShadow: "0 0 60px rgba(232,25,43,0.55)" }}
                        >
                            COMMAND
                        </span>
                    </h1>
                    <p className="text-white/35 text-sm mt-4 max-w-[280px] tracking-wide">
                        Administrator terminal. Authorized personnel only.
                    </p>
                    <div className="flex gap-2 mt-8">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setSlide(i)}
                                className={`h-[2px] rounded-none transition-all duration-300 ${i === slide ? "bg-[#E8192B] w-8" : "bg-white/25 w-3"}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="absolute right-0 top-[8%] bottom-[8%] w-px bg-gradient-to-b from-transparent via-[#E8192B]/50 to-transparent z-20" />
            </div>

            {/* ── RIGHT: Form ── */}
            <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col justify-center items-center px-8 md:px-14 lg:px-16 py-16 relative bg-[#080808]"
            >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8192B]/30 to-transparent" />

                <div className="w-full max-w-[360px]">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-12 flex flex-col items-center gap-3 text-center">
                        <Image src="/logoroman.png" alt="" width={48} height={48} className="h-12 w-auto" />
                        <p className="font-heading text-white text-xl tracking-widest">ARENA COMMAND</p>
                    </div>

                    <div className="hidden lg:block mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8192B]/10 border border-[#E8192B]/25">
                            <ShieldCheck size={11} className="text-[#E8192B]" />
                            <span className="text-[#E8192B] text-[9px] tracking-[0.4em] uppercase font-bold">Restricted Access</span>
                        </div>
                    </div>

                    <h2
                        className="font-heading text-white uppercase tracking-wider leading-[0.9] mb-10"
                        style={{ fontSize: "clamp(2.6rem, 4vw, 3.5rem)" }}
                    >
                        Admin<br />Terminal
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-[#E8192B]/10 border border-[#E8192B]/30 text-[#E8192B] text-xs tracking-wider">
                                <ShieldCheck size={14} />
                                {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                                <Input
                                    type="email"
                                    placeholder="admin@romanfitness.in"
                                    className="pl-10 bg-white/[0.04] border-white/[0.08] text-white rounded-none focus:border-[#E8192B] focus:ring-0 h-12 placeholder:text-white/20 text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-10 bg-white/[0.04] border-white/[0.08] text-white rounded-none focus:border-[#E8192B] focus:ring-0 h-12 placeholder:text-white/20 text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-12 bg-[#E8192B] text-white font-bold uppercase tracking-[0.28em] text-sm overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(232,25,43,0.5)] disabled:opacity-50 mt-2"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                        </button>
                    </form>

                    <p className="text-center mt-8 text-white/12 text-[9px] uppercase tracking-[0.45em]">
                        Roman Fitness · Command Terminal
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
