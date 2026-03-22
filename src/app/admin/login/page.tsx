"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Lock, Mail, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#131314] flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/auth-bg.webp')] opacity-10 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/90 to-[#131314]/80" />

            {/* Blue Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0059ff] rounded-full blur-[120px] opacity-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-8"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-[#0059ff]/10 rounded-none mb-4 border border-[#0059ff]/20">
                        <Dumbbell className="w-10 h-10 text-[#b6c4ff]" />
                    </div>
                    <h1 className="text-3xl font-bold italic text-[#b6c4ff] tracking-wider mb-1">
                        ARENA
                    </h1>
                    <p className="text-sm uppercase tracking-widest font-bold text-[#bec8d3] opacity-60">
                        Command
                    </p>
                    <p className="text-[#bec8d3] opacity-60 text-sm mt-2">Restricted Access Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-[#131314]/80 backdrop-blur-md p-8 rounded-none border border-[#0059ff]/10 shadow-2xl">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 rounded-none text-[#ffb4ab] text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-[#bec8d3]">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bec8d3] opacity-60" />
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10 bg-black/50 border-[#0059ff]/10 text-white rounded-none focus:border-[#0059ff] focus:ring-[#0059ff]/20 h-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold uppercase tracking-wider text-[#bec8d3]">Password</label>
                            <a href="#" className="text-xs text-[#b6c4ff] hover:underline">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bec8d3] opacity-60" />
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10 bg-black/50 border-[#0059ff]/10 text-white rounded-none focus:border-[#0059ff] focus:ring-[#0059ff]/20 h-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-[#b6c4ff] to-[#0059ff] hover:from-[#b6c4ff]/90 hover:to-[#0059ff]/90 text-white font-bold uppercase tracking-wider rounded-none shadow-[0_0_20px_-5px_#0059ff]"
                    >
                        {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
                    </Button>
                </form>

                <p className="text-center mt-8 text-[#bec8d3] opacity-60 text-xs uppercase tracking-wider">
                    Protected by reCAPTCHA and Subject to the Roman Fitness Identity.
                </p>
            </motion.div>
        </div>
    );
}
