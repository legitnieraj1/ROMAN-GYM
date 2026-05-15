"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Magazine editorial grid — 14 gym photos at full opacity */
const photos = [
  { src: "/gym/floor-wide.jpg",      alt: "Gym floor",        col: "md:col-span-2", row: "md:row-span-2" },
  { src: "/gym/dumbbell-area.jpg",   alt: "Dumbbell area",    col: "",               row: "" },
  { src: "/gym/dumbbells.jpg",       alt: "Dumbbells",        col: "",               row: "" },
  { src: "/gym/bench-press.jpg",     alt: "Bench press",      col: "",               row: "" },
  { src: "/gym/cable-machine.jpg",   alt: "Cable machine",    col: "md:col-span-2", row: "" },
  { src: "/gym/shoulder-press.jpg",  alt: "Shoulder press",   col: "",               row: "" },
  { src: "/gym/chest-press.jpg",     alt: "Chest press",      col: "",               row: "" },
  { src: "/gym/lateral-raise.jpg",   alt: "Lateral raise",    col: "",               row: "" },
  { src: "/gym/leg-extension.jpg",   alt: "Leg extension",    col: "",               row: "" },
  { src: "/gym/smith-machine.jpg",   alt: "Smith machine",    col: "md:col-span-2", row: "" },
  { src: "/gym/smith-machine-2.jpg", alt: "Smith machine 2",  col: "",               row: "" },
  { src: "/gym/corridor-1.jpg",      alt: "Gym corridor",     col: "",               row: "" },
  { src: "/gym/corridor-2.jpg",      alt: "Gym corridor",     col: "md:col-span-2", row: "" },
  { src: "/gym/motivation.jpg",      alt: "Training zone",    col: "",               row: "" },
];

function PhotoTile({ photo, index }: { photo: typeof photos[0]; index: number }) {
  return (
    <div
      className={`gallery-tile group relative overflow-hidden bg-[#E8E3DC] ${photo.col} ${photo.row}`}
      style={{ aspectRatio: photo.col === "md:col-span-2" ? "auto" : "1/1" }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/30 transition-colors duration-400" />
      {/* Red bottom border on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#E8192B] translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
    </div>
  );
}

export function GallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gallery-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );
      gsap.fromTo(
        ".gallery-tile",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          stagger: { each: 0.06, from: "start" },
          ease: "power2.out",
          scrollTrigger: { trigger: ".gallery-grid", start: "top 80%", toggleActions: "play none none reverse" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-[#F5EFE8]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">

        {/* Header */}
        <div className="gallery-header flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <p className="text-[#E8192B] text-[9px] tracking-[0.55em] uppercase font-medium mb-2">
              The Space
            </p>
            <h2
              className="font-heading text-[#0A0A0A] leading-none tracking-wide"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
            >
              SEE THE GYM
            </h2>
          </div>
          <p className="text-[#0A0A0A]/42 text-sm max-w-xs leading-relaxed">
            State-of-the-art equipment across a premium facility designed for serious training.
          </p>
        </div>

        {/* Grid */}
        <div
          className="gallery-grid grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2"
          style={{ gridAutoRows: "220px" }}
        >
          {photos.map((photo, i) => (
            <PhotoTile key={photo.src} photo={photo} index={i} />
          ))}
        </div>

        {/* Bottom label */}
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#0A0A0A]/[0.07]" />
          <p className="text-[#0A0A0A]/30 text-[9px] tracking-[0.45em] uppercase">
            Jothipuram · Coimbatore · Est. 2026
          </p>
          <div className="h-px flex-1 bg-[#0A0A0A]/[0.07]" />
        </div>
      </div>
    </section>
  );
}
