import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useReducedMotion } from 'motion/react';

/** Gradient reading-progress bar pinned to the top. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
    />
  );
};

/** Soft spotlight that follows the pointer (desktop, fine pointers only). */
export const CursorSpotlight: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      if (ref.current) ref.current.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, [reduce]);
  return <div ref={ref} aria-hidden="true" className="spotlight" />;
};

/** Short branded intro, skipped for reduced-motion users. */
export const Preloader: React.FC<{ initials: string }> = ({ initials }) => {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(!reduce);
  useEffect(() => { if (show) { const t = setTimeout(() => setShow(false), 1300); return () => clearTimeout(t); } }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center bg-[#07071a]"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7 }}
            className="font-display text-6xl font-black bg-gradient-to-r from-rose-500 to-amber-400 bg-clip-text text-transparent"
          >
            {initials}
          </motion.div>
          <motion.div className="absolute bottom-[38%] h-px w-40 bg-gradient-to-r from-transparent via-rose-400 to-transparent"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Scroll-reveal wrapper with blur-up and a gentle rise. */
export const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 48, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};
