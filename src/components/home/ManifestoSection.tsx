"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Cinematic statement section — no scroll-pin (kills performance & creates dead scroll).
 * Lines animate in staggered when the section enters the viewport.
 */
export function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const line1Ref   = useRef<HTMLDivElement>(null);
  const line2Ref   = useRef<HTMLDivElement>(null);
  const line3Ref   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      /* "THIS IS" */
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }
      );

      /* "NOT A GYM." — scale punch */
      tl.fromTo(
        line2Ref.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1,   y: 0,  duration: 0.9, ease: "power4.out" },
        "-=0.35"
      );

      /* "IT'S YOUR FORGE." */
      tl.fromTo(
        line3Ref.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
        "-=0.4"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#080808] flex flex-col items-center justify-center px-4 overflow-hidden py-16 md:py-24 min-h-[60vh]"
    >
      {/* Ambient red glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(232,25,43,0.07) 0%, transparent 65%)" }}
      />

      {/* Hairline frames */}
      <div className="absolute top-[10%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" />
      <div className="absolute bottom-[10%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" />

      {/* Side vertical bars */}
      <div className="absolute left-[6%] top-[18%] w-px h-[64%] bg-gradient-to-b from-transparent via-[#E8192B]/18 to-transparent" />
      <div className="absolute right-[6%] top-[18%] w-px h-[64%] bg-gradient-to-b from-transparent via-[#E8192B]/18 to-transparent" />

      {/* ── Text ── */}
      <div className="text-center select-none">
        {/* "THIS IS" */}
        <div ref={line1Ref} style={{ opacity: 0 }}>
          <p
            className="font-heading text-white/60 tracking-wider leading-none"
            style={{ fontSize: "clamp(2rem, 8vw, 6.5rem)" }}
          >
            THIS IS
          </p>
        </div>

        {/* "NOT A GYM." — dominates */}
        <div ref={line2Ref} style={{ opacity: 0 }}>
          <p
            className="font-heading leading-none"
            style={{
              fontSize: "clamp(4rem, 17vw, 14rem)",
              color: "#E8192B",
              textShadow: "0 0 120px rgba(232,25,43,0.55), 0 0 250px rgba(232,25,43,0.18)",
              letterSpacing: "-0.01em",
            }}
          >
            NOT A GYM.
          </p>
        </div>

        {/* "IT'S YOUR FORGE." */}
        <div ref={line3Ref} className="mt-4 md:mt-6" style={{ opacity: 0 }}>
          <p
            className="font-heading text-white/35 tracking-[0.25em]"
            style={{ fontSize: "clamp(1rem, 3.5vw, 2.8rem)" }}
          >
            IT'S YOUR FORGE.
          </p>
        </div>
      </div>
    </section>
  );
}
