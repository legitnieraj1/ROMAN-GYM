"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden px-4">
            {/* Ambient red glow */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(232,25,43,0.07) 0%, transparent 60%)" }} />

            {/* Hairlines */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <Image src="/logoroman.png" alt="Roman Fitness" width={64} height={64} className="h-14 w-auto mx-auto mb-6" />
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#E8192B]/20 bg-[#E8192B]/05 mb-4">
                        <Shield className="w-3 h-3 text-[#E8192B]" />
                        <span className="text-[#E8192B] text-[10px] tracking-[0.4em] uppercase font-bold">Restricted Access</span>
                    </div>
                    <h1 className="font-heading text-4xl uppercase tracking-wider text-white">Arena Command</h1>
                    <p className="text-white/25 text-xs tracking-widest uppercase mt-2">Administrator Portal</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}
                    className="bg-[#0a0a0a] border border-white/[0.06] p-8 space-y-6">
                    {/* Top red accent */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8192B]/60 to-transparent pointer-events-none" />

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-[#E8192B]/10 border border-[#E8192B]/30 text-[#E8192B] text-sm">
                            <Shield size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 group-focus-within:text-[#E8192B] transition-colors">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <Input
                                type="email"
                                placeholder="admin@romanfitness.in"
                                className="pl-10 bg-[#080808] border-white/10 text-white rounded-none focus:border-[#E8192B] focus:ring-0 h-12 placeholder:text-white/20"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 group-focus-within:text-[#E8192B] transition-colors">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10 bg-[#080808] border-white/10 text-white rounded-none focus:border-[#E8192B] focus:ring-0 h-12 placeholder:text-white/20"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full h-12 bg-[#E8192B] text-white font-bold uppercase tracking-[0.28em] text-sm overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(232,25,43,0.5)] disabled:opacity-50"
                    >
                        <span className="relative z-10">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Access Dashboard"}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                    </button>
                </form>

                <p className="text-center mt-6 text-white/20 text-[10px] uppercase tracking-[0.4em]">
                    Roman Fitness · Command Terminal
                </p>
            </motion.div>
        </div>
    );
}
