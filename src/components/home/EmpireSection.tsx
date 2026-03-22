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
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        ".empire-line",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "power2.out" }
      )
      .fromTo(
        ".empire-heading",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo(
        ".empire-sub",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#071B2A]/20 to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00AEEF]/20 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00AEEF]/15 to-transparent" />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <div className="empire-line w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00AEEF] to-transparent mx-auto mb-8 origin-center" />
        <h2 className="empire-heading font-heading text-5xl md:text-7xl lg:text-8xl tracking-wider leading-none will-change-transform">
          <span className="text-white">ENTER THE</span>
          <br />
          <span className="text-glow-strong text-[#00AEEF]">ROMAN EMPIRE</span>
          <br />
          <span className="text-white/80">OF FITNESS</span>
        </h2>
        <p className="empire-sub mt-8 text-lg md:text-xl text-white/40 tracking-[0.2em] uppercase max-w-2xl mx-auto">
          Where legends are forged and limits are shattered
        </p>
      </div>
    </section>
  );
}
