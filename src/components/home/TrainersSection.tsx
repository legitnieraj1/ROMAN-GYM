"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const trainers = [
  {
    name: "Roman Prabhur",
    role: "Head Trainer & Founder",
    specialization: "Bodybuilding • Transformation",
    image: "/roman prabhur - head trainer.jpg",
    instagram: "https://www.instagram.com/romanprabhur/",
    bio: "Founder of Roman Fitness with years of experience in competitive bodybuilding and personal transformation coaching.",
  },
  {
    name: "Pradesh Rajan",
    role: "Fitness Trainer",
    specialization: "Strength • Conditioning",
    image: "/coach 2.jpg",
    instagram: "#",
    bio: "Certified strength and conditioning specialist dedicated to helping clients achieve peak physical performance.",
  },
  {
    name: "Logesh",
    role: "Fitness Trainer",
    specialization: "Functional • HIIT",
    image: "/coach 3.jpg",
    instagram: "#",
    bio: "Expert in functional training and high-intensity programs, focused on building real-world athletic ability.",
  },
];

function TrainerCard({ trainer }: { trainer: typeof trainers[0] }) {
  return (
    <div className="group relative rounded-none overflow-hidden cursor-pointer">
      <div className="relative aspect-[3/4]">
        {/* Image with zoom on hover */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={trainer.image}
            alt={trainer.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            style={{ transform: "scale(1.01)" }}
          />
        </div>

        {/* Gradient overlay — strengthens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-400" />

        {/* Red bottom glow on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(232,25,43,0.15), transparent)" }}
        />

        {/* Red border that slides in from bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8192B] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

        {/* Corner accent — top left */}
        <div className="absolute top-0 left-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#E8192B]" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-[#E8192B]" />
        </div>

        {/* Info block */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <p className="text-[#E8192B] text-[10px] tracking-[0.3em] uppercase mb-1 font-medium">
            {trainer.specialization}
          </p>
          <h3 className="font-heading text-xl md:text-3xl tracking-wider mb-1 text-white">
            {trainer.name}
          </h3>
          <p className="text-white/45 text-xs md:text-sm mb-3">{trainer.role}</p>
          <p className="text-white/35 text-xs leading-relaxed max-h-0 overflow-hidden group-hover:max-h-16 transition-all duration-500 ease-out">
            {trainer.bio}
          </p>
          <div className="mt-4 flex gap-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-100">
            <a
              href={trainer.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 border border-[#E8192B]/35 flex items-center justify-center hover:bg-[#E8192B]/20 hover:border-[#E8192B]/70 transition-all duration-300"
            >
              <Instagram className="w-4 h-4 text-[#E8192B]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerCarousel3D() {
  const [active, setActive]             = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef  = useRef<NodeJS.Timeout | null>(null);
  const touchStartX  = useRef(0);
  const touchEndX    = useRef(0);

  const next = useCallback(() => setActive((p) => (p + 1) % trainers.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + trainers.length) % trainers.length), []);

  useEffect(() => {
    if (isAutoPlaying) intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying, next]);

  const pauseAuto = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove  = (e: React.TouchEvent) => { touchEndX.current   = e.touches[0].clientX; };
  const handleTouchEnd   = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { pauseAuto(); diff > 0 ? next() : prev(); }
  };

  const getStyle = (index: number) => {
    const diff = ((index - active) + trainers.length) % trainers.length;
    if (diff === 0) return { transform: "translateX(0) scale(1) rotateY(0deg)",       zIndex: 10, opacity: 1, filter: "brightness(1)" };
    if (diff === 1) return { transform: "translateX(60%) scale(0.76) rotateY(-28deg)", zIndex: 5,  opacity: 0.35, filter: "brightness(0.45)" };
    return              { transform: "translateX(-60%) scale(0.76) rotateY(28deg)",   zIndex: 5,  opacity: 0.35, filter: "brightness(0.45)" };
  };

  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <div
        className="relative h-[420px] flex items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {trainers.map((trainer, index) => (
          <div
            key={index}
            className="absolute w-[75%] max-w-[280px] transition-all duration-500 ease-out"
            style={{ ...getStyle(index), transformStyle: "preserve-3d" }}
            onClick={() => { pauseAuto(); setActive(index); }}
          >
            <TrainerCard trainer={trainer} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {trainers.map((_, i) => (
          <button
            key={i}
            onClick={() => { pauseAuto(); setActive(i); }}
            className={`h-[3px] rounded-none transition-all duration-300 ${i === active ? "bg-[#E8192B] w-8" : "bg-white/20 w-3"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function TrainersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement[]>([]);
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
        ".trainers-heading",
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", toggleActions: "play none none reverse" },
        }
      );

      if (!isMobile) {
        cardsRef.current.forEach((card, index) => {
          if (!card) return;
          // Clip-path wipe reveal: curtain drops from top
          gsap.fromTo(
            card,
            { clipPath: "inset(100% 0 0 0)", opacity: 1 },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: 1.1,
              delay: index * 0.18,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section ref={sectionRef} id="trainers" className="relative py-16 md:py-28 px-4 bg-[#0A0A0A]">
      {/* Subtle red radial background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(232,25,43,0.04) 0%, transparent 60%)" }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="trainers-heading text-center mb-10 md:mb-16">
          <p className="text-[#E8192B] text-xs tracking-[0.45em] uppercase mb-4 font-medium">Our Team</p>
          <h2 className="font-heading text-4xl md:text-6xl tracking-wider">
            ELITE <span className="text-[#E8192B]" style={{ textShadow: "0 0 40px rgba(232,25,43,0.25)" }}>TRAINERS</span>
          </h2>
        </div>

        {isMobile ? (
          <TrainerCarousel3D />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trainers.map((trainer, index) => (
              <div key={trainer.name} ref={(el) => { if (el) cardsRef.current[index] = el; }}>
                <TrainerCard trainer={trainer} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
