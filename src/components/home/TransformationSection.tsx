"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function TransformationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".transform-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".transform-container",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ".progress-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMove = (clientX: number) => {
    if (!sliderRef.current || !isDragging.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 bg-[#0A0A0A]">
      <div className="container mx-auto max-w-3xl">
        <div className="transform-heading text-center mb-16">
          <p className="text-[#00AEEF] text-sm tracking-[0.3em] uppercase mb-4">Real Results</p>
          <h2 className="font-heading text-4xl md:text-6xl tracking-wider">
            BODY <span className="text-[#00AEEF]">TRANSFORMATION</span>
          </h2>
        </div>

        {/* Before/After Slider - vertical/portrait aspect ratio */}
        <div
          ref={sliderRef}
          className="transform-container relative w-full max-w-md mx-auto aspect-[3/4] rounded-lg overflow-hidden cursor-ew-resize select-none border border-white/10"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* After image (full background) */}
          <div className="absolute inset-0">
            <img
              src="/after.png"
              alt="After transformation"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Before image (clipped by slider) */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src="/before.png"
              alt="Before transformation"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Slider line */}
          <div
            className="absolute top-0 bottom-0 w-[3px] z-10"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-full h-full bg-[#00AEEF] shadow-[0_0_10px_rgba(0,174,239,0.5)]" />
            {/* Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#00AEEF] flex items-center justify-center shadow-[0_0_20px_rgba(0,174,239,0.5)] border-2 border-white/20">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L1 5M4 8L1 11M4 8H12M12 8L15 5M12 8L15 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 text-xs text-white/60 tracking-[0.2em] uppercase z-10 bg-black/40 px-2 py-1 rounded">Before</div>
          <div className="absolute bottom-4 right-4 text-xs text-[#00AEEF] tracking-[0.2em] uppercase z-10 bg-black/40 px-2 py-1 rounded">After</div>
        </div>

        {/* Glowing progress line */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-white/30 tracking-wider uppercase mb-2">
            <span>Day 1</span>
            <span>Day 60</span>
            <span>Day 120</span>
          </div>
          <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="progress-line h-full bg-gradient-to-r from-[#00AEEF]/50 via-[#00AEEF] to-[#00AEEF]/50 origin-left" />
          </div>
        </div>
      </div>
    </section>
  );
}
