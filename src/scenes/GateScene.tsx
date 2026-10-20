import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Sfx } from '../types';

interface GateSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onEnter: () => void;
}

function Rune({ glyph, x, y, delay, reducedMotion }: { glyph: string; x: string; y: string; delay: number; reducedMotion: boolean }) {
  return (
    <motion.div
      className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-champagne/50 bg-midnight/60"
      style={{ left: x, top: y, boxShadow: '0 0 18px rgba(243,215,155,0.35)' }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      aria-hidden="true"
    >
      {!reducedMotion && (
        <motion.span
          className="font-display text-xl text-champagne"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          {glyph}
        </motion.span>
      )}
      {reducedMotion && <span className="font-display text-xl text-champagne">{glyph}</span>}
    </motion.div>
  );
}

export default function GateScene({ sfx, reducedMotion, collect, onEnter }: GateSceneProps) {
  const [revealed, setRevealed] = useState(reducedMotion);
  const [opening, setOpening] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (reducedMotion) return;
    timers.current.push(window.setTimeout(() => setRevealed(true), 1200));
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [reducedMotion]);

  const open = () => {
    if (opening || !revealed) return;
    setOpening(true);
    sfx.reveal();
    collect('gate-seal');
    window.setTimeout(onEnter, reducedMotion ? 300 : 1900);
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
      {/* no skip control: the gate seal is the way forward */}

      <motion.div
        initial={false}
        animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
          Hồi II — Cánh cổng
        </p>

        {/* the gate: two doors that swing open */}
        <div className="relative mx-auto w-full max-w-[300px]" style={{ perspective: 1000 }}>
          {/* runes float around the gate graphic only — kept clear of the text below */}
          {revealed && (
            <div className="pointer-events-none absolute -inset-5 z-10" aria-hidden="true">
              <Rune glyph="✦" x="-5%" y="0%" delay={0.2} reducedMotion={reducedMotion} />
              <Rune glyph="❀" x="89%" y="0%" delay={0.5} reducedMotion={reducedMotion} />
              <Rune glyph="☾" x="-5%" y="80%" delay={0.8} reducedMotion={reducedMotion} />
              <Rune glyph="✧" x="89%" y="80%" delay={1.1} reducedMotion={reducedMotion} />
            </div>
          )}
          <div className="stage-glow absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <svg viewBox="0 0 320 400" className="h-auto w-full" role="img" aria-label="Cánh cổng vườn thiên văn">
            <defs>
              <linearGradient id="cgGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F3D79B" />
                <stop offset="100%" stopColor="#DCA47A" />
              </linearGradient>
            </defs>
            <path d="M52 380 L52 180 Q52 70 160 70 Q268 70 268 180 L268 380" fill="none" stroke="url(#cgGold)" strokeWidth="7" strokeLinecap="round" />
            {[
              [52, 180], [58, 130], [86, 92], [128, 72], [160, 66], [192, 72], [234, 92], [262, 130], [268, 180],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="11" fill="#5e2340" />
                <circle cx={x - 3} cy={y - 3} r="6" fill="#7a2f4f" />
                <circle cx={x} cy={y} r="2.6" fill="#F4A0BC" opacity="0.85" />
              </g>
            ))}
          </svg>

          {/* left door */}
          <motion.div
            className="absolute bottom-0 left-[16%] top-[17%] w-[34%] origin-left rounded-sm border border-rosegold/40"
            style={{ background: 'linear-gradient(160deg, #1a2340, #0b1022)', transformStyle: 'preserve-3d' }}
            initial={false}
            animate={opening ? { rotateY: -72, opacity: 0.9 } : { rotateY: 0 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <div className="absolute inset-3 rounded-sm border border-champagne/25" />
          </motion.div>
          {/* right door */}
          <motion.div
            className="absolute bottom-0 right-[16%] top-[17%] w-[34%] origin-right rounded-sm border border-rosegold/40"
            style={{ background: 'linear-gradient(200deg, #1a2340, #0b1022)', transformStyle: 'preserve-3d' }}
            initial={false}
            animate={opening ? { rotateY: 72, opacity: 0.9 } : { rotateY: 0 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <div className="absolute inset-3 rounded-sm border border-champagne/25" />
          </motion.div>

          {/* light flooding through */}
          <motion.div
            className="pointer-events-none absolute inset-x-[18%] bottom-0 top-[18%] rounded-sm"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(255,240,210,0.85), rgba(243,215,155,0.25) 60%, transparent 80%)' }}
            initial={{ opacity: 0 }}
            animate={opening ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            aria-hidden="true"
          />

          {/* gate handle */}
          {!opening && revealed && (
            <button
              type="button"
              onClick={open}
              aria-label="Chạm để mở cổng"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-champagne/70 bg-midnight/50"
              style={{ boxShadow: '0 0 26px rgba(243,215,155,0.5)' }}
            >
              <motion.span
                className="font-display text-2xl text-champagne"
                animate={reducedMotion ? {} : { scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                aria-hidden="true"
              >
                ✦
              </motion.span>
            </button>
          )}
        </div>

        <motion.div
          initial={false}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 flex flex-col items-center gap-4"
        >
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Cánh cổng <span className="text-champagne">thiên văn</span>
          </h2>
          <p className="max-w-xs text-[15px] leading-6 text-ivory/70">
            Chạm vào ấn sáng giữa cổng — hoặc bước thẳng vào — để tiến sâu hơn.
          </p>
          <button
            type="button"
            onClick={open}
            disabled={opening || !revealed}
            className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
          >
            {opening ? 'Cổng đang mở…' : 'Bước vào khu vườn'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
