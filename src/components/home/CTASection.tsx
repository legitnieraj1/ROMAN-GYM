"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const magnetRef  = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(".cta-line-v", { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power3.out" })
        .fromTo(".cta-main",   { opacity: 0, y: 70, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out" }, "-=0.5")
        .fromTo(".cta-sub",    { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.6")
        .fromTo(".cta-btn",    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }, "-=0.5")
        .fromTo(".cta-phone",  { opacity: 0 },        { opacity: 1, duration: 0.5 }, "-=0.3");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ── Magnetic button ── */
  const handleMagnetMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = e.currentTarget;
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left  - rect.width  / 2) * 0.38;
    const y = (e.clientY - rect.top   - rect.height / 2) * 0.38;
    gsap.to(magnetRef.current, { x, y, duration: 0.35, ease: "power2.out" });
  };
  const handleMagnetLeave = () => {
    gsap.to(magnetRef.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 overflow-hidden bg-[#080808]"
    >
      {/* Background gym image */}
      <Image
        src="/gym/motivation.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        style={{ opacity: 0.12 }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/40 to-[#080808]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/60 via-transparent to-[#080808]/60" />

      {/* Ambient red glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 58%, rgba(232,25,43,0.12) 0%, transparent 60%)" }}
      />

      {/* Hairlines */}
      <div className="absolute top-[18%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-[18%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Top vertical accent */}
        <div className="cta-line-v w-px h-10 md:h-14 bg-gradient-to-b from-transparent to-[#E8192B]/70 mb-6 md:mb-8 origin-top" />

        {/* ── The main statement ── */}
        <div className="cta-main overflow-hidden">
          <h2
            className="font-heading text-white leading-none"
            style={{ fontSize: "clamp(5rem, 20vw, 17rem)" }}
          >
            JOIN.
          </h2>
        </div>

        {/* Sub copy */}
        <p className="cta-sub text-white/25 text-[10px] md:text-xs tracking-[0.55em] uppercase mt-4 mb-7 md:mb-9">
          Your transformation starts today
        </p>

        {/* Magnetic primary button */}
        <div
          className="cta-btn inline-block p-8 -m-8"
          onMouseMove={handleMagnetMove}
          onMouseLeave={handleMagnetLeave}
        >
          <Link
            href="/signup"
            ref={magnetRef}
            data-cursor
            className="group relative inline-flex items-center gap-4 bg-[#E8192B] px-10 md:px-14 py-4 md:py-5 text-white font-bold uppercase tracking-[0.28em] text-sm overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(232,25,43,0.55)] active:scale-[0.98]"
          >
            <span className="relative z-10">Start Training</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
          </Link>
        </div>

        {/* Phone number */}
        <a
          href="tel:8098834154"
          className="cta-phone mt-9 text-white/20 hover:text-white/50 text-[9px] tracking-[0.55em] uppercase transition-colors duration-300 flex items-center gap-3"
        >
          <div className="w-5 h-px bg-current" />
          80988 34154
          <div className="w-5 h-px bg-current" />
        </a>

        {/* Bottom vertical accent */}
        <div className="cta-line-v w-px h-10 md:h-14 bg-gradient-to-b from-[#E8192B]/70 to-transparent mt-6 md:mt-8 origin-bottom" />
      </div>
    </section>
  );
}
