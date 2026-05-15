"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "5 AM",   label: "Opens Daily" },
  { value: "3",      label: "Expert Trainers" },
  { value: "₹0",     label: "Admission Fee" },
  { value: "120",    label: "Day Programs" },
];

export function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".manifesto-stat",
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, stagger: 0.09, duration: 0.65, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );
      gsap.fromTo(
        ".manifesto-text",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: ".manifesto-text", start: "top 80%", toggleActions: "play none none reverse" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#FFFFFF]">
      {/* Stats strip */}
      <div className="border-y border-[#0A0A0A]/[0.07] py-8 md:py-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-[#0A0A0A]/[0.07]">
            {stats.map((s, i) => (
              <div key={s.label} className="manifesto-stat opacity-0 text-center md:px-8">
                <div
                  className="font-heading text-[#E8192B]"
                  style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
                >
                  {s.value}
                </div>
                <div className="text-[#0A0A0A]/45 text-[10px] tracking-[0.28em] uppercase mt-1.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manifesto statement */}
      <div className="manifesto-text opacity-0 py-14 md:py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <p
            className="font-heading text-[#0A0A0A]/40 tracking-wide leading-none"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
          >
            THIS IS
          </p>
          <p
            className="font-heading leading-[0.92]"
            style={{
              fontSize: "clamp(4rem, 15vw, 12rem)",
              color: "#E8192B",
              letterSpacing: "-0.01em",
            }}
          >
            NOT A GYM.
          </p>
          <p
            className="font-heading text-[#0A0A0A]/35 tracking-[0.18em] mt-3 md:mt-4"
            style={{ fontSize: "clamp(1.2rem, 3vw, 2.5rem)" }}
          >
            IT&apos;S YOUR FORGE.
          </p>
        </div>
      </div>
    </section>
  );
}
