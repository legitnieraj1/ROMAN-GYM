"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [formData, setFormData] = useState({ mobile: "", pin: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            router.refresh();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-[#080808]">
            {/* Red ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 30% 60%, rgba(232,25,43,0.07) 0%, transparent 60%)" }} />

            {/* Hairlines */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-white/[0.06]"
            >
                {/* Left panel */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-[#0a0a0a] relative overflow-hidden border-r border-white/[0.06]">
                    {/* Red left accent */}
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-[#E8192B] to-transparent" />

                    <Image src="/logoroman.png" alt="Roman Fitness" width={120} height={120} className="h-20 w-auto" />

                    <div className="mt-auto">
                        <h1 className="font-heading text-5xl md:text-6xl uppercase tracking-wider text-white leading-none mb-4">
                            CLAIM YOUR <br />
                            <span className="text-[#E8192B]" style={{ textShadow: "0 0 60px rgba(232,25,43,0.45)" }}>
                                LEGACY
                            </span>
                        </h1>
                        <p className="text-white/30 text-sm leading-relaxed max-w-xs tracking-wide">
                            Access the most advanced athletic performance HUD ever forged.
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                            <div className="h-px w-16 bg-[#E8192B]" />
                            <span className="text-[#E8192B] text-[10px] tracking-[0.45em] uppercase font-medium">Roman Fitness</span>
                        </div>
                    </div>
                </div>

                {/* Right panel — form */}
                <div className="bg-[#0f0f0f] p-8 md:p-14 flex flex-col justify-center">
                    {/* Mobile logo */}
                    <div className="md:hidden mb-10 flex justify-center">
                        <Image src="/logoroman.png" alt="Roman Fitness" width={80} height={80} className="h-14 w-auto" />
                    </div>

                    <div className="mb-10">
                        <p className="text-[#E8192B] text-[9px] tracking-[0.55em] uppercase font-medium mb-3">Member Portal</p>
                        <h2 className="font-heading text-4xl uppercase tracking-wider text-white">Enter the Arena</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-[#E8192B]/10 border border-[#E8192B]/30 text-[#E8192B] text-sm p-3 text-center tracking-wide">
                                {error}
                            </div>
                        )}

                        {/* Mobile Number */}
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Mobile Number
                            </label>
                            <input
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                placeholder="Enter your number"
                                className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-[#E8192B] focus:ring-0 px-0 py-3 text-white placeholder:text-white/20 transition-all text-base outline-none"
                            />
                        </div>

                        {/* PIN */}
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Access PIN
                            </label>
                            <div className="relative">
                                <input
                                    name="pin"
                                    type={showPin ? "text" : "password"}
                                    value={formData.pin}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••"
                                    className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-[#E8192B] focus:ring-0 px-0 py-3 text-white placeholder:text-white/20 transition-all text-base tracking-widest outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors text-[10px] tracking-widest uppercase"
                                >
                                    {showPin ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-4 font-bold text-sm uppercase tracking-[0.3em] bg-[#E8192B] text-white overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(232,25,43,0.5)] disabled:opacity-50 active:scale-[0.98]"
                        >
                            <span className="relative z-10">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Enter the Arena"}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-sm text-white/25">
                            New warrior?{" "}
                            <Link href="/signup" className="text-[#E8192B] hover:text-white font-bold ml-1 transition-colors uppercase tracking-widest text-xs">
                                Join Now
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Corner label */}
            <div className="fixed bottom-8 left-8 hidden lg:block opacity-30">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.5em]">Roman Fitness — Est. 2026</span>
            </div>
        </main>
    );
}
