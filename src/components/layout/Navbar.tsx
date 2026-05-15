"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Features",   href: "/#features" },
  { name: "Trainers",   href: "/#trainers" },
  { name: "Membership", href: "/#plans" },
  { name: "Rankings",   href: "/dashboard/ranking" },
  { name: "Diet AI",    href: "/diet" },
  { name: "Contact",    href: "/#contact" },
];

export function Navbar({ session = null }: { session?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = session?.userId ? { id: session.userId } : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", isMenuOpen);
    return () => document.documentElement.classList.remove("menu-open");
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[900] transition-all duration-400",
          isScrolled && !isMenuOpen
            ? "bg-[#F5EFE8]/94 backdrop-blur-sm border-b border-[#0A0A0A]/[0.07]"
            : "bg-transparent"
        )}
        style={{ height: "64px" }}
      >
        <div className="h-full flex items-center justify-between px-6 md:px-10 lg:px-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 z-50" onClick={() => setIsMenuOpen(false)}>
            <img src="/logoroman.png" alt="Roman Fitness" className="h-9 w-auto object-contain" />
            <span className="font-heading text-lg tracking-[0.18em] text-[#0A0A0A] hidden sm:block">
              ROMAN <span className="text-[#E8192B]">FITNESS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[11px] tracking-[0.14em] uppercase text-[#0A0A0A]/55 hover:text-[#0A0A0A] transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[11px] tracking-[0.14em] uppercase text-[#0A0A0A]/55 hover:text-[#0A0A0A] transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase text-[#0A0A0A]/35 hover:text-[#E8192B] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                className="bg-[#0A0A0A] text-white text-[11px] tracking-[0.18em] uppercase font-bold px-6 py-2.5 hover:bg-[#E8192B] transition-colors duration-300"
              >
                Join Now
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative z-[900] w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen
              ? <X className="w-5 h-5 text-white" />
              : <Menu className="w-5 h-5 text-[#0A0A0A]" />
            }
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[800] bg-[#0A0A0A] flex flex-col items-center justify-center gap-7"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(232,25,43,0.04) 0%, transparent 70%)" }}
            />
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-heading text-3xl tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                >
                  {link.name.toUpperCase()}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {user ? (
                <div className="flex flex-col items-center gap-4 mt-4">
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <span className="bg-[#E8192B] text-white font-bold uppercase tracking-[0.2em] text-sm px-10 py-3 block">
                      Dashboard
                    </span>
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-white/25 text-xs uppercase tracking-wider flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <span className="bg-[#E8192B] text-white font-bold uppercase tracking-[0.2em] text-sm px-10 py-3 mt-4 block">
                    Join Now
                  </span>
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
