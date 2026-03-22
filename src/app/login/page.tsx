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
    const [formData, setFormData] = useState({
        mobile: "",
        pin: ""
    });

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

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
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
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-[#131314]">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/80 to-transparent" />
                <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-[#0059ff]/[0.04] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-[#00AEEF]/[0.04] rounded-full" />
            </div>

            {/* Login Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 shadow-2xl overflow-hidden border border-white/[0.06]"
            >
                {/* Left Side Hero */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-[#0e0e0f] relative overflow-hidden border-r border-white/[0.06]">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#0059ff]" />
                    <div className="relative z-10">
                        <Image
                            src="/logooo.png"
                            alt="Roman Fitness"
                            width={120}
                            height={120}
                            className="h-24 w-auto"
                        />
                    </div>
                    <div className="relative z-10 mt-auto">
                        <h1 className="font-bold text-5xl uppercase tracking-tighter text-white leading-none mb-4">
                            CLAIM YOUR <br />
                            <span className="text-[#00AEEF] italic">LEGACY</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-sm">
                            Access the most advanced athletic performance HUD ever forged. Precision tracking for modern warriors.
                        </p>
                    </div>
                </div>

                {/* Login Form Right */}
                <div className="bg-[#201f20] p-8 md:p-16 flex flex-col justify-center">
                    {/* Mobile Logo */}
                    <div className="md:hidden mb-12 flex justify-center">
                        <Image
                            src="/logooo.png"
                            alt="Roman Fitness"
                            width={80}
                            height={80}
                            className="h-16 w-auto"
                        />
                    </div>

                    <div className="mb-10">
                        <h2 className="font-bold text-3xl uppercase tracking-tight mb-2 text-white">Initialize Terminal</h2>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Identity Verification Required</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-red-900/30 border border-red-900/50 text-red-300 text-sm p-3 text-center">
                                {error}
                            </div>
                        )}

                        {/* Mobile Number */}
                        <div className="group relative">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-[#00AEEF] transition-colors">
                                Warrior ID / Mobile
                            </label>
                            <input
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                placeholder="ENTER YOUR CREDENTIALS"
                                className="w-full bg-[#0e0e0f] border-0 border-b-2 border-white/10 focus:border-[#00AEEF] focus:ring-0 px-0 py-3 text-white placeholder:text-gray-600 transition-all text-lg"
                            />
                        </div>

                        {/* PIN */}
                        <div className="group relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-[#00AEEF] transition-colors">
                                    Access Code
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    name="pin"
                                    type={showPin ? "text" : "password"}
                                    value={formData.pin}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••"
                                    className="w-full bg-[#0e0e0f] border-0 border-b-2 border-white/10 focus:border-[#00AEEF] focus:ring-0 px-0 py-3 text-white placeholder:text-gray-600 transition-all text-lg tracking-widest"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-sm"
                                >
                                    {showPin ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 font-black text-sm uppercase tracking-[0.3em] bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] text-[#00164f] shadow-[0_10px_30px_rgba(0,89,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Enter the Arena</>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-400">
                            New Warrior?{" "}
                            <Link
                                href="/signup"
                                className="font-bold text-[#00AEEF] hover:text-[#00daf3] underline underline-offset-8 decoration-[#00AEEF]/30 ml-2 transition-all"
                            >
                                Join Arena
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Corner Accent */}
            <div className="fixed bottom-8 left-8 hidden lg:block opacity-30">
                <div className="text-[10px] text-gray-600 uppercase tracking-[0.5em] flex flex-col gap-2">
                    <span>V.4.0.0 AR_TERMINAL</span>
                    <span className="text-[#0059ff]">STATUS: READY_FOR_DEPLOYMENT</span>
                </div>
            </div>
        </main>
    );
}
