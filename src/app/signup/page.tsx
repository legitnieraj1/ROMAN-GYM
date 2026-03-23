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
        name: "",
        dob: "",
        mobile: "",
        pin: "",
        confirmPin: "",
        terms: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.pin !== formData.confirmPin) {
            setError("PINs do not match");
            setIsLoading(false);
            return;
        }

        if (formData.pin.length !== 4) {
            setError("PIN must be exactly 4 digits");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    dob: formData.dob || undefined,
                    mobile: formData.mobile,
                    pin: formData.pin,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Signup failed");
            }

            router.refresh();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col md:flex-row bg-[#131314]">
            {/* Left Visual Sidebar */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#0e0e0f] relative overflow-hidden items-center justify-center p-20">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="/logoroman.png"
                        alt="Roman Fitness Logo"
                        width={160}
                        height={160}
                        className="absolute top-12 left-12 w-40 grayscale brightness-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-transparent to-transparent z-10" />
                    <div
                        className="w-full h-full bg-cover bg-center mix-blend-overlay"
                        style={{ backgroundImage: "url('/hero bg.png')" }}
                    />
                </div>
                <div className="relative z-20 max-w-xl">
                    <h1 className="font-black text-7xl lg:text-8xl text-[#00AEEF] leading-none tracking-tighter uppercase mb-6">
                        JOIN THE <span className="text-white block">LEGION</span>
                    </h1>
                    <p className="text-gray-400 text-xl font-light tracking-wide max-w-md">
                        Forge your physique in the fires of the digital colosseum. Excellence is not an act, but a habit.
                    </p>
                    <div className="mt-12 flex items-center gap-4">
                        <div className="h-1 w-24 bg-[#0059ff]" />
                        <span className="font-bold text-sm tracking-[0.3em] uppercase text-[#00AEEF]">Est. MMXXIV</span>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <motion.section
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-[#131314] relative"
            >
                <div className="w-full max-w-md space-y-10">
                    {/* Mobile Logo */}
                    <div className="md:hidden flex flex-col items-center mb-8">
                        <Image
                            src="/logoroman.png"
                            alt="Roman Fitness Logo"
                            width={80}
                            height={80}
                            className="h-20 w-auto mb-6"
                        />
                        <h2 className="font-black text-4xl text-[#00AEEF] text-center tracking-tighter uppercase">
                            JOIN THE LEGION
                        </h2>
                    </div>

                    <div className="space-y-2">
                        <h2 className="hidden md:block font-black text-4xl text-white tracking-tighter uppercase">
                            JOIN THE LEGION
                        </h2>
                        <p className="text-gray-400 text-base font-medium">
                            Start your journey to glory today.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-900/30 border border-red-900/50 text-red-300 text-sm p-3 text-center">
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-1 group">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold group-focus-within:text-[#00AEEF] transition-colors">
                                Full Name
                            </label>
                            <div className="relative flex items-center border-b-2 border-white/10 bg-[#0e0e0f] transition-all focus-within:border-[#0059ff] focus-within:shadow-[0_4px_12px_-4px_rgba(0,89,255,0.3)]">
                                <svg className="ml-4 w-5 h-5 text-gray-500 group-focus-within:text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your name"
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 py-4 px-4 font-medium"
                                />
                            </div>
                        </div>

                        {/* DOB */}
                        <div className="space-y-1 group">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold group-focus-within:text-[#00AEEF] transition-colors">
                                Warrior DOB
                            </label>
                            <div className="relative flex items-center border-b-2 border-white/10 bg-[#0e0e0f] transition-all focus-within:border-[#0059ff] focus-within:shadow-[0_4px_12px_-4px_rgba(0,89,255,0.3)]">
                                <svg className="ml-4 w-5 h-5 text-gray-500 group-focus-within:text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <input
                                    name="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none focus:ring-0 text-white py-4 px-4 font-medium [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1 group">
                            <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold group-focus-within:text-[#00AEEF] transition-colors">
                                Mobile Number
                            </label>
                            <div className="relative flex items-center border-b-2 border-white/10 bg-[#0e0e0f] transition-all focus-within:border-[#0059ff] focus-within:shadow-[0_4px_12px_-4px_rgba(0,89,255,0.3)]">
                                <svg className="ml-4 w-5 h-5 text-gray-500 group-focus-within:text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                <input
                                    name="mobile"
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 00000 00000"
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 py-4 px-4 font-medium"
                                />
                            </div>
                        </div>

                        {/* PIN Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1 group">
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold group-focus-within:text-[#00AEEF] transition-colors">
                                    Create PIN
                                </label>
                                <div className="relative flex items-center border-b-2 border-white/10 bg-[#0e0e0f] transition-all focus-within:border-[#0059ff] focus-within:shadow-[0_4px_12px_-4px_rgba(0,89,255,0.3)]">
                                    <svg className="ml-4 w-5 h-5 text-gray-500 group-focus-within:text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    <input
                                        name="pin"
                                        type="password"
                                        maxLength={4}
                                        value={formData.pin}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••"
                                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 py-4 px-4 font-medium tracking-widest"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 group">
                                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold group-focus-within:text-[#00AEEF] transition-colors">
                                    Confirm PIN
                                </label>
                                <div className="relative flex items-center border-b-2 border-white/10 bg-[#0e0e0f] transition-all focus-within:border-[#0059ff] focus-within:shadow-[0_4px_12px_-4px_rgba(0,89,255,0.3)]">
                                    <svg className="ml-4 w-5 h-5 text-gray-500 group-focus-within:text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <input
                                        name="confirmPin"
                                        type="password"
                                        maxLength={4}
                                        value={formData.confirmPin}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••"
                                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 py-4 px-4 font-medium tracking-widest"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 pt-2">
                            <input
                                name="terms"
                                type="checkbox"
                                checked={formData.terms}
                                onChange={handleChange}
                                className="mt-1 bg-[#0e0e0f] border-white/20 text-[#0059ff] focus:ring-[#0059ff] rounded-none"
                            />
                            <p className="text-[11px] text-gray-400 leading-tight uppercase tracking-wider">
                                I accept the <span className="text-[#00AEEF] font-bold">Code of Honor</span> and the Terms of Combat.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !formData.terms}
                            className="w-full bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] py-5 font-black text-[#00164f] tracking-[0.2em] uppercase transition-all active:scale-[0.98] shadow-lg shadow-[#0059ff]/20 disabled:opacity-50 hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                                "Ascend Now"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-4">
                        <p className="text-gray-400 text-sm font-medium">
                            Already a member?{" "}
                            <Link
                                href="/login"
                                className="text-[#00AEEF] font-black uppercase tracking-widest ml-2 hover:underline underline-offset-8 transition-all"
                            >
                                Login Here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Decorative */}
                <div className="absolute bottom-8 right-8 pointer-events-none opacity-[0.04]">
                    <span className="font-black text-[120px] leading-none text-white">SPQR</span>
                </div>
            </motion.section>
        </main>
    );
}
