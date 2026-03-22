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
    <div className="group relative rounded-lg overflow-hidden cursor-pointer" style={{ perspective: "800px" }}>
      <div className="relative aspect-[3/4] transition-transform duration-500 group-hover:rotate-y-1" style={{ transformStyle: "preserve-3d" }}>
        <div className="absolute inset-0">
          <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
        </div>
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-[#00AEEF]/50 transition-all duration-500 pointer-events-none" />
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: "inset 0 0 30px rgba(0, 174, 239, 0.15), 0 0 20px rgba(0, 174, 239, 0.1)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[#00AEEF] text-xs tracking-[0.2em] uppercase mb-1">{trainer.specialization}</p>
          <h3 className="font-heading text-2xl md:text-3xl tracking-wider mb-1">{trainer.name}</h3>
          <p className="text-white/50 text-sm mb-3">{trainer.role}</p>
          <p className="text-white/40 text-sm leading-relaxed max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500">{trainer.bio}</p>
          <div className="mt-4 flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
            <a href={trainer.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-[#00AEEF]/30 flex items-center justify-center hover:bg-[#00AEEF]/20 transition-colors duration-300">
              <Instagram className="w-4 h-4 text-[#00AEEF]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerCarousel3D() {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = useCallback(() => setActive((p) => (p + 1) % trainers.length), []);
  const prev = useCallback(() => setActive((p) => (p - 1 + trainers.length) % trainers.length), []);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(next, 3500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying, next]);

  const pauseAuto = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      pauseAuto();
      if (diff > 0) next(); else prev();
    }
  };

  const getStyle = (index: number) => {
    const diff = ((index - active) + trainers.length) % trainers.length;
    if (diff === 0) return { transform: "translateX(0) scale(1) rotateY(0deg)", zIndex: 10, opacity: 1, filter: "brightness(1)" };
    if (diff === 1) return { transform: "translateX(60%) scale(0.75) rotateY(-30deg)", zIndex: 5, opacity: 0.4, filter: "brightness(0.5)" };
    return { transform: "translateX(-60%) scale(0.75) rotateY(30deg)", zIndex: 5, opacity: 0.4, filter: "brightness(0.5)" };
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
      <div className="flex justify-center items-center gap-4 mt-4">
        <div className="flex gap-2">
          {trainers.map((_, i) => (
            <button key={i} onClick={() => { pauseAuto(); setActive(i); }} className={`h-2 rounded-full transition-all duration-300 ${i === active ? "bg-[#00AEEF] w-6" : "bg-white/20 w-2"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrainersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
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
        {
          opacity: 1, y: 0, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none reverse" },
        }
      );

      if (!isMobile) {
        cardsRef.current.forEach((card, index) => {
          if (!card) return;
          gsap.fromTo(card, { opacity: 0, y: 60 }, {
            opacity: 1, y: 0, duration: 0.8, delay: index * 0.15, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section ref={sectionRef} id="trainers" className="relative py-16 md:py-24 px-4 bg-[#0A0A0A]">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="trainers-heading text-center mb-10">
          <p className="text-[#00AEEF] text-sm tracking-[0.3em] uppercase mb-4">Our Team</p>
          <h2 className="font-heading text-4xl md:text-6xl tracking-wider">
            EXPERT <span className="text-[#00AEEF]">TRAINERS</span>
          </h2>
        </div>

        {isMobile ? (
          <TrainerCarousel3D />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
