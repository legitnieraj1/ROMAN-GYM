"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    CreditCard,
    Utensils,
    Bell,
    Dumbbell,
    Settings,
    LogOut,
    Menu,
    X,
    UserPlus,
    ClipboardList,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Diet AI", href: "/admin/diet-ai", icon: Utensils },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Trainers", href: "/admin/trainers", icon: Dumbbell },
    { name: "Members Log", href: "/admin/members-log", icon: UserPlus },
    { name: "Today's Log", href: "/admin/attendance", icon: ClipboardList },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#131314] rounded-none text-white border border-[#0059ff]/10 hover:bg-[#0059ff]/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 z-40 h-screen w-64 bg-[#131314] border-r-[2px] border-[#0059ff]/10 transition-transform duration-300 ease-in-out overflow-y-auto shadow-[20px_0_40px_rgba(0,89,255,0.04)]",
                    "md:left-0 md:translate-x-0",
                    "right-0 border-l border-[#0059ff]/10 md:border-l-0",
                    isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                )}
            >
                <div className="p-6 border-b border-[#0059ff]/10">
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <Dumbbell className="w-8 h-8 text-[#0059ff]" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold italic tracking-widest text-[#b6c4ff]">
                                ARENA
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-[#bec8d3] opacity-60 font-bold">
                                High-Performance Terminal
                            </span>
                        </div>
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 group uppercase tracking-wider text-sm font-bold",
                                    isActive
                                        ? "text-[#0059ff] border-l-4 border-[#0059ff] bg-gradient-to-r from-[#0059ff]/10 to-transparent"
                                        : "text-[#bec8d3] opacity-60 hover:text-[#b6c4ff] hover:opacity-100"
                                )}
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={20} className={cn(isActive && "text-[#0059ff]")} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 border-t border-[#0059ff]/10 bg-[#131314]">
                    <div className="px-4 py-3 border-b border-[#0059ff]/10">
                        <div className="flex items-center gap-3 px-4">
                            <Shield size={18} className="text-[#0059ff]" />
                            <div className="flex flex-col">
                                <span className="text-xs uppercase tracking-wider font-bold text-[#bec8d3] opacity-60">
                                    Arena Administrator
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-none uppercase tracking-wider text-sm font-bold text-[#bec8d3] opacity-60 hover:text-[#ffb4ab] hover:opacity-100 hover:bg-[#ffb4ab]/10 transition-colors">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
