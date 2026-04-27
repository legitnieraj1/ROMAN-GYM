"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor — red ring that follows the mouse with spring physics.
 * Only rendered on fine-pointer (desktop) devices.
 * The native cursor is hidden globally via CSS in globals.css.
 *
 * Performance notes:
 * - Uses `scale` instead of `width`/`height` → GPU compositor only, no layout.
 * - `opacity` is also compositor-only.
 * - `borderColor` is set via `style` (direct, no animation overhead).
 * - No layout or paint operations on each frame.
 */
export function CustomCursor() {
  const [mounted,    setMounted]    = useState(false);
  const [hasFine,    setHasFine]    = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

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
    /* Only enable on desktop (fine-pointer = mouse/trackpad) */
    const mq = window.matchMedia("(pointer: fine)");
    setHasFine(mq.matches);
    setMounted(true);

    if (!mq.matches) return;

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
    };

    const onDown  = () => setIsClicking(true);
    const onUp    = () => setIsClicking(false);
    /* Safety reset — mouseup can be missed when the overlay renders mid-click */
    const onBlur  = () => { setIsClicking(false); setIsHovering(false); };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mouseover",  onOver,  { passive: true });
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mouseleave", onBlur);
    window.addEventListener("blur",       onBlur);

    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseover",  onOver);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("mouseleave", onBlur);
      window.removeEventListener("blur",       onBlur);
    };
  }, [mx, my]);

  /* Don't render on SSR, on touch devices, or before mount */
  if (!mounted || !hasFine) return null;

  /*
   * Scale-based sizing (all GPU compositor — zero layout):
   *   Ring base:  30px → scale 1.53 (≈46px on hover) · scale 0.6 (≈18px on click)
   *   Dot  base:   7px → scale 0    (hidden on hover) · scale 0.71 (≈5px on click)
   */
  const ringScale = isClicking ? 0.6  : isHovering ? 1.53 : 1;
  const dotScale  = isHovering ? 0    : isClicking  ? 0.71 : 1;

  return (
    <>
      {/* ── Dot (fast, immediate) ── */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: dx, y: dy, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="w-[7px] h-[7px] rounded-full bg-[#E8192B]"
          animate={{ scale: dotScale, opacity: isHovering ? 0 : 1 }}
          transition={{ duration: 0.12 }}
        />
      </motion.div>

      {/* ── Ring (slow, trailing) ── */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.div
          className="w-[30px] h-[30px] rounded-full border"
          style={{
            borderColor: isHovering
              ? "rgba(232,25,43,0.9)"
              : "rgba(232,25,43,0.45)",
          }}
          animate={{
            scale:   ringScale,
            opacity: isClicking ? 0.5 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </motion.div>
    </>
  );
}
