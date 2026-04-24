"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor — red ring that follows the mouse with spring physics.
 * Only rendered on fine-pointer (desktop) devices.
 * The native cursor is hidden globally via CSS in globals.css.
 */
export function CustomCursor() {
  const [mounted,    setMounted]    = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isPointer,  setIsPointer]  = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  /* Dot follows immediately */
  const dotSpring = { damping: 28, stiffness: 900, mass: 0.4 };
  const dx = useSpring(mx, dotSpring);
  const dy = useSpring(my, dotSpring);

  /* Ring lags behind for the trailing feel */
  const ringSpring = { damping: 32, stiffness: 220, mass: 0.8 };
  const rx = useSpring(mx, ringSpring);
  const ry = useSpring(my, ringSpring);

  useEffect(() => {
    setMounted(true);

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = !!t.closest(
        'a, button, [role="button"], input, textarea, select, label, [data-cursor]'
      );
      setIsHovering(interactive);
      setIsPointer(interactive);
    };

    const onDown = () => setIsClicking(true);
    const onUp   = () => setIsClicking(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [mx, my]);

  /* Only show on desktops */
  if (!mounted) return null;

  return (
    <>
      {/* ── Dot (fast) ── */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: dx, y: dy, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="rounded-full bg-[#E8192B]"
          animate={{
            width:   isClicking ? 5  : isHovering ? 0  : 7,
            height:  isClicking ? 5  : isHovering ? 0  : 7,
            opacity: isHovering ? 0  : 1,
          }}
          transition={{ duration: 0.12 }}
        />
      </motion.div>

      {/* ── Ring (slow, trailing) ── */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="rounded-full border border-[#E8192B]"
          animate={{
            width:       isClicking ? 18 : isHovering ? 46 : 30,
            height:      isClicking ? 18 : isHovering ? 46 : 30,
            opacity:     isClicking ? 0.5 : 1,
            borderColor: isHovering
              ? "rgba(232, 25, 43, 0.9)"
              : "rgba(232, 25, 43, 0.45)",
            borderWidth: isHovering ? 1.5 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </motion.div>
    </>
  );
}
