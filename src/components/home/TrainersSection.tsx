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
    specialization: "Bodybuilding · Transformation",
    image: "/roman prabhur - head trainer.jpg",
    instagram: "https://www.instagram.com/romanprabhur/",
    bio: "Founder of Roman Fitness with years of experience in competitive bodybuilding and personal transformation coaching.",
  },
  {
    name: "Pradesh Rajan",
    role: "Fitness Trainer",
    specialization: "Strength · Conditioning",
    image: "/coach 2.jpg",
    instagram: "#",
    bio: "Certified strength and conditioning specialist dedicated to helping clients achieve peak physical performance.",
  },
  {
    name: "Logesh",
    role: "Fitness Trainer",
    specialization: "Functional · HIIT",
    image: "/coach 3.jpg",
    instagram: "#",
    bio: "Expert in functional training and high-intensity programs, focused on building real-world athletic ability.",
  },
];

function TrainerCard({ trainer }: { trainer: typeof trainers[0] }) {
  return (
    <div className="group relative overflow-hidden cursor-pointer">
      <div className="relative aspect-[3/4]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={trainer.image}
            alt={trainer.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        </div>
        {/* Gradient — strengthens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/15 to-transparent opacity-75 group-hover:opacity-95 transition-opacity duration-400" />
        {/* Red bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E8192B] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        {/* Corner */}
        <div className="absolute top-3 left-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#E8192B]" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-[#E8192B]" />
        </div>
        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <p className="text-[#E8192B] text-[9px] tracking-[0.3em] uppercase font-medium mb-1">
            {trainer.specialization}
          </p>
          <h3 className="font-heading text-xl md:text-3xl tracking-wider text-white mb-0.5">
            {trainer.name}
          </h3>
          <p className="text-white/42 text-xs mb-3">{trainer.role}</p>
          <p className="text-white/30 text-xs leading-relaxed max-h-0 overflow-hidden group-hover:max-h-14 transition-all duration-500">
            {trainer.bio}
          </p>
          <div className="mt-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 delay-100">
            <a
              href={trainer.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-[#E8192B]/35 inline-flex items-center justify-center hover:bg-[#E8192B]/20 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E8192B]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerCarousel({ isMobile }: { isMobile: boolean }) {
  const [active, setActive]               = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX   = useRef(0);

  const next = useCallback(() => setActive((p) => (p + 1) % trainers.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + trainers.length) % trainers.length), []);

  useEffect(() => {
    if (isAutoPlaying) intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying, next]);

  const pause = () => { setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); };
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove  = (e: React.TouchEvent) => { touchEndX.current   = e.touches[0].clientX; };
  const handleTouchEnd   = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { pause(); diff > 0 ? next() : prev(); }
  };

  const getStyle = (i: number) => {
    const d = ((i - active) + trainers.length) % trainers.length;
    if (d === 0) return { transform: "translateX(0) scale(1)",            zIndex: 10, opacity: 1,    filter: "none" };
    if (d === 1) return { transform: "translateX(60%) scale(0.78) rotateY(-24deg)", zIndex: 5, opacity: 0.3, filter: "brightness(0.4)" };
    return          { transform: "translateX(-60%) scale(0.78) rotateY(24deg)",  zIndex: 5, opacity: 0.3, filter: "brightness(0.4)" };
  };

  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <div
        className="relative h-[420px] flex items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {trainers.map((trainer, i) => (
          <div
            key={i}
            className="absolute w-[75%] max-w-[280px] transition-all duration-500 ease-out"
            style={{ ...getStyle(i), transformStyle: "preserve-3d" }}
            onClick={() => { pause(); setActive(i); }}
          >
            <TrainerCard trainer={trainer} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {trainers.map((_, i) => (
          <button
            key={i}
            onClick={() => { pause(); setActive(i); }}
            className={`h-[3px] transition-all duration-300 ${i === active ? "bg-[#E8192B] w-8" : "bg-[#0A0A0A]/18 w-3"}`}
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
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", toggleActions: "play none none reverse" } }
      );
      if (!isMobile) {
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          gsap.fromTo(card,
            { clipPath: "inset(100% 0 0 0)" },
            { clipPath: "inset(0% 0 0 0)", duration: 1.0, delay: i * 0.15, ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" } }
          );
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section ref={sectionRef} id="trainers" className="bg-[#F5EFE8] py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="trainers-heading flex items-start gap-5 md:gap-8 mb-10 md:mb-14 opacity-0">
          <div className="flex flex-col items-center gap-3 pt-2 flex-shrink-0">
            <div className="w-px h-10 bg-[#E8192B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8192B]" />
          </div>
          <div>
            <p className="text-[#E8192B] text-[9px] tracking-[0.55em] uppercase font-medium mb-3">Our Team</p>
            <h2
              className="font-heading text-[#0A0A0A] leading-none tracking-wide"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              ELITE <span className="text-[#E8192B]">TRAINERS</span>
            </h2>
          </div>
        </div>

        {isMobile ? (
          <TrainerCarousel isMobile={isMobile} />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {trainers.map((trainer, i) => (
              <div key={trainer.name} ref={(el) => { if (el) cardsRef.current[i] = el; }}>
                <TrainerCard trainer={trainer} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
