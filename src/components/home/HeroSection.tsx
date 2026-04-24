"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Splits a string into individual <span> characters for GSAP stagger ── */
function SplitText({
  text,
  className,
  charClass,
}: {
  text: string;
  className?: string;
  charClass: string;
}) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`${charClass} hero-char`}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const tagRef      = useRef<HTMLDivElement>(null);
  const line1Ref    = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLDivElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const barTopRef   = useRef<HTMLDivElement>(null);
  const barBotRef   = useRef<HTMLDivElement>(null);
  const magnetRef   = useRef<HTMLAnchorElement>(null);

  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Trigger reveal — after 1.5 s of video play, with a 3 s hard fallback */
  useEffect(() => {
    const video = videoRef.current;
    let fired = false;
    const trigger = () => { if (!fired) { fired = true; setRevealed(true); } };

    /* Primary: reveal once the video has played 1.5 seconds */
    const onTime = () => { if (video && video.currentTime >= 1.5) trigger(); };
    /* Secondary: video loaded but autoplay might stall — reveal on play start */
    const onPlay = () => setTimeout(trigger, 800);
    /* Hard fallback: reveal after 3 s no matter what */
    const timer = setTimeout(trigger, 3000);

    if (video) {
      video.addEventListener("timeupdate", onTime);
      video.addEventListener("play", onPlay);
    }
    return () => {
      clearTimeout(timer);
      if (video) {
        video.removeEventListener("timeupdate", onTime);
        video.removeEventListener("play", onPlay);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Main entrance animation ── */
  useEffect(() => {
    if (!revealed) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      /* Cinematic bars slide away */
      tl.to([barTopRef.current, barBotRef.current], {
        scaleY: 0,
        duration: 0.9,
        ease: "power4.inOut",
        stagger: 0.05,
      });

      /* Reveal content container */
      tl.set(contentRef.current, { opacity: 1 }, "-=0.4");

      /* Eyebrow tag */
      tl.fromTo(
        tagRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.65, ease: "power3.out" },
        "-=0.3"
      );

      /* "BUILT" — char-by-char stagger */
      tl.to(
        `#hero-line-1 .hero-char`,
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.55, ease: "power3.out" },
        "-=0.4"
      );

      /* "DIFFERENT." — char-by-char, red */
      tl.to(
        `#hero-line-2 .hero-char`,
        { opacity: 1, y: 0, stagger: 0.035, duration: 0.55, ease: "power3.out" },
        "-=0.4"
      );

      /* Sub copy — tracking expands */
      tl.fromTo(
        subRef.current,
        { opacity: 0, letterSpacing: "0.05em" },
        { opacity: 1, letterSpacing: "0.4em", duration: 1.1, ease: "power2.out" },
        "-=0.3"
      );

      /* CTA buttons */
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
        "-=0.55"
      );

      /* Scroll indicator */
      tl.fromTo(
        scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        "-=0.4"
      );

      /* ── Scroll-driven parallax ── */
      gsap.to(contentRef.current, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end:   "bottom top",
          scrub: 1,
        },
      });

      gsap.to(".hero-video", {
        scale: 1.14,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end:   "bottom top",
          scrub: 1.3,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [revealed]);

  /* ── Magnetic CTA ── */
  const handleMagnetMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = e.currentTarget;
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) * 0.38;
    const y = (e.clientY - rect.top  - rect.height / 2) * 0.38;
    gsap.to(magnetRef.current, { x, y, duration: 0.35, ease: "power2.out" });
  };
  const handleMagnetLeave = () => {
    gsap.to(magnetRef.current, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-screen w-full overflow-hidden bg-[#080808]"
    >
      {/* ── Video ── */}
      <div className="absolute inset-0 z-0">
        <video
          key={isMobile ? "m" : "d"}
          ref={videoRef}
          autoPlay muted loop playsInline preload="auto"
          className="hero-video w-full h-full object-cover will-change-auto"
        >
          <source src={isMobile ? "/mobilehero-new.mp4" : "/herobg.mp4"} type="video/mp4" />
        </video>
      </div>

      {/* ── Cinematic letterbox bars (collapse on reveal) ── */}
      <div
        ref={barTopRef}
        className="absolute top-0 left-0 right-0 z-[5] origin-top"
        style={{ height: "8vh", background: "#080808" }}
      />
      <div
        ref={barBotRef}
        className="absolute bottom-0 left-0 right-0 z-[5] origin-bottom"
        style={{ height: "8vh", background: "#080808" }}
      />

      {/* ── Overlay stack ── */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#080808] via-[#080808]/35 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#080808]/65 via-transparent to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#080808]/55 via-transparent to-[#080808]/20" />

      {/* Red ambient at bottom-left */}
      <div
        className="absolute bottom-0 left-0 z-[1] w-[55vw] h-[45vh] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(232,25,43,0.13) 0%, transparent 65%)" }}
      />

      {/* Red bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] z-[4] bg-gradient-to-r from-[#E8192B]/80 via-[#E8192B]/30 to-transparent" />

      {/* ── Hero content ── */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col justify-end h-full pb-[11vh] px-6 md:px-14 lg:px-22 will-change-transform"
        style={{ opacity: 0 }}
      >
        {/* Eyebrow */}
        <div ref={tagRef} className="flex items-center gap-3 mb-5 md:mb-7">
          <div className="w-5 h-[1px] bg-[#E8192B]" />
          <span className="text-[#E8192B] text-[9px] md:text-[10px] tracking-[0.5em] uppercase font-medium">
            Roman Fitness — Jothipuram, Coimbatore — Est. 2026
          </span>
        </div>

        {/* BUILT */}
        <div id="hero-line-1" ref={line1Ref} className="overflow-visible leading-none">
          <h1
            className="font-heading text-white leading-[0.86] tracking-wider"
            style={{ fontSize: "clamp(4.5rem, 13vw, 11rem)" }}
            aria-label="BUILT"
          >
            <SplitText text="BUILT" charClass="inline-block" />
          </h1>
        </div>

        {/* DIFFERENT. */}
        <div id="hero-line-2" ref={line2Ref} className="overflow-visible leading-none -mt-1 md:-mt-3">
          <h1
            className="font-heading leading-[0.86] tracking-wider"
            style={{
              fontSize: "clamp(4.5rem, 13vw, 11rem)",
              color: "#E8192B",
              textShadow: "0 0 70px rgba(232,25,43,0.4), 0 0 140px rgba(232,25,43,0.15)",
            }}
            aria-label="DIFFERENT."
          >
            <SplitText text="DIFFERENT." charClass="inline-block" />
          </h1>
        </div>

        {/* Sub copy */}
        <p
          ref={subRef}
          className="mt-5 md:mt-8 text-white/40 text-[9px] md:text-[11px] font-medium uppercase"
          style={{ opacity: 0, letterSpacing: "0.4em" }}
        >
          This Is Not A Gym. This Is A Movement.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 items-start" style={{ opacity: 0 }}>
          {/* Magnetic primary button */}
          <div
            className="inline-block p-6 -m-6"
            onMouseMove={handleMagnetMove}
            onMouseLeave={handleMagnetLeave}
          >
            <a
              ref={magnetRef}
              href="/signup"
              data-cursor
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#E8192B] text-white font-bold uppercase tracking-[0.22em] text-sm overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(232,25,43,0.6)]"
            >
              <span className="relative z-10">Join the Movement</span>
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-white/12 translate-x-[-115%] skew-x-[-20deg] group-hover:translate-x-[115%] transition-transform duration-500" />
            </a>
          </div>

          {/* Ghost button */}
          <a
            href="#plans"
            className="inline-flex items-center justify-center px-8 py-4 border border-white/12 hover:border-[#E8192B]/50 text-white/55 hover:text-white font-medium uppercase tracking-[0.22em] text-sm transition-all duration-400 hover:bg-[#E8192B]/05"
          >
            View Plans
          </a>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 right-7 md:right-10 z-10 flex flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <div className="w-px h-10 bg-gradient-to-b from-[#E8192B] to-transparent" />
        <span
          className="text-white/25 text-[8px] tracking-[0.5em] uppercase"
          style={{ writingMode: "vertical-lr" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
