"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 2 && !revealed) {
        setRevealed(true);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [revealed]);

  useEffect(() => {
    if (!revealed || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
      );

      // Lightweight parallax — only transform, no opacity change during scrub
      gsap.to(contentRef.current, {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [revealed]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]"
    >
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          key={isMobile ? "mobile" : "desktop"}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover will-change-auto"
        >
          <source src={isMobile ? "/mobilehero-new.mp4" : "/herobg.mp4"} type="video/mp4" />
        </video>
      </div>

      {/* Hero content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 will-change-transform"
        style={{ opacity: 0 }}
      >
        <img
          src="/logoroman.png"
          alt="Roman Fitness Logo"
          className="w-[200px] md:w-[280px] h-auto mb-8"
          loading="eager"
        />
        <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl tracking-wider">
          <span className="text-glow-strong">ROMAN</span>
          <br />
          <span className="text-white/90">FITNESS</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/60 tracking-[0.3em] uppercase">
          Enter The Empire
        </p>
        <div className="mt-10 flex gap-4">
          <a
            href="/signup"
            className="px-8 py-4 bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white font-bold uppercase tracking-wider rounded transition-colors duration-300 neon-pulse"
          >
            Start Training
          </a>
          <a
            href="#plans"
            className="px-8 py-4 border border-white/20 hover:border-[#00AEEF]/50 text-white font-medium uppercase tracking-wider rounded transition-colors duration-300 hover:bg-white/5"
          >
            View Plans
          </a>
        </div>
      </div>

      {revealed && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs tracking-[0.3em] uppercase text-white/40">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#00AEEF] to-transparent animate-pulse" />
        </div>
      )}
    </section>
  );
}
