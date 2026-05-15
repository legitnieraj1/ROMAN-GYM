"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { title: "Elite Equipment",      description: "State-of-the-art machines and free weights from premium brands engineered for maximum performance.", number: "01" },
  { title: "Strength Training",    description: "Dedicated zones for powerlifting, bodybuilding, and functional strength development.", number: "02" },
  { title: "Personal Coaching",    description: "Expert certified trainers building personalised programs around your body and your goals.", number: "03" },
  { title: "Body Transformation",  description: "Proven 60 and 120-day programs with nutrition guidance and weekly progress benchmarks.", number: "04" },
  { title: "Cardio Zone",          description: "Modern cardio theatre with treadmills, bikes, and cross-trainers for sustained endurance.", number: "05" },
  { title: "Functional Training",  description: "Dynamic HIIT, circuit, and athletic-performance zone designed for real-world results.", number: "06" },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowsRef    = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feat-heading",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none reverse" } }
      );
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(row,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 90%", toggleActions: "play none none reverse" } }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="bg-[#F5EFE8] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        <div className="feat-heading grid md:grid-cols-2 gap-8 md:gap-12 items-end mb-10 md:mb-16">
          <div>
            <p className="text-[#E8192B] text-[9px] tracking-[0.55em] uppercase font-medium mb-3">
              What We Offer
            </p>
            <h2
              className="font-heading text-[#0A0A0A] leading-none tracking-wide"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6.5rem)" }}
            >
              GYM{" "}
              <span className="text-[#E8192B]">FEATURES</span>
            </h2>
          </div>
          {/* Accent image */}
          <div className="hidden md:block relative h-40 overflow-hidden">
            <Image
              src="/gym/dumbbell-area.jpg"
              alt="Gym equipment"
              fill
              sizes="600px"
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#0A0A0A]/[0.07]" />

        {/* Feature rows */}
        {features.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => { if (el) rowsRef.current[i] = el; }}
            className="feature-row group border-b border-[#0A0A0A]/[0.07] relative overflow-hidden"
          >
            <div className="feature-row-line absolute bottom-0 left-0 h-px bg-[#E8192B]/50" />
            <div className="flex items-center gap-6 md:gap-10 py-6 md:py-9 px-0 md:px-2">
              <span
                className="font-heading text-4xl md:text-7xl text-[#0A0A0A]/[0.055] group-hover:text-[#E8192B]/[0.14] transition-colors duration-400 flex-shrink-0 select-none leading-none w-12 md:w-16"
              >
                {f.number}
              </span>
              <h3 className="font-heading text-lg md:text-4xl tracking-wider text-[#0A0A0A]/80 group-hover:text-[#E8192B] transition-colors duration-300 uppercase leading-none flex-shrink-0 w-[44%] md:w-auto">
                {f.title}
              </h3>
              <div className="hidden md:block w-px h-7 bg-[#0A0A0A]/[0.08] flex-shrink-0 group-hover:bg-[#E8192B]/30 transition-colors duration-300" />
              <p className="hidden md:block text-[#0A0A0A]/40 text-sm leading-relaxed group-hover:text-[#0A0A0A]/60 transition-colors duration-400 flex-1">
                {f.description}
              </p>
              <span className="ml-auto text-[#0A0A0A]/20 group-hover:text-[#E8192B]/70 transition-all duration-300 group-hover:translate-x-1 text-sm">
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
