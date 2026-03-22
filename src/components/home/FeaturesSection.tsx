"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Elite Equipment",
    description: "State-of-the-art machines and free weights from premium brands for maximum performance.",
    number: "01",
  },
  {
    title: "Strength Training",
    description: "Dedicated zones for powerlifting, bodybuilding, and functional strength development.",
    number: "02",
  },
  {
    title: "Personal Coaching",
    description: "Expert certified trainers providing personalized programs tailored to your goals.",
    number: "03",
  },
  {
    title: "Body Transformation",
    description: "Proven 60 and 120 day transformation programs with nutrition and training guidance.",
    number: "04",
  },
  {
    title: "Cardio Zone",
    description: "Modern cardio theatre with treadmills, bikes, and cross-trainers for endurance training.",
    number: "05",
  },
  {
    title: "Functional Training",
    description: "Dynamic training area for HIIT, circuit training, and athletic performance.",
    number: "06",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".features-heading",
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

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative py-16 md:py-24 px-4 bg-[#0A0A0A]">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="features-heading text-center mb-10 md:mb-16">
          <p className="text-[#00AEEF] text-sm tracking-[0.3em] uppercase mb-4">What We Offer</p>
          <h2 className="font-heading text-4xl md:text-6xl tracking-wider">
            GYM <span className="text-[#00AEEF]">FEATURES</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-[1px] bg-white/[0.03]">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => { if (el) cardsRef.current[index] = el; }}
              className="group relative bg-[#0A0A0A] p-5 md:p-10 cursor-pointer transition-all duration-500 hover:bg-[#0f1419]"
            >
              {/* Number */}
              <span className="font-heading text-3xl md:text-5xl text-white/[0.04] group-hover:text-[#00AEEF]/10 transition-colors duration-500 absolute top-4 right-4 md:top-6 md:right-6">
                {feature.number}
              </span>

              {/* Thin accent line */}
              <div className="w-8 h-[2px] bg-[#00AEEF]/30 group-hover:bg-[#00AEEF] group-hover:w-12 transition-all duration-500 mb-4 md:mb-8" />

              <h3 className="font-heading text-sm md:text-xl tracking-wider mb-2 md:mb-4 text-white/80 group-hover:text-white transition-colors duration-300 uppercase">
                {feature.title}
              </h3>
              <p className="text-white/30 text-xs md:text-sm leading-relaxed hidden md:block group-hover:text-white/50 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Bottom hover glow line */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00AEEF]/0 to-transparent group-hover:via-[#00AEEF]/40 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
