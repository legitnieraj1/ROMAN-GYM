"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%", toggleActions: "play none none reverse" },
      });
      tl.fromTo(".cta-main",  { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power4.out" })
        .fromTo(".cta-sub",   { opacity: 0 },                       { opacity: 1, duration: 0.7 }, "-=0.5")
        .fromTo(".cta-btn",   { opacity: 0, y: 16 },                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .fromTo(".cta-phone", { opacity: 0 },                       { opacity: 1, duration: 0.5 }, "-=0.3");
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ minHeight: "70vh" }}>
      {/* Full gym photo — corridor shot for drama */}
      <Image
        src="/gym/corridor-2.jpg"
        alt="Train at Roman Fitness"
        fill
        sizes="100vw"
        className="object-cover object-center"
        style={{ opacity: 0.55 }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0A0A0A]/65" />
      {/* Red ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(232,25,43,0.14) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4 py-20 text-center">
        {/* Vertical accent */}
        <div className="w-px h-10 md:h-14 bg-gradient-to-b from-transparent to-[#E8192B]/60 mb-8" />

        <div className="cta-main opacity-0">
          <h2
            className="font-heading text-white leading-none"
            style={{ fontSize: "clamp(5rem, 20vw, 17rem)" }}
          >
            JOIN.
          </h2>
        </div>

        <p className="cta-sub opacity-0 text-white/28 text-[10px] md:text-xs tracking-[0.55em] uppercase mt-4 mb-8">
          Your transformation starts today
        </p>

        <Link
          href="/signup"
          className="cta-btn opacity-0 inline-flex items-center bg-[#E8192B] text-white font-bold uppercase tracking-[0.28em] text-xs px-10 md:px-14 py-4 md:py-5 hover:bg-[#E8192B]/90 transition-colors"
        >
          Start Training
        </Link>

        <a
          href="tel:8098834154"
          className="cta-phone opacity-0 mt-8 text-white/22 hover:text-white/50 text-[9px] tracking-[0.55em] uppercase transition-colors flex items-center gap-3"
        >
          <span className="w-5 h-px bg-current" />
          80988 34154
          <span className="w-5 h-px bg-current" />
        </a>

        <div className="w-px h-10 md:h-14 bg-gradient-to-b from-[#E8192B]/60 to-transparent mt-8" />
      </div>
    </section>
  );
}
