"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "HOME", href: "/#home" },
    { name: "FEATURES", href: "/#features" },
    { name: "TRAINERS", href: "/#trainers" },
    { name: "MEMBERSHIP", href: "/#plans" },
    { name: "CONTACT", href: "/#contact" },
];

export function Navbar({ session = null }: { session?: any }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = session?.userId ? { id: session.userId } : null;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    }, [isMenuOpen]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.reload();
    };

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                    isScrolled && !isMenuOpen
                        ? "bg-[#0A0A0A]/95 h-16 md:h-20"
                        : "bg-transparent h-20 md:h-24"
                )}
            >
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="z-50 h-full py-2 md:py-3 flex items-center" onClick={() => setIsMenuOpen(false)}>
                        <img
                            src="/logooo.png"
                            alt="Roman Fitness"
                            className="h-full w-auto object-contain transition-all duration-300"
                        />
                    </Link>

                    {/* Hamburger Menu Button */}
                    <button
                        className="z-50 w-10 h-10 flex flex-col items-center justify-center gap-[6px] group"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={cn(
                            "block w-7 h-[2px] bg-white transition-all duration-300 origin-center",
                            isMenuOpen && "rotate-45 translate-y-[8px]"
                        )} />
                        <span className={cn(
                            "block w-7 h-[2px] bg-white transition-all duration-300",
                            isMenuOpen && "opacity-0 scale-0"
                        )} />
                        <span className={cn(
                            "block w-7 h-[2px] bg-white transition-all duration-300 origin-center",
                            isMenuOpen && "-rotate-45 -translate-y-[8px]"
                        )} />
                    </button>
                </div>
            </nav>

            {/* Fullscreen Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center"
                    >
                        {/* Subtle background glow */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00AEEF]/[0.02] rounded-full" />
                        </div>

                        <nav className="relative z-10 flex flex-col items-center gap-8 md:gap-10">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-2xl md:text-4xl font-heading text-white/80 hover:text-white transition-colors duration-300 tracking-[0.2em]"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Auth section */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4"
                            >
                                {user ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="bg-gradient-to-r from-[#00daf3] to-[#0059ff] hover:opacity-90 text-white font-black uppercase tracking-[0.2em] text-sm px-10 py-3 neon-pulse">
                                                ENTER THE ARENA
                                            </Button>
                                        </Link>
                                        <button
                                            onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                            className="text-white/30 hover:text-white/60 transition-colors text-sm uppercase tracking-wider flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white font-bold uppercase tracking-[0.2em] text-sm px-10 py-3 neon-pulse">
                                            JOIN NOW
                                        </Button>
                                    </Link>
                                )}
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
