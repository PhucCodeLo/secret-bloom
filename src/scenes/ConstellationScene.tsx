import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LightBurst from '../components/atmosphere/LightBurst';
import type { Sfx } from '../types';
import { pickSceneBlessing } from '../data/sceneBlessings';

interface ConstellationSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onSceneBlessing?: (key: string, text: string) => void;
  onNext: () => void;
}

// 7 stars: center + 6 petals forming a flower. Connect in order 0→6.
const STARS = [
  { x: 50, y: 46 }, // center
  { x: 50, y: 16 }, // petal top
  { x: 76, y: 31 },
  { x: 76, y: 61 },
  { x: 50, y: 76 },
  { x: 24, y: 61 },
  { x: 24, y: 31 },
];

const QUALITIES = [
  'bản sắc',
  'trí tuệ',
  'can đảm',
  'sáng tạo',
  'tự do',
  'ước mơ',
  'yêu thương',
];

const INSCRIPTION_KEY = 'constellation';

export default function ConstellationScene({ sfx, reducedMotion, collect, onSceneBlessing, onNext }: ConstellationSceneProps) {
  const [connected, setConnected] = useState<number[]>([]);
  const [preview, setPreview] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [complete, setComplete] = useState(false);
  // One random blessing variant per playthrough.
  const inscription = useMemo(() => pickSceneBlessing(INSCRIPTION_KEY), []);
  useEffect(() => {
    if (complete) onSceneBlessing?.(INSCRIPTION_KEY, inscription);
  }, [complete, inscription, onSceneBlessing]);
  const timers = useRef<number[]>([]);

  const expected = connected.length; // next star index

  const tapStar = (i: number) => {
    if (complete) return;
    if (preview) setPreview(false);
    if (i === expected) {
      const next = [...connected, i];
      setConnected(next);
      sfx.chime();
      if (next.length === STARS.length) {
        window.setTimeout(() => {
          setComplete(true);
          sfx.success();
          sfx.swell();
          collect('constellation');
        }, reducedMotion ? 200 : 900);
      }
    } else {
      // gentle feedback: the would-be line shimmers and fades, progress kept
      sfx.pop();
      setMistakes((m) => m + 1);
      const el = document.getElementById(`cstar-${i}`);
      el?.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.5)', opacity: 0.4 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 500 },
      );
    }
  };

  const replayPreview = () => {
    setPreview(true);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    timers.current.push(window.setTimeout(() => setPreview(false), 4200));
  };

  const lines = connected.slice(1).map((starIdx, k) => {
    const a = STARS[connected[k]];
    const b = STARS[starIdx];
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: k };
  });

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-5 text-center"
      >
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Hồi IX — Chòm sao của nàng
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Chòm sao <span className="text-champagne">của nàng</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Nối bảy vì sao theo thứ tự ánh sáng dẫn — từ nhụy hoa ra từng cánh —
            để vẽ nên đóa hoa của riêng bạn.
          </p>
        </div>

        <div className="relative h-[340px] w-full max-w-[340px]">
          <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* faint guide lines */}
            {STARS.slice(1).map((s, k) => {
              const a = STARS[k === 0 ? 0 : k];
              return (
                <line
                  key={k}
                  x1={a.x}
                  y1={a.y}
                  x2={s.x}
                  y2={s.y}
                  stroke="rgba(243,215,155,0.12)"
                  strokeWidth="0.5"
                  strokeDasharray="1.5 1.5"
                />
              );
            })}
            {/* drawn constellation lines */}
            {lines.map((l) => (
              <motion.line
                key={l.key}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#F3D79B"
                strokeWidth="1.1"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(243,215,155,0.9))' }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </svg>

          {STARS.map((s, i) => {
            const isConnected = connected.includes(i);
            const isNext = i === expected && !complete;
            const isPreview = preview && !complete;
            return (
              <button
                key={i}
                id={`cstar-${i}`}
                type="button"
                onClick={() => tapStar(i)}
                disabled={complete}
                aria-label={`Vì sao ${i + 1}: ${QUALITIES[i]}${isConnected ? ' (đã nối)' : ''}`}
                className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                <motion.span
                  className="flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm"
                  style={{
                    borderColor: isConnected ? '#F3D79B' : isNext ? '#FFF4E6' : 'rgba(243,215,155,0.4)',
                    background: isConnected
                      ? 'radial-gradient(circle, #FFF4E6, #F3D79B 70%)'
                      : 'rgba(10,14,31,0.7)',
                    color: isConnected ? '#1a1206' : '#F3D79B',
                    boxShadow: isConnected
                      ? '0 0 18px rgba(243,215,155,0.9)'
                      : isNext
                        ? '0 0 14px rgba(255,244,230,0.7)'
                        : 'none',
                  }}
                  animate={
                    isPreview
                      ? { scale: [1, 1.45, 1], opacity: [0.6, 1, 0.6] }
                      : isNext && !reducedMotion
                        ? { scale: [1, 1.2, 1] }
                        : { scale: 1 }
                  }
                  transition={
                    isPreview
                      ? { duration: 0.9, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' }
                      : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  aria-hidden="true"
                >
                  {isConnected ? '✦' : i + 1}
                </motion.span>
              </button>
            );
          })}

          {complete && <LightBurst burstKey="constellation" size={340} />}
        </div>

        <p className="text-sm text-ivory/60" role="status" aria-live="polite">
          {complete
            ? 'Chòm sao đã hoàn thành ✦'
            : connected.length >= STARS.length
              ? 'Đang vẽ nên đóa hoa…'
              : `Đã nối ${connected.length}/7 vì sao${connected.length > 0 ? ` — tiếp theo: ${QUALITIES[expected]}` : ''}`}
        </p>
        {!complete && (
          <button type="button" onClick={replayPreview} className="btn-ghost rounded-full px-6 py-2 text-sm">
            Xem lại thứ tự
          </button>
        )}
        {mistakes >= 2 && !complete && (
          <p className="text-sm text-ivory/55">
            Gợi ý: hãy nối từ <strong className="text-champagne">nhụy hoa</strong> (giữa) ra các cánh theo chiều kim đồng hồ.
          </p>
        )}

        <AnimatePresence>
          {complete && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <figure className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-5 py-4 text-center">
                <blockquote className="font-display text-base italic leading-7 text-ivory/90">
                  “{inscription}”
                </blockquote>
              </figure>
              <button
                type="button"
                onClick={() => {
                  sfx.sparkle();
                  onNext();
                }}
                className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
              >
                Tiếp tục →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
