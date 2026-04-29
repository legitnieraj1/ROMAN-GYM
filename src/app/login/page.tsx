"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const SLIDES = [
    "/gym/corridor-1.jpg",
    "/gym/floor-wide.jpg",
    "/gym/dumbbell-area.jpg",
    "/gym/corridor-2.jpg",
];

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [formData, setFormData] = useState({ mobile: "", pin: "" });
    const [slide, setSlide] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
        return () => clearInterval(t);
    }, []);

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
        <div className="min-h-screen w-full flex overflow-hidden bg-[#080808]">

            {/* ── LEFT: Full-bleed gym image panel ── */}
            <div className="hidden lg:flex relative flex-col" style={{ width: "58%" }}>
                {/* Slideshow images */}
                {SLIDES.map((src, i) => (
                    <div
                        key={src}
                        className="absolute inset-0 transition-opacity duration-[1200ms]"
                        style={{ opacity: i === slide ? 1 : 0 }}
                    >
                        <Image
                            src={src}
                            alt=""
                            fill
                            sizes="58vw"
                            className="object-cover"
                            priority={i === 0}
                        />
                    </div>
                ))}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/75 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 z-10" />
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(232,25,43,0.22) 0%, transparent 55%)" }}
                />

                {/* Brand — top-left */}
                <div className="relative z-20 p-10 flex items-center gap-3">
                    <Image src="/logoroman.png" alt="Roman Fitness" width={44} height={44} className="h-11 w-auto" />
                    <div>
                        <p className="font-heading text-white text-xl tracking-[0.25em] leading-none">ROMAN</p>
                        <p className="text-white/35 text-[8px] tracking-[0.5em] uppercase">FITNESS</p>
                    </div>
                </div>

                {/* Bottom hero text */}
                <div className="relative z-20 mt-auto p-10 pb-16">
                    <h1
                        className="font-heading text-white leading-none tracking-wider uppercase"
                        style={{ fontSize: "clamp(3.5rem, 6vw, 6rem)" }}
                    >
                        CLAIM YOUR<br />
                        <span
                            className="text-[#E8192B]"
                            style={{ textShadow: "0 0 60px rgba(232,25,43,0.55)" }}
                        >
                            LEGACY
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm mt-4 max-w-xs tracking-wide leading-relaxed">
                        Enter the Roman Empire of Fitness. Where warriors are forged daily.
                    </p>
                    {/* Slide dots */}
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

                {/* Right-edge red separator */}
                <div className="absolute right-0 top-[8%] bottom-[8%] w-px bg-gradient-to-b from-transparent via-[#E8192B]/50 to-transparent z-20" />
            </div>

            {/* ── RIGHT: Form panel ── */}
            <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col justify-center items-center px-8 md:px-14 lg:px-16 py-16 relative bg-[#080808]"
            >
                {/* Top hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8192B]/30 to-transparent" />

                <div className="w-full max-w-[360px]">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-12 flex items-center gap-3">
                        <Image src="/logoroman.png" alt="" width={40} height={40} className="h-10 w-auto" />
                        <p className="font-heading text-white text-xl tracking-widest">ROMAN FITNESS</p>
                    </div>

                    <p className="text-[#E8192B] text-[9px] tracking-[0.65em] uppercase font-semibold mb-3">
                        Member Portal
                    </p>
                    <h2
                        className="font-heading text-white uppercase tracking-wider leading-[0.9] mb-10"
                        style={{ fontSize: "clamp(2.8rem, 4.5vw, 3.8rem)" }}
                    >
                        Enter<br />The Arena
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-[#E8192B]/10 border border-[#E8192B]/30 text-[#E8192B] text-xs tracking-wider">
                                {error}
                            </div>
                        )}

                        {/* Mobile Number */}
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Mobile Number
                            </label>
                            <input
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                autoComplete="tel"
                                placeholder="Enter your number"
                                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#E8192B] focus:bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-white/20 text-sm outline-none transition-all"
                            />
                        </div>

                        {/* PIN */}
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Access PIN
                            </label>
                            <div className="relative">
                                <input
                                    name="pin"
                                    type={showPin ? "text" : "password"}
                                    value={formData.pin}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••"
                                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#E8192B] focus:bg-white/[0.06] px-4 py-3.5 pr-12 text-white placeholder:text-white/20 text-sm tracking-widest outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                                >
                                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-4 mt-2 font-bold text-sm uppercase tracking-[0.28em] bg-[#E8192B] text-white overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(232,25,43,0.5)] disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enter the Arena"}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm text-white/25">
                        New warrior?{" "}
                        <Link
                            href="/signup"
                            className="text-[#E8192B] hover:text-white font-bold ml-1 transition-colors uppercase tracking-widest text-xs"
                        >
                            Join Now
                        </Link>
                    </p>
                </div>

                {/* Bottom corner tag */}
                <p className="absolute bottom-8 text-white/12 text-[9px] uppercase tracking-[0.5em] select-none">
                    Roman Fitness — Est. 2026
                </p>
            </motion.div>
        </div>
    );
}
