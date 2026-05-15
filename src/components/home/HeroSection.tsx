"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".hero-eyebrow",  { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
        .fromTo(".hero-headline", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.3")
        .fromTo(".hero-sub",      { opacity: 0 },        { opacity: 1, duration: 0.6 }, "-=0.4")
        .fromTo(".hero-ctas",     { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .fromTo(".hero-stats",    { opacity: 0 },        { opacity: 1, stagger: 0.08, duration: 0.5 }, "-=0.3");
    }, sectionRef);
    return () => ctx.revert();
  }, [revealed]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-screen w-full overflow-hidden flex"
      style={{ background: "#F5EFE8" }}
    >
      {/* ── Left: cream text panel ── */}
      <div className="relative z-10 flex flex-col justify-center px-8 md:px-12 lg:px-16 w-full md:w-[48%] h-full bg-[#F5EFE8]">
        {/* Eyebrow */}
        <div className="hero-eyebrow flex items-center gap-3 mb-7 opacity-0">
          <div className="w-5 h-px bg-[#E8192B]" />
          <span className="text-[#E8192B] text-[9px] tracking-[0.55em] uppercase font-medium">
            Est. 2026 · Jothipuram, Coimbatore
          </span>
        </div>

        {/* Headline */}
        <div className="hero-headline opacity-0">
          <h1
            className="font-heading text-[#0A0A0A] leading-[0.88]"
            style={{ fontSize: "clamp(4rem, 10vw, 9rem)" }}
          >
            BUILT
          </h1>
          <h1
            className="font-heading leading-[0.88]"
            style={{
              fontSize: "clamp(4rem, 10vw, 9rem)",
              color: "#E8192B",
            }}
          >
            DIFFERENT.
          </h1>
        </div>

        {/* Sub */}
        <p className="hero-sub mt-5 text-[#0A0A0A]/45 text-[10px] tracking-[0.4em] uppercase opacity-0">
          This Is Not A Gym. This Is A Movement.
        </p>

        {/* CTAs */}
        <div className="hero-ctas mt-9 flex flex-col sm:flex-row gap-3 opacity-0">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#0A0A0A] text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-[#E8192B] transition-colors duration-300"
          >
            Join the Movement
          </Link>
          <Link
            href="#plans"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-[#0A0A0A]/15 text-[#0A0A0A]/55 font-medium uppercase tracking-[0.2em] text-[11px] hover:border-[#0A0A0A]/30 hover:text-[#0A0A0A] transition-all"
          >
            View Plans
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-10 flex gap-8">
          {[
            { v: "5 AM",  l: "Opens Daily" },
            { v: "₹0",    l: "Admission" },
            { v: "2026",  l: "Est." },
          ].map((s) => (
            <div key={s.l} className="hero-stats opacity-0">
              <div className="font-heading text-2xl text-[#E8192B]">{s.v}</div>
              <div className="text-[#0A0A0A]/35 text-[8px] tracking-[0.3em] uppercase mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#0A0A0A]/[0.07]" />
      </div>

      {/* ── Right: full gym photo ── */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[54%] overflow-hidden">
        <Image
          src="/gym/dumbbell-area.jpg"
          alt="Roman Fitness gym"
          fill
          priority
          sizes="54vw"
          className="object-cover object-center"
        />
        {/* Subtle left vignette to blend with cream panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE8]/70 via-[#F5EFE8]/08 to-transparent" />
        {/* Red bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E8192B]" />
      </div>

      {/* Mobile: gym photo as background with overlay */}
      <div className="md:hidden absolute inset-0 z-0">
        <Image
          src="/gym/dumbbell-area.jpg"
          alt="Roman Fitness gym"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ opacity: 0.15 }}
        />
      </div>
    </section>
  );
}
