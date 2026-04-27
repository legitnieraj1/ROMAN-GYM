"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const transformations = [
  {
    id: 1,
    before: "/transform-before-1.png",
    after: "/transform-after-1.png",
    name: "Transformation 1",
    days: "120 Days",
  },
  {
    id: 2,
    before: "/transform-before-2.png",
    after: "/transform-after-2.png",
    name: "Transformation 2",
    days: "120 Days",
  },
  {
    id: 3,
    before: "/transform-before-3.png",
    after: "/transform-after-3.png",
    name: "Transformation 3",
    days: "120 Days",
  },
];

function BeforeAfterSlider({
  before,
  after,
  name,
  days,
}: {
  before: string;
  after: string;
  name: string;
  days: string;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!sliderRef.current || !isDragging.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleMove(e.touches[0].clientX);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={sliderRef}
        className="relative w-full aspect-[3/4] overflow-hidden cursor-ew-resize select-none border border-white/10"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* After image (full background) */}
        <div className="absolute inset-0 bg-black">
          <img
            src={after}
            alt="After transformation"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Before image (clipped by slider) */}
        <div
          className="absolute inset-0 bg-black"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={before}
            alt="Before transformation"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-[3px] z-10"
          style={{
            left: `${sliderPosition}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="w-full h-full bg-[#E8192B]" />
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#E8192B] flex items-center justify-center border-2 border-white/20">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 8L1 5M4 8L1 11M4 8H12M12 8L15 5M12 8L15 11"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-3 left-3 text-[10px] text-white/60 tracking-[0.2em] uppercase z-10 bg-black/50 px-2 py-1">
          Before
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-[#E8192B] tracking-[0.2em] uppercase z-10 bg-black/50 px-2 py-1">
          After
        </div>
      </div>

      {/* Caption */}
      <div className="mt-3 text-center">
        <p className="text-white/70 text-sm font-medium">{name}</p>
        <p className="text-[#E8192B]/60 text-xs tracking-wider uppercase">
          {days}
        </p>
      </div>
    </div>
  );
}

function MobileTransformCarousel() {
  const [active, setActive] = useState(1); // Start with center
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = useCallback(
    () => setActive((p) => (p + 1) % transformations.length),
    []
  );
  const prev = useCallback(
    () =>
      setActive(
        (p) => (p - 1 + transformations.length) % transformations.length
      ),
    []
  );

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(next, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, next]);

  const pauseAuto = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      pauseAuto();
      if (diff > 0) next();
      else prev();
    }
  };

  const getStyle = (index: number): React.CSSProperties => {
    const diff =
      ((index - active + transformations.length) % transformations.length);
    if (diff === 0)
      return {
        transform: "translateX(0) scale(1) rotateY(0deg)",
        zIndex: 10,
        opacity: 1,
      };
    if (diff === 1)
      return {
        transform: "translateX(65%) scale(0.8) rotateY(-20deg)",
        zIndex: 5,
        opacity: 0.35,
      };
    return {
      transform: "translateX(-65%) scale(0.8) rotateY(20deg)",
      zIndex: 5,
      opacity: 0.35,
    };
  };

  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <div
        className="relative h-[420px] flex items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {transformations.map((t, index) => (
          <div
            key={t.id}
            className="absolute w-[75%] max-w-[280px] transition-all duration-500 ease-out"
            style={{ ...getStyle(index), transformStyle: "preserve-3d" }}
            onClick={() => {
              pauseAuto();
              setActive(index);
            }}
          >
            <BeforeAfterSlider
              before={t.before}
              after={t.after}
              name={t.name}
              days={t.days}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-4 mt-2">
        <div className="flex gap-2">
          {transformations.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                pauseAuto();
                setActive(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? "bg-[#E8192B] w-6" : "bg-white/20 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransformationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

      if (!isMobile) {
        gsap.fromTo(
          ".transform-grid",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

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
  }, [isMobile]);

  return (
    <section ref={sectionRef} className="relative py-14 md:py-20 px-4 bg-[#0A0A0A]">
      <div className="container mx-auto max-w-7xl">
        <div className="transform-heading flex items-start gap-5 md:gap-8 mb-8 md:mb-12">
          <div className="flex flex-col items-center gap-3 pt-2 flex-shrink-0">
            <div className="w-px h-12 bg-[#E8192B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8192B]" />
          </div>
          <div>
            <p className="text-[#E8192B] text-[10px] tracking-[0.45em] uppercase mb-3 font-medium">
              Real Results
            </p>
            <h2
              className="font-heading tracking-wider leading-none text-white"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              BODY{" "}
              <span
                className="text-[#E8192B]"
                style={{ textShadow: "0 0 40px rgba(232,25,43,0.25)" }}
              >
                TRANSFORMATION
              </span>
            </h2>
          </div>
        </div>

        {isMobile ? (
          <MobileTransformCarousel />
        ) : (
          <div className="transform-grid grid grid-cols-3 gap-6 items-start">
            {transformations.map((t) => (
              <BeforeAfterSlider
                key={t.id}
                before={t.before}
                after={t.after}
                name={t.name}
                days={t.days}
              />
            ))}
          </div>
        )}

        {/* Glowing progress line */}
        <div className="mt-10 max-w-lg mx-auto">
          <div className="flex justify-between text-xs text-white/30 tracking-wider uppercase mb-2">
            <span>Day 1</span>
            <span>Day 60</span>
            <span>Day 120</span>
          </div>
          <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="progress-line h-full bg-gradient-to-r from-[#E8192B]/50 via-[#E8192B] to-[#E8192B]/50 origin-left" />
          </div>
        </div>
      </div>
    </section>
  );
}
