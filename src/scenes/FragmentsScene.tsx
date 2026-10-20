import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LightBurst from '../components/atmosphere/LightBurst';
import type { Sfx } from '../types';
import { pickSceneBlessing } from '../data/sceneBlessings';

interface FragmentsSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onSceneBlessing?: (key: string, text: string) => void;
  onNext: () => void;
}

interface Fragment {
  id: number;
  color: string;
  points: string;
  // slot position (% of the arrangement circle)
  slotX: number;
  slotY: number;
  // scattered start position (%)
  startX: number;
  startY: number;
}

const FRAGMENTS: Fragment[] = [
  { id: 0, color: '#F4A0BC', points: '50,4 88,52 50,66 12,52', slotX: 50, slotY: 12, startX: 12, startY: 72 },
  { id: 1, color: '#F3D79B', points: '50,4 88,52 50,66 12,52', slotX: 82, slotY: 50, startX: 84, startY: 76 },
  { id: 2, color: '#B9A8E8', points: '50,4 88,52 50,66 12,52', slotX: 50, slotY: 88, startX: 16, startY: 22 },
  { id: 3, color: '#8FD8C9', points: '50,4 88,52 50,66 12,52', slotX: 18, slotY: 50, startX: 82, startY: 20 },
];

const SNAP_PX = 70;

export default function FragmentsScene({ sfx, reducedMotion, collect, onSceneBlessing, onNext }: FragmentsSceneProps) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [assembled, setAssembled] = useState(false);
  // One random blessing variant per playthrough.
  const blessing = useMemo(() => pickSceneBlessing('fragments'), []);
  useEffect(() => {
    if (assembled) onSceneBlessing?.('fragments', blessing);
  }, [assembled, blessing, onSceneBlessing]);
  const [hint, setHint] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const failCount = useRef(0);
  const hintTimer = useRef(0);

  const done = placed.length === FRAGMENTS.length;

  const scheduleHint = () => {
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(true), 25000);
  };

  const handleDragEnd = (f: Fragment, _e: unknown, info: { offset: { x: number; y: number } }) => {
    if (placed.includes(f.id)) return;
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    // fragment's current center in px (start % + drag offset)
    const cx = (f.startX / 100) * rect.width + info.offset.x;
    const cy = (f.startY / 100) * rect.height + info.offset.y;
    const sx = (f.slotX / 100) * rect.width;
    const sy = (f.slotY / 100) * rect.height;
    const dist = Math.hypot(cx - sx, cy - sy);
    if (dist < SNAP_PX) {
      const next = [...placed, f.id];
      setPlaced(next);
      setHint(false);
      sfx.chime();
      if (next.length === FRAGMENTS.length) {
        window.setTimeout(() => {
          setAssembled(true);
          sfx.success();
          collect('crystal-flower');
        }, reducedMotion ? 200 : 700);
      }
    } else {
      failCount.current += 1;
      if (failCount.current >= 3) setHint(true);
      else scheduleHint();
      sfx.pop();
    }
  };

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
            Hồi VII — Mảnh vỡ ánh sáng
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Mảnh vỡ <span className="text-champagne">ánh sáng</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Kéo từng mảnh pha lê vào <strong className="text-ivory">khung viền cùng màu</strong>{' '}
            để hợp nhất chúng thành một đóa hoa.
          </p>
        </div>

        <div ref={areaRef} className="relative h-[380px] w-full max-w-[360px] touch-none select-none">
          {/* slots */}
          {FRAGMENTS.map((f) => {
            const isPlaced = placed.includes(f.id);
            return (
              <div
                key={`slot-${f.id}`}
                className="absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${f.slotX}%`, top: `${f.slotY}%` }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <polygon
                    points={f.points}
                    fill={isPlaced ? `${f.color}44` : 'none'}
                    stroke={f.color}
                    strokeWidth="2"
                    strokeDasharray={isPlaced ? 'none' : '6 4'}
                    opacity={isPlaced ? 0.9 : hint || !isPlaced ? 0.75 : 0.4}
                    className={!reducedMotion && !isPlaced && hint ? 'animate-glow-pulse' : undefined}
                  />
                </svg>
              </div>
            );
          })}

          {/* assembled flower */}
          {assembled && (
            <motion.div
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <LightBurst burstKey="fragments" size={320} />
              <svg viewBox="0 0 200 200" className="h-44 w-44" aria-hidden="true">
                {FRAGMENTS.map((f, i) => (
                  <polygon
                    key={f.id}
                    points={f.points}
                    fill={`${f.color}88`}
                    stroke={f.color}
                    strokeWidth="2"
                    transform={`rotate(${i * 90} 100 100) translate(50 50)`}
                  />
                ))}
                <circle cx="100" cy="100" r="14" fill="#FFF4E6" />
              </svg>
            </motion.div>
          )}

          {/* draggable fragments */}
          {!assembled &&
            FRAGMENTS.filter((f) => !placed.includes(f.id)).map((f) => (
              <motion.div
                key={`frag-${f.id}`}
                className="absolute z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
                style={{ left: `${f.startX}%`, top: `${f.startY}%` }}
                drag
                dragMomentum={false}
                // Snap back to the start position after every drop. Without this,
                // framer-motion keeps the failed drop's transform, and the next
                // gesture's info.offset no longer matches the piece's real
                // position — so re-dragging a missed piece could never snap.
                dragSnapToOrigin
                whileDrag={{ scale: 1.25, zIndex: 30 }}
                onDragEnd={(e, info) => handleDragEnd(f, e, info)}
                role="button"
                tabIndex={0}
                aria-label={`Mảnh pha lê màu — kéo vào khung viền cùng màu`}
                onKeyDown={(e) => {
                  // keyboard fallback: Enter places the fragment directly
                  if (e.key === 'Enter') {
                    const next = [...placed, f.id];
                    setPlaced(next);
                    sfx.chime();
                    if (next.length === FRAGMENTS.length) {
                      setAssembled(true);
                      sfx.success();
                      collect('crystal-flower');
                    }
                  }
                }}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_10px_rgba(243,215,155,0.5)]">
                  <polygon points={f.points} fill={`${f.color}66`} stroke={f.color} strokeWidth="2.5" />
                  <polygon points="50,14 74,48 50,56 26,48" fill="#ffffff" opacity="0.25" />
                </svg>
              </motion.div>
            ))}
        </div>

        <p className="text-sm tracking-widest text-champagne/80" aria-hidden="true">
          {placed.length}/{FRAGMENTS.length} mảnh đã đặt
        </p>
        {hint && !done && (
          <p className="text-sm text-ivory/60">Gợi ý: khung viền đứt nét đang chờ đúng mảnh cùng màu.</p>
        )}

        <AnimatePresence>
          {assembled && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <figure className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-5 py-4 text-center">
                <blockquote className="font-display text-base italic leading-7 text-ivory/90">
                  “{blessing}”
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
