"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, CalendarCheck, CreditCard, Utensils,
    Bell, Dumbbell, Settings, LogOut, Menu, X, UserPlus, ClipboardList, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const sidebarLinks = [
    { name: "Dashboard",    href: "/admin/dashboard",   icon: LayoutDashboard },
    { name: "Members",      href: "/admin/members",      icon: Users },
    { name: "Payments",     href: "/admin/payments",     icon: CreditCard },
    { name: "Diet AI",      href: "/admin/diet-ai",      icon: Utensils },
    { name: "Trainers",     href: "/admin/trainers",     icon: Dumbbell },
    { name: "Members Log",  href: "/admin/members-log",  icon: UserPlus },
    { name: "Today's Log",  href: "/admin/attendance",   icon: ClipboardList },
    { name: "Settings",     href: "/admin/settings",     icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#080808] text-white border border-white/[0.06] hover:border-[#E8192B]/40 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 z-40 h-screen w-64 bg-[#080808] border-r border-white/[0.06] transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col",
                "md:left-0 md:translate-x-0",
                "right-0",
                isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
            )}>
                {/* Top red accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8192B]/60 to-transparent" />

                {/* Brand */}
                <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
                    <Image src="/logoroman.png" alt="Roman Fitness" width={36} height={36} className="h-9 w-auto" />
                    <div>
                        <p className="font-heading text-lg tracking-widest text-white leading-none">ROMAN</p>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/30 font-medium">Command</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 mt-2">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 transition-all duration-200 uppercase tracking-wider text-xs font-bold relative",
                                    isActive
                                        ? "text-white bg-[#E8192B]/10 border-l-2 border-[#E8192B]"
                                        : "text-white/35 hover:text-white/70 hover:bg-white/[0.03] border-l-2 border-transparent"
                                )}
                            >
                                <Icon size={17} className={cn(isActive ? "text-[#E8192B]" : "")} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/[0.06] p-4">
                    <div className="flex items-center gap-2 px-2 mb-3">
                        <Shield size={14} className="text-[#E8192B]" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/25">Administrator</span>
                    </div>
                    <button className="flex items-center gap-3 px-4 py-3 w-full uppercase tracking-wider text-xs font-bold text-white/25 hover:text-[#E8192B] hover:bg-[#E8192B]/05 transition-colors">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
