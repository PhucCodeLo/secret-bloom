import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LightBurst from '../components/atmosphere/LightBurst';
import type { Sfx } from '../types';
import { pickSceneBlessing } from '../data/sceneBlessings';

interface SanctuarySceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onSceneBlessing?: (key: string, text: string) => void;
  onNext: () => void;
}

const RUNES = [
  { id: 'past', glyph: '❖', name: 'Quá khứ', color: '#B9A8E8' },
  { id: 'present', glyph: '✦', name: 'Hiện tại', color: '#F3D79B' },
  { id: 'future', glyph: '☾', name: 'Tương lai', color: '#F4A0BC' },
];

const SECRET_KEY = 'sanctuary';

export default function SanctuaryScene({ sfx, reducedMotion, collect, onSceneBlessing, onNext }: SanctuarySceneProps) {
  const [lit, setLit] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  // One random blessing variant per playthrough.
  const secret = useMemo(() => pickSceneBlessing(SECRET_KEY), []);
  useEffect(() => {
    if (revealed) onSceneBlessing?.(SECRET_KEY, secret);
  }, [revealed, secret, onSceneBlessing]);
  const [crystalTap, setCrystalTap] = useState(0);

  const activate = (id: string) => {
    if (lit.includes(id)) return;
    const next = [...lit, id];
    setLit(next);
    sfx.chime();
    if (next.length === RUNES.length) {
      window.setTimeout(() => {
        setRevealed(true);
        sfx.success();
        sfx.swell();
        collect('sanctuary-secret');
      }, reducedMotion ? 200 : 900);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      {/* violet sanctuary ambience */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 30%, rgba(143,124,201,0.14), transparent 65%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-lavender/80">
            Hồi VI — Thánh địa bị lãng quên
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Thánh địa <span className="text-lavender">bị lãng quên</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Ba cổ ngữ canh giữ một bí mật. Hãy chạm vào từng cổ ngữ để thắp sáng chúng.
          </p>
        </div>

        <div className="relative flex h-64 w-full items-center justify-center">
          {/* floating crystal */}
          <motion.button
            type="button"
            onClick={() => {
              setCrystalTap((c) => c + 1);
              sfx.pop();
            }}
            aria-label="Pha lê lơ lửng — chạm để xem"
            className="relative z-10 flex h-24 w-24 items-center justify-center"
            animate={reducedMotion ? {} : { y: [0, -10, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
              <polygon points="50,6 82,38 66,94 34,94 18,38" fill="rgba(185,168,232,0.25)" stroke="#B9A8E8" strokeWidth="2" />
              <polygon points="50,6 82,38 50,44" fill="rgba(255,255,255,0.35)" />
              <polygon points="50,6 18,38 50,44" fill="rgba(185,168,232,0.4)" />
              <line x1="50" y1="44" x2="50" y2="94" stroke="#B9A8E8" strokeWidth="1" opacity="0.6" />
            </svg>
            {crystalTap > 0 && (
              <motion.span
                key={crystalTap}
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-lavender"
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 0.8 }}
                aria-hidden="true"
              />
            )}
          </motion.button>
          {revealed && <LightBurst burstKey="sanctuary" color="185,168,232" size={300} />}

          {/* runes orbiting */}
          {RUNES.map((r, i) => {
            const angle = (i / RUNES.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * 118;
            const y = Math.sin(angle) * 88;
            const isLit = lit.includes(r.id);
            return (
              <motion.button
                key={r.id}
                type="button"
                onClick={() => activate(r.id)}
                aria-label={`Cổ ngữ ${r.name}${isLit ? ' (đã thắp sáng)' : ''}`}
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2"
                style={{
                  x,
                  y,
                  borderColor: isLit ? r.color : 'rgba(185,168,232,0.35)',
                  background: isLit
                    ? `radial-gradient(circle, ${r.color}66, rgba(10,14,31,0.9))`
                    : 'rgba(10,14,31,0.7)',
                  boxShadow: isLit ? `0 0 26px ${r.color}` : 'none',
                }}
                animate={!reducedMotion && !isLit ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }}
              >
                <span className="font-display text-2xl" style={{ color: isLit ? '#FFF4E6' : r.color }} aria-hidden="true">
                  {r.glyph}
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="text-sm tracking-widest text-lavender/80" aria-hidden="true">
          {lit.length}/3 cổ ngữ đã thắp sáng
        </p>

        <AnimatePresence>
          {revealed && (
            <motion.figure
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full rounded-2xl border border-lavender/30 bg-deepblue/70 px-5 py-4 text-center backdrop-blur-sm"
            >
              <blockquote className="font-display text-lg italic leading-8 text-lavender">
                “{secret}”
              </blockquote>
            </motion.figure>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revealed && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                sfx.sparkle();
                onNext();
              }}
              className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
            >
              Tới món quà →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
