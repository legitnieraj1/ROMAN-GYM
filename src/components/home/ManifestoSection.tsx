"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * THE centrepiece moment of the page.
 *
 * Scroll-pinned section: as the user scrolls through ~300vh of height,
 * three text chunks reveal one by one:
 *   "THIS IS"  →  "NOT A GYM."  →  "IT'S YOUR FORGE."
 *
 * The section then fades everything out before unpinning, giving a
 * cinematic "chapter break" between Hero and the rest of the page.
 */
export function ManifestoSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start:   "top top",
          end:     "+=200%",
          pin:     innerRef.current,
          scrub:   1.4,
          anticipatePin: 1,
        },
      });

      /* ── Line 1: "THIS IS" ── */
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      /* ── Line 2: "NOT A GYM." — the gut-punch ── */
      tl.fromTo(
        line2Ref.current,
        { opacity: 0, scale: 0.75, y: 60 },
        { opacity: 1, scale: 1,    y: 0, duration: 1.2, ease: "power4.out" },
        ">-0.3"
      );

      /* hold */
      tl.to({}, { duration: 0.6 });

      /* ── Line 3: "IT'S YOUR FORGE." ── */
      tl.fromTo(
        line3Ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7 },
        ">0.1"
      );

      /* hold at full reveal */
      tl.to({}, { duration: 0.8 });

      /* ── Exit: all lines fade up and out ── */
      tl.to(
        [line1Ref.current, line2Ref.current, line3Ref.current],
        { opacity: 0, y: -40, duration: 0.6, stagger: 0.08 }
      );
    }, outerRef);

    return () => ctx.revert();
  }, []);

  return (
    /* outerRef gives GSAP the scroll distance to work with */
    <section
      ref={outerRef}
      className="relative bg-[#080808]"
      style={{ height: "310vh" }}
    >
      {/* innerRef is the element that gets pinned */}
      <div
        ref={innerRef}
        className="h-screen flex flex-col items-center justify-center px-4 overflow-hidden relative"
      >
        {/* Ambient red glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(232,25,43,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Hairline frames */}
        <div className="absolute top-[12%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" />
        <div className="absolute bottom-[12%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" />

        {/* Side vertical bars */}
        <div className="absolute left-[6%] top-[20%] w-px h-[60%] bg-gradient-to-b from-transparent via-[#E8192B]/18 to-transparent" />
        <div className="absolute right-[6%] top-[20%] w-px h-[60%] bg-gradient-to-b from-transparent via-[#E8192B]/18 to-transparent" />

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

          {/* "NOT A GYM." — dominates the screen */}
          <div ref={line2Ref} style={{ opacity: 0 }}>
            <p
              className="font-heading leading-none"
              style={{
                fontSize: "clamp(4rem, 17vw, 14rem)",
                color: "#E8192B",
                textShadow:
                  "0 0 120px rgba(232,25,43,0.55), 0 0 250px rgba(232,25,43,0.18)",
                letterSpacing: "-0.01em",
              }}
            >
              NOT A GYM.
            </p>
          </div>

          {/* "IT'S YOUR FORGE." */}
          <div ref={line3Ref} className="mt-4 md:mt-8" style={{ opacity: 0 }}>
            <p
              className="font-heading text-white/35 tracking-[0.25em]"
              style={{ fontSize: "clamp(1rem, 3.5vw, 2.8rem)" }}
            >
              IT'S YOUR FORGE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
