"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Elite Equipment",
    description:
      "State-of-the-art machines and free weights from premium brands engineered for maximum performance.",
    number: "01",
  },
  {
    title: "Strength Training",
    description:
      "Dedicated zones for powerlifting, bodybuilding, and functional strength development.",
    number: "02",
  },
  {
    title: "Personal Coaching",
    description:
      "Expert certified trainers building personalised programs around your body and your goals.",
    number: "03",
  },
  {
    title: "Body Transformation",
    description:
      "Proven 60 and 120-day programs with nutrition guidance and weekly progress benchmarks.",
    number: "04",
  },
  {
    title: "Cardio Zone",
    description:
      "Modern cardio theatre with treadmills, bikes, and cross-trainers for sustained endurance.",
    number: "05",
  },
  {
    title: "Functional Training",
    description:
      "Dynamic HIIT, circuit, and athletic-performance zone designed for real-world results.",
    number: "06",
  },
];

function FeatureRow({
  feature,
  rowRef,
}: {
  feature: (typeof features)[0];
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={rowRef}
      className="feature-row group relative border-b border-white/[0.055] overflow-hidden"
    >
      {/* Hover background flush */}
      <div className="absolute inset-0 bg-[#E8192B]/[0.018] opacity-0 group-hover:opacity-100 transition-opacity duration-600 pointer-events-none" />

      {/* Red sweep line at bottom */}
      <div className="feature-row-line absolute bottom-0 left-0 h-[1px] bg-[#E8192B]/40" />

      {/* Row content */}
      <div className="relative flex items-center gap-6 md:gap-12 py-7 md:py-11 px-4 md:px-6">
        {/* Ghost number */}
        <span
          className="font-heading text-5xl md:text-8xl text-white/[0.035] group-hover:text-[#E8192B]/[0.07] transition-colors duration-600 flex-shrink-0 select-none leading-none"
          style={{ width: "3.5rem", minWidth: "3.5rem" }}
        >
          {feature.number}
        </span>

        {/* Title */}
        <h3
          className="font-heading text-xl md:text-4xl lg:text-5xl tracking-wider text-white/75 group-hover:text-[#E8192B] transition-colors duration-400 uppercase leading-none flex-shrink-0 w-[45%] md:w-auto"
          style={{ flex: "0 0 auto" }}
        >
          {feature.title}
        </h3>

        {/* Separator dot — desktop only */}
        <div className="hidden md:block w-px h-8 bg-white/[0.08] flex-shrink-0 mx-2 group-hover:bg-[#E8192B]/30 transition-colors duration-400" />

        {/* Description */}
        <p className="hidden md:block text-white/22 text-sm leading-relaxed group-hover:text-white/42 transition-colors duration-500 flex-1">
          {feature.description}
        </p>

        {/* Arrow icon */}
        <span className="ml-auto flex-shrink-0 text-white/15 group-hover:text-[#E8192B]/70 transition-all duration-400 translate-x-0 group-hover:translate-x-1 text-sm tracking-widest">
          →
        </span>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowsRef    = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Heading */
      gsap.fromTo(
        ".features-heading",
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      /* Rows slide in alternately from left / right */
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { opacity: 0, x: i % 2 === 0 ? -60 : 60 },
          {
            opacity: 1, x: 0,
            duration: 0.75,
            delay: (i % 3) * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 90%", toggleActions: "play none none reverse" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative py-14 md:py-20 bg-[#080808]">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">

        {/* ── Heading block ── */}
        <div className="features-heading flex items-start gap-5 md:gap-8 mb-8 md:mb-12">
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="w-px h-12 bg-[#E8192B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8192B]" />
          </div>
          <div>
            <p className="text-[#E8192B] text-[9px] md:text-[10px] tracking-[0.55em] uppercase mb-3 font-medium">
              What We Offer
            </p>
            <h2
              className="font-heading tracking-wider leading-none text-white"
              style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
            >
              GYM{" "}
              <span
                style={{ textShadow: "0 0 50px rgba(232,25,43,0.3)" }}
                className="text-[#E8192B]"
              >
                FEATURES
              </span>
            </h2>
          </div>
        </div>

        {/* ── Top border ── */}
        <div className="border-t border-white/[0.055]" />

        {/* ── Feature rows ── */}
        {features.map((f, i) => (
          <FeatureRow
            key={f.title}
            feature={f}
            rowRef={(el) => { if (el) rowsRef.current[i] = el; }}
          />
        ))}
      </div>
    </section>
  );
}
