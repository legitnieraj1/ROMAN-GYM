"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const words = ["POWER", "DISCIPLINE", "LEGACY"];

export function MontageSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef   = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          end:   "center center",
          scrub: 0.9,
        },
      });

      wordsRef.current.forEach((word, index) => {
        if (!word) return;
        tl.fromTo(
          word,
          { opacity: 0, x: index % 2 === 0 ? -80 : 80 },
          { opacity: 1, x: 0, duration: 1, ease: "power2.out" },
          index * 0.3
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      {/* Background gradient — red tint now */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#140202]/50 to-[#0A0A0A]" />

      <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-4 md:gap-10">
        {words.map((word, index) => (
          <div
            key={word}
            ref={(el) => { if (el) wordsRef.current[index] = el; }}
            className="will-change-transform"
          >
            <h2
              className={`font-heading leading-none tracking-wider ${
                index === 1 ? "text-[#E8192B]" : "text-white/75"
              }`}
              style={{
                fontSize: "clamp(3.5rem, 10vw, 10rem)",
                textShadow: index === 1 ? "0 0 80px rgba(232,25,43,0.35), 0 0 160px rgba(232,25,43,0.12)" : "none",
                WebkitTextStroke: index !== 1 ? "1px rgba(232, 25, 43, 0.18)" : "none",
              }}
            >
              {word}
            </h2>
          </div>
        ))}

        {/* Side vertical accent bars */}
        <div className="absolute left-8 top-1/4 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-[#E8192B]/20 to-transparent" />
        <div className="absolute right-8 top-1/4 w-[1px] h-1/2 bg-gradient-to-b from-transparent via-[#E8192B]/20 to-transparent" />
      </div>
    </section>
  );
}
