"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const SLIDES = [
    "/gym/smith-machine.jpg",
    "/gym/lateral-raise.jpg",
    "/gym/chest-press.jpg",
    "/gym/motivation.jpg",
];

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [slide, setSlide] = useState(0);
    const [formData, setFormData] = useState({
        name: "", dob: "", mobile: "", pin: "", confirmPin: "", terms: false,
    });

    useEffect(() => {
        const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
        return () => clearInterval(t);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        if (formData.pin !== formData.confirmPin) { setError("PINs do not match"); setIsLoading(false); return; }
        if (formData.pin.length !== 4) { setError("PIN must be exactly 4 digits"); setIsLoading(false); return; }
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, dob: formData.dob || undefined, mobile: formData.mobile, pin: formData.pin }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed");
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

            {/* ── LEFT: Image panel ── */}
            <div className="hidden lg:flex relative flex-col" style={{ width: "42%" }}>
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
                            sizes="42vw"
                            className="object-cover"
                            priority={i === 0}
                        />
                    </div>
                ))}

                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/80 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65 z-10" />
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 30% 70%, rgba(232,25,43,0.2) 0%, transparent 55%)" }}
                />

                {/* Logo */}
                <div className="relative z-20 p-10 flex items-center gap-3">
                    <Image src="/logoroman.png" alt="Roman Fitness" width={40} height={40} className="h-10 w-auto" />
                    <div>
                        <p className="font-heading text-white text-lg tracking-[0.25em] leading-none">ROMAN</p>
                        <p className="text-white/35 text-[8px] tracking-[0.5em] uppercase">FITNESS</p>
                    </div>
                </div>

                {/* Bottom copy */}
                <div className="relative z-20 mt-auto p-10 pb-16">
                    <h1
                        className="font-heading text-white leading-none tracking-wider uppercase"
                        style={{ fontSize: "clamp(3rem, 5.5vw, 5.5rem)" }}
                    >
                        JOIN THE<br />
                        <span
                            className="text-[#E8192B]"
                            style={{ textShadow: "0 0 60px rgba(232,25,43,0.55)" }}
                        >
                            LEGION
                        </span>
                    </h1>
                    <p className="text-white/40 text-sm mt-4 max-w-[240px] tracking-wide leading-relaxed">
                        Excellence is not an act — it&apos;s a habit forged every single day.
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

            {/* ── RIGHT: Form panel ── */}
            <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col justify-center items-center px-8 md:px-12 lg:px-14 py-12 relative bg-[#080808] overflow-y-auto"
            >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8192B]/30 to-transparent" />

                <div className="w-full max-w-[400px] py-8">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-10 flex items-center gap-3">
                        <Image src="/logoroman.png" alt="" width={36} height={36} className="h-9 w-auto" />
                        <p className="font-heading text-white text-lg tracking-widest">ROMAN FITNESS</p>
                    </div>

                    <p className="text-[#E8192B] text-[9px] tracking-[0.65em] uppercase font-semibold mb-3">
                        New Recruit
                    </p>
                    <h2
                        className="font-heading text-white uppercase tracking-wider leading-[0.9] mb-8"
                        style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                    >
                        Join the<br />Legion
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-[#E8192B]/10 border border-[#E8192B]/30 text-[#E8192B] text-xs tracking-wider">
                                {error}
                            </div>
                        )}

                        {[
                            { label: "Full Name", name: "name", type: "text", placeholder: "Your name", autocomplete: "name" },
                            { label: "Mobile Number", name: "mobile", type: "tel", placeholder: "+91 00000 00000", autocomplete: "tel" },
                        ].map(({ label, name, type, placeholder, autocomplete }) => (
                            <div key={name} className="group">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                    {label}
                                </label>
                                <input
                                    name={name}
                                    type={type}
                                    value={(formData as any)[name]}
                                    onChange={handleChange}
                                    required
                                    autoComplete={autocomplete}
                                    placeholder={placeholder}
                                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#E8192B] focus:bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/20 text-sm outline-none transition-all"
                                />
                            </div>
                        ))}

                        {/* Date of birth */}
                        <div className="group">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                Date of Birth
                            </label>
                            <input
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#E8192B] focus:bg-white/[0.06] px-4 py-3 text-white/70 text-sm outline-none transition-all [color-scheme:dark]"
                            />
                        </div>

                        {/* PIN row */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Create PIN", name: "pin", show: showPin, setShow: setShowPin },
                                { label: "Confirm PIN", name: "confirmPin", show: showConfirmPin, setShow: setShowConfirmPin },
                            ].map(({ label, name, show, setShow }) => (
                                <div key={name} className="group">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 group-focus-within:text-[#E8192B] transition-colors">
                                        {label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            name={name}
                                            type={show ? "text" : "password"}
                                            maxLength={4}
                                            value={(formData as any)[name]}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••"
                                            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#E8192B] focus:bg-white/[0.06] px-4 py-3 pr-10 text-white placeholder:text-white/20 text-sm tracking-widest outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShow(!show)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                                        >
                                            {show ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer group mt-1">
                            <div className="relative mt-0.5">
                                <input
                                    name="terms"
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 border transition-all flex items-center justify-center ${formData.terms ? "bg-[#E8192B] border-[#E8192B]" : "bg-transparent border-white/20 group-hover:border-white/40"}`}>
                                    {formData.terms && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-wider">
                                I accept the <span className="text-[#E8192B] font-bold">Code of Honor</span> and Terms of Combat.
                            </p>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.terms}
                            className="group relative w-full py-4 mt-1 font-bold text-sm uppercase tracking-[0.28em] bg-[#E8192B] text-white overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(232,25,43,0.5)] disabled:opacity-40"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Ascend Now"}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-white/25">
                        Already a member?{" "}
                        <Link
                            href="/login"
                            className="text-[#E8192B] hover:text-white font-bold ml-1 transition-colors uppercase tracking-widest text-xs"
                        >
                            Login Here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
