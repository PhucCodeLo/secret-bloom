import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HoldButton from '../components/HoldButton';
import RoseSilhouette from '../components/atmosphere/RoseSilhouette';

interface VoidSceneProps {
  reducedMotion: boolean;
  collect: (id: string) => void;
  onAwaken: () => void;
}

// Opening film timings (ms)
const STAGE_TIMES = [900, 2100, 3400, 4600];
const FINAL = 4;

export default function VoidScene({ reducedMotion, collect, onAwaken }: VoidSceneProps) {
  const [stage, setStage] = useState(reducedMotion ? FINAL : 0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (reducedMotion) {
      setStage(FINAL);
      return;
    }
    STAGE_TIMES.forEach((t, i) => {
      timers.current.push(window.setTimeout(() => setStage(i + 1), t));
    });
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [reducedMotion]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      {/* no skip control: the hold interaction is the way forward */}

      {/* soundless pulse */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(243,215,155,0.16), transparent 65%)',
        }}
        initial={false}
        animate={stage >= 1 ? { opacity: 1, scale: [1, 1.35, 1] } : { opacity: 0 }}
        transition={
          stage >= 1 && !reducedMotion
            ? { opacity: { duration: 1.2 }, scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } }
            : { duration: 0.8 }
        }
        aria-hidden="true"
      />

      {/* rose silhouette emerging from darkness */}
      <motion.div
        className="pointer-events-none absolute bottom-[6%] left-1/2 w-[130%] max-w-none -translate-x-1/2"
        initial={false}
        animate={stage >= 2 ? { opacity: 0.9, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <RoseSilhouette className="h-56 w-full sm:h-72" opacity={1} />
      </motion.div>

      {/* botanical detail light reveal */}
      <motion.div
        className="pointer-events-none absolute bottom-[16%] left-1/2 h-64 w-64 -translate-x-1/2"
        style={{
          background:
            'radial-gradient(circle, rgba(244,160,188,0.14), transparent 65%)',
        }}
        initial={false}
        animate={stage >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2 }}
        aria-hidden="true"
      />

      {/* title */}
      <motion.div
        initial={false}
        animate={stage >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
        transition={{ duration: 1.4, ease: [0.22, 0.8, 0.3, 1] }}
        className="relative flex flex-col items-center gap-4"
      >
        <p className="text-xs font-medium uppercase tracking-[0.45em] text-champagne/80">
          20 · 10 · 2026
        </p>
        <h1 className="font-display text-4xl font-bold tracking-wide text-ivory sm:text-5xl">
          THE SECRET
          <span className="block bg-gradient-to-r from-rose via-champagne to-rosegold bg-clip-text text-transparent">
            BLOOM
          </span>
        </h1>
        <p className="font-display text-lg italic text-rose/90">
          Beyond the Midnight Garden
        </p>
        <p className="max-w-xs text-base leading-7 text-ivory/70">
          A little universe made for you.
        </p>
      </motion.div>

      {/* awaken interaction */}
      <motion.div
        initial={false}
        animate={stage >= FINAL ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 1 }}
        className="relative mt-10"
      >
        <HoldButton
          duration={1300}
          onComplete={() => {
            collect('first-spark');
            onAwaken();
          }}
          label="Đánh thức khu vườn"
          hint="Nhấn giữ để đánh thức khu vườn"
          ringColor="#F4A0BC"
        />
      </motion.div>
    </div>
  );
}
