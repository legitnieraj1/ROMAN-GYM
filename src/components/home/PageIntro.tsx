"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cinematic preloader — shown once per browser session.
 * Slides upward to reveal the page beneath.
 */
export function PageIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;

    if (!sessionStorage.getItem("rf-intro")) {
      sessionStorage.setItem("rf-intro", "1");
      setVisible(true);

      /* Start exit after hold time */
      const exitTimer = setTimeout(() => setExiting(true), 2400);
      /* Fully unmount after animation completes */
      const doneTimer = setTimeout(() => setVisible(false), 3200);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(doneTimer);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[10000] bg-[#080808] flex flex-col items-center justify-center overflow-hidden"
          exit={{
            y: "-100%",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Top-right label */}
          <motion.span
            className="absolute top-8 right-8 text-[#E8192B] font-sans text-[10px] tracking-[0.55em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
          >
            Est. 2026
          </motion.span>

          {/* Bottom-left label */}
          <motion.span
            className="absolute bottom-8 left-8 text-white/20 font-sans text-[10px] tracking-[0.4em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.6 } }}
          >
            Jothipuram · Coimbatore
          </motion.span>

          {/* Logo */}
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
            }}
          >
            <img
              src="/logoroman.png"
              alt="Roman Fitness"
              className="w-20 md:w-28 h-auto"
              draggable={false}
            />

            {/* Brand name — mask reveal */}
            <div className="overflow-hidden">
              <motion.p
                className="font-heading text-xl md:text-3xl tracking-[0.6em] text-white/70"
                initial={{ y: 40 }}
                animate={{ y: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.5 } }}
              >
                ROMAN FITNESS
              </motion.p>
            </div>
          </motion.div>

          {/* Loading bar */}
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-28 h-[1px] bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full bg-[#E8192B]"
              initial={{ x: "-100%" }}
              animate={{
                x: "0%",
                transition: { duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 0.3 },
              }}
            />
          </div>

          {/* Thin border lines — cinematic frame */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/[0.04]" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.04]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
