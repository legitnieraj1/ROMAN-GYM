"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "", dob: "", mobile: "", pin: "", confirmPin: "", terms: false,
    });

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

    /* shared input wrapper */
    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-1 group">
            <label className="block text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold group-focus-within:text-[#E8192B] transition-colors">
                {label}
            </label>
            {children}
        </div>
    );

    const inputCls = "w-full bg-transparent border-b-2 border-white/10 focus:border-[#E8192B] focus:ring-0 outline-none text-white placeholder:text-white/20 py-3 px-0 font-medium transition-colors";

    return (
        <main className="min-h-screen flex flex-col md:flex-row bg-[#080808]">
            {/* Left visual sidebar */}
            <div className="hidden md:flex md:w-5/12 bg-[#0a0a0a] relative overflow-hidden items-end justify-start p-14 border-r border-white/[0.05]">
                {/* Ambient red glow */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 20% 80%, rgba(232,25,43,0.1) 0%, transparent 60%)" }} />

                {/* Logo top-left */}
                <Image src="/logoroman.png" alt="Roman Fitness" width={100} height={100}
                    className="absolute top-12 left-12 w-16 h-auto opacity-90" />

                {/* Ghost SPQR watermark */}
                <div className="absolute bottom-0 right-0 opacity-[0.04] pointer-events-none select-none">
                    <span className="font-heading text-[160px] leading-none text-white">SPQR</span>
                </div>

                {/* Copy */}
                <div className="relative z-10">
                    <h1 className="font-heading text-6xl lg:text-7xl text-white leading-none tracking-wider uppercase mb-4">
                        JOIN THE<br />
                        <span className="text-[#E8192B]" style={{ textShadow: "0 0 80px rgba(232,25,43,0.5)" }}>LEGION</span>
                    </h1>
                    <p className="text-white/30 text-sm leading-relaxed max-w-xs">
                        Forge your physique. Excellence is not an act — it&apos;s a habit.
                    </p>
                    <div className="mt-8 flex items-center gap-3">
                        <div className="h-px w-16 bg-[#E8192B]" />
                        <span className="text-[#E8192B] text-[10px] tracking-[0.4em] uppercase">Est. MMXXVI</span>
                    </div>
                </div>
            </div>

            {/* Form section */}
            <motion.section
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 bg-[#080808] relative"
            >
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="md:hidden flex flex-col items-center mb-4">
                        <Image src="/logoroman.png" alt="Roman Fitness" width={80} height={80} className="h-14 w-auto mb-5" />
                    </div>

                    <div>
                        <p className="text-[#E8192B] text-[9px] tracking-[0.55em] uppercase font-medium mb-2">New Recruit</p>
                        <h2 className="font-heading text-4xl text-white uppercase tracking-wider">Join the Legion</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-[#E8192B]/10 border border-[#E8192B]/30 text-[#E8192B] text-sm p-3 text-center">
                                {error}
                            </div>
                        )}

                        <Field label="Full Name">
                            <input name="name" type="text" value={formData.name} onChange={handleChange} required
                                placeholder="Enter your name" className={inputCls} />
                        </Field>

                        <Field label="Date of Birth">
                            <input name="dob" type="date" value={formData.dob} onChange={handleChange}
                                className={`${inputCls} [color-scheme:dark]`} />
                        </Field>

                        <Field label="Mobile Number">
                            <input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} required
                                placeholder="+91 00000 00000" className={inputCls} />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Create PIN">
                                <input name="pin" type="password" maxLength={4} value={formData.pin} onChange={handleChange} required
                                    placeholder="••••" className={`${inputCls} tracking-widest`} />
                            </Field>
                            <Field label="Confirm PIN">
                                <input name="confirmPin" type="password" maxLength={4} value={formData.confirmPin} onChange={handleChange} required
                                    placeholder="••••" className={`${inputCls} tracking-widest`} />
                            </Field>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 pt-2">
                            <input name="terms" type="checkbox" checked={formData.terms} onChange={handleChange}
                                className="mt-1 bg-transparent border-white/20 text-[#E8192B] focus:ring-[#E8192B] rounded-none accent-[#E8192B]" />
                            <p className="text-[11px] text-white/30 leading-tight uppercase tracking-wider">
                                I accept the <span className="text-[#E8192B] font-bold">Code of Honor</span> and Terms of Combat.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.terms}
                            className="group relative w-full bg-[#E8192B] py-4 font-bold text-white tracking-[0.25em] uppercase transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(232,25,43,0.5)] active:scale-[0.98] disabled:opacity-40 overflow-hidden"
                        >
                            <span className="relative z-10">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Ascend Now"}
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-white/25 text-sm">
                            Already a member?{" "}
                            <Link href="/login" className="text-[#E8192B] hover:text-white font-bold ml-1 transition-colors uppercase tracking-widest text-xs">
                                Login Here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.section>
        </main>
    );
}
