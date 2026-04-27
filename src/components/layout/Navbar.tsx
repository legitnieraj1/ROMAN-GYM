"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "HOME",       href: "/#home" },
  { name: "FEATURES",   href: "/#features" },
  { name: "TRAINERS",   href: "/#trainers" },
  { name: "MEMBERSHIP", href: "/#plans" },
  { name: "RANKINGS",   href: "/dashboard/ranking" },
  { name: "DIET AI",    href: "/diet" },
  { name: "CONTACT",    href: "/#contact" },
];

export function Navbar({ session = null }: { session?: any }) {
  const [isScrolled,  setIsScrolled]  = useState(false);
  const [isMenuOpen,  setIsMenuOpen]  = useState(false);
  const user = session?.userId ? { id: session.userId } : null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    /* Toggle a class on <html> — safer than inline style which fights Lenis */
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
          "fixed top-0 left-0 right-0 z-[900] transition-all duration-500",
          isScrolled && !isMenuOpen
            ? "bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.04] h-16 md:h-20"
            : "bg-transparent h-20 md:h-24"
        )}
      >
        {/* Red accent line at very bottom of navbar when scrolled */}
        <div
          className={cn(
            "absolute bottom-0 left-0 w-full h-[1px] transition-opacity duration-500",
            isScrolled && !isMenuOpen ? "opacity-100" : "opacity-0"
          )}
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(232,25,43,0.5) 40%, rgba(232,25,43,0.5) 60%, transparent 100%)" }}
        />

        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="z-50 h-full py-2 md:py-3 flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src="/logoroman.png"
              alt="Roman Fitness"
              className="h-full w-auto object-contain transition-all duration-300"
            />
          </Link>

          {/* Hamburger — relative so z-[900] creates its own stacking layer above the overlay */}
          <button
            className="relative z-[900] w-10 h-10 flex flex-col items-center justify-center gap-[6px] group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block w-7 h-[2px] transition-all duration-300 origin-center",
                isMenuOpen ? "bg-[#E8192B] rotate-45 translate-y-[8px]" : "bg-white"
              )}
            />
            <span
              className={cn(
                "block w-7 h-[2px] transition-all duration-300",
                isMenuOpen ? "opacity-0 scale-0" : "bg-white"
              )}
            />
            <span
              className={cn(
                "block w-7 h-[2px] transition-all duration-300 origin-center",
                isMenuOpen ? "bg-[#E8192B] -rotate-45 -translate-y-[8px]" : "bg-white"
              )}
            />
          </button>
        </div>
      </nav>

      {/* Fullscreen menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[800] bg-[#0A0A0A] flex flex-col items-center justify-center"
          >
            {/* Subtle red radial in background */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(232,25,43,0.04) 0%, transparent 65%)" }}
            />

            {/* Left vertical red bar */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-8 top-[15%] w-[2px] h-[70%] bg-gradient-to-b from-transparent via-[#E8192B]/30 to-transparent origin-top"
            />

            <nav className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.055, duration: 0.4, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center gap-4 text-2xl md:text-4xl font-heading text-white/60 hover:text-white transition-colors duration-300 tracking-[0.2em]"
                  >
                    {/* Red dot indicator on hover */}
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8192B] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Auth */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-4"
              >
                {user ? (
                  <div className="flex flex-col items-center gap-4">
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button className="bg-[#E8192B] hover:bg-[#E8192B]/90 text-white font-black uppercase tracking-[0.2em] text-sm px-10 py-3 neon-pulse transition-all duration-300 hover:scale-105">
                        ENTER THE ARENA
                      </Button>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="text-white/25 hover:text-white/55 transition-colors text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-[#E8192B] hover:bg-[#E8192B]/90 text-white font-bold uppercase tracking-[0.2em] text-sm px-10 py-3 neon-pulse transition-all duration-300 hover:scale-105">
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
