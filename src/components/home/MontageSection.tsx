"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const words = ["POWER", "DISCIPLINE", "LEGACY"];

export function MontageSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Single timeline for all words — fewer scroll listeners
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end: "center center",
          scrub: 0.8,
        },
      });

      wordsRef.current.forEach((word, index) => {
        if (!word) return;
        tl.fromTo(
          word,
          { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
          { opacity: 1, x: 0, duration: 1, ease: "power2.out" },
          index * 0.3
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      {/* Background — static gradient instead of parallax video for performance */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#071B2A]/40 to-[#0A0A0A]" />

      {/* Sticky word container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-4 md:gap-12">
        {words.map((word, index) => (
          <div
            key={word}
            ref={(el) => { if (el) wordsRef.current[index] = el; }}
            className="will-change-transform"
          >
            <h2
              className={`font-heading text-5xl md:text-8xl lg:text-[10rem] tracking-wider leading-none ${
                index === 1 ? "text-[#00AEEF] text-glow-strong" : "text-white/80"
              }`}
              style={{
                WebkitTextStroke: index !== 1 ? "1px rgba(0, 174, 239, 0.2)" : "none",
              }}
            >
              {word}
            </h2>
          </div>
        ))}

        <div className="absolute left-8 top-1/4 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-[#00AEEF]/20 to-transparent" />
        <div className="absolute right-8 top-1/4 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-[#00AEEF]/20 to-transparent" />
      </div>
    </section>
  );
}
