"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-heading",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".cta-button",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".cta-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#071B2A]/15 to-transparent" />
        {/* Subtle glow — no blur for performance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00AEEF]/[0.03] rounded-full" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10 text-center">
        <div className="cta-line w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00AEEF] to-transparent mx-auto mb-8 origin-center" />

        <h2 className="cta-heading font-heading text-5xl md:text-7xl lg:text-8xl tracking-wider leading-none mb-6">
          <span className="text-white">JOIN THE</span>
          <br />
          <span className="text-glow-strong text-[#00AEEF]">EMPIRE</span>
        </h2>

        <p className="text-white/40 text-lg md:text-xl tracking-wider max-w-xl mx-auto mb-8">
          Your transformation starts today. Enter the Roman Empire of Fitness.
        </p>

        <div className="cta-button">
          <Link
            href="/signup"
            className="inline-block px-12 py-5 bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white font-bold text-lg uppercase tracking-[0.2em] rounded transition-all duration-300 neon-pulse hover:scale-105"
          >
            Start Training
          </Link>
        </div>

        <div className="cta-line w-16 h-[2px] bg-gradient-to-r from-transparent via-[#00AEEF] to-transparent mx-auto mt-8 origin-center" />
      </div>
    </section>
  );
}
