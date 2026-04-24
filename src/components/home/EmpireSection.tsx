"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function EmpireSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        ".empire-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power3.out" }
      )
        .fromTo(
          ".empire-label",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.5"
        )
        .fromTo(
          ".empire-word-1",
          { opacity: 0, x: -60, skewX: -3 },
          { opacity: 1, x: 0, skewX: 0, duration: 0.9, ease: "power4.out" },
          "-=0.3"
        )
        .fromTo(
          ".empire-word-2",
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out" },
          "-=0.65"
        )
        .fromTo(
          ".empire-word-3",
          { opacity: 0, x: 60, skewX: 3 },
          { opacity: 1, x: 0, skewX: 0, duration: 0.9, ease: "power4.out" },
          "-=0.7"
        )
        .fromTo(
          ".empire-sub",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.5"
        )
        .fromTo(
          ".empire-stats",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
          "-=0.4"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        {/* Subtle red radial glow at center */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(232,25,43,0.06) 0%, transparent 65%)" }}
        />
        {/* Diagonal accent lines */}
        <div className="absolute top-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8192B]/12 to-transparent" />
        <div className="absolute top-2/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8192B]/08 to-transparent" />
        {/* Side vertical bars */}
        <div className="absolute left-[8%] top-[20%] w-[1px] h-[60%] bg-gradient-to-b from-transparent via-[#E8192B]/15 to-transparent" />
        <div className="absolute right-[8%] top-[20%] w-[1px] h-[60%] bg-gradient-to-b from-transparent via-[#E8192B]/15 to-transparent" />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div className="empire-label flex items-center justify-center gap-4 mb-8">
          <div className="empire-line w-12 h-[1px] bg-[#E8192B] origin-left" />
          <span className="text-[#E8192B] text-[10px] tracking-[0.5em] uppercase font-semibold">
            Jothipuram, Coimbatore
          </span>
          <div className="empire-line w-12 h-[1px] bg-[#E8192B] origin-right" />
        </div>

        {/* Headline — staggered words */}
        <div className="overflow-hidden">
          <h2
            className="empire-word-1 font-heading text-white leading-none tracking-wider"
            style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
          >
            ENTER THE
          </h2>
        </div>
        <div className="overflow-hidden -mt-1 md:-mt-2">
          <h2
            className="empire-word-2 font-heading leading-none tracking-wider"
            style={{
              fontSize: "clamp(3rem, 10vw, 8.5rem)",
              color: "#E8192B",
              textShadow: "0 0 60px rgba(232,25,43,0.3), 0 0 120px rgba(232,25,43,0.1)",
            }}
          >
            ROMAN EMPIRE
          </h2>
        </div>
        <div className="overflow-hidden -mt-1 md:-mt-2">
          <h2
            className="empire-word-3 font-heading text-white/70 leading-none tracking-wider"
            style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
          >
            OF FITNESS
          </h2>
        </div>

        {/* Sub copy */}
        <p className="empire-sub mt-8 md:mt-10 text-white/35 text-sm md:text-base tracking-[0.3em] uppercase max-w-2xl mx-auto">
          Where legends are forged and limits are shattered
        </p>

        {/* Stats row */}
        <div className="mt-12 md:mt-16 flex justify-center gap-8 md:gap-16">
          {[
            { value: "5 AM", label: "Doors Open" },
            { value: "NO", label: "Admission Fee" },
            { value: "2026", label: "Est." },
          ].map((s) => (
            <div key={s.label} className="empire-stats flex flex-col items-center gap-1">
              <span
                className="font-heading text-2xl md:text-4xl text-[#E8192B]"
                style={{ textShadow: "0 0 20px rgba(232,25,43,0.3)" }}
              >
                {s.value}
              </span>
              <span className="text-white/30 text-[9px] tracking-[0.35em] uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
