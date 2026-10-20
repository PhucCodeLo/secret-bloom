import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Sfx } from '../types';
import { CHOICES, type ChoiceOption } from '../gift/types';
import { useGiftOptional } from '../gift/GiftContext';
import ChoicePoint from '../gift/ChoicePoint';
import type { GardenApi } from '../garden/useGarden';

const PATH_DEF = CHOICES.find((c) => c.id === 'path')!;

interface CrossingSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  garden: GardenApi;
  onNext: () => void;
}

// Waypoint positions along a winding path (% of container)
const WAYPOINTS = [
  { x: 18, y: 78 },
  { x: 42, y: 58 },
  { x: 62, y: 66 },
  { x: 80, y: 38 },
];

export default function CrossingScene({ sfx, reducedMotion, collect, garden, onNext }: CrossingSceneProps) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(0);
  const [wisp, setWisp] = useState<{ x: number; y: number } | null>(null);
  const [butterfly, setButterfly] = useState(false);
  const [butterflyCaught, setButterflyCaught] = useState(false);
  const [inscription, setInscription] = useState(false);
  const timers = useRef<number[]>([]);

  // the butterfly flutters across once, a few seconds in
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setButterfly(true), 5000);
    const id2 = window.setTimeout(() => setButterfly(false), 14000);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(id2);
    };
  }, [reducedMotion]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const tapWaypoint = (i: number) => {
    if (i !== active || done > i) return;
    const wp = WAYPOINTS[i];
    setWisp({ x: wp.x, y: wp.y });
    sfx.chime();
    timers.current.push(
      window.setTimeout(() => {
        const next = i + 1;
        setDone(next);
        setActive(next);
        setWisp(null);
        if (next >= WAYPOINTS.length) {
          sfx.success();
          collect('firefly-path');
        }
      }, reducedMotion ? 150 : 700),
    );
  };

  const catchButterfly = () => {
    if (butterflyCaught) return;
    setButterflyCaught(true);
    setButterfly(false);
    sfx.sparkle();
    collect('butterfly');
  };

  const readInscription = () => {
    // toggle: tap again to dismiss the text so it never blocks the path
    setInscription((v) => {
      if (!v) {
        sfx.reveal();
        collect('inscription');
      }
      return !v;
    });
  };

  const finished = done >= WAYPOINTS.length;
  const giftSession = useGiftOptional();
  const pathChoice = giftSession?.journey?.choices.path;

  const choosePath = (opt: ChoiceOption) => {
    giftSession?.choose('path', opt.id);
    giftSession?.collectRelic(opt.relicId);
    collect(`relic-${opt.relicId}`);
    // THE GARDEN KNOWS: the chosen path stays illuminated.
    garden.restoreArea('crossing');
    collect('crossing-restored');
    sfx.sparkle();
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      {/* no skip control: follow the waypoints; the path is short and guided */}

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4">
        <div className="text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Hồi III — Lối đi trăng
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Lối đi <span className="text-champagne">trăng</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Hãy lần theo những đốm sáng — chạm vào từng điểm theo thứ tự đom đóm dẫn đường.
          </p>
        </div>

        {/* the path */}
        <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-champagne/15 bg-midnight/40">
          {/* winding path */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              d="M18 78 Q30 68 42 58 Q52 52 62 66 Q72 78 80 38"
              fill="none"
              stroke="rgba(243,215,155,0.28)"
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
          </svg>
          {/* THE GARDEN KNOWS: the chosen path stays illuminated, restored from memory on revisit */}
          {garden.state.restored.includes('crossing') && pathChoice && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path
                d="M18 78 Q30 68 42 58 Q52 52 62 66 Q72 78 80 38"
                fill="none"
                stroke={pathChoice === 'fireflies' ? '#F3D79B' : '#B9A8E8'}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.85"
                style={{
                  filter: `drop-shadow(0 0 6px ${pathChoice === 'fireflies' ? '#F3D79B' : '#B9A8E8'})`,
                }}
              />
              {pathChoice === 'fireflies' ? (
                <>
                  <circle cx="30" cy="68" r="1.6" fill="#FFE9B8" opacity="0.9" />
                  <circle cx="52" cy="55" r="1.3" fill="#FFE9B8" opacity="0.7" />
                  <circle cx="70" cy="70" r="1.6" fill="#FFE9B8" opacity="0.9" />
                  <circle cx="78" cy="45" r="1.2" fill="#FFE9B8" opacity="0.7" />
                </>
              ) : (
                <>
                  <circle cx="30" cy="68" r="2.2" fill="#DCD2FF" opacity="0.5" />
                  <circle cx="62" cy="63" r="2.6" fill="#DCD2FF" opacity="0.4" />
                  <circle cx="78" cy="45" r="2" fill="#DCD2FF" opacity="0.5" />
                </>
              )}
            </svg>
          )}

          {/* inscription stone */}
          <button
            type="button"
            onClick={readInscription}
            aria-label={inscription ? 'Ẩn minh văn' : 'Phiến đá có minh văn'}
            className="absolute flex h-14 w-14 items-center justify-center rounded-xl border border-lavenderdeep/50 bg-deepblue/70"
            style={{ left: '8%', top: '30%' }}
          >
            <span className="font-display text-xl text-lavender" aria-hidden="true">❖</span>
          </button>
          <AnimatePresence>
            {inscription && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
                onClick={() => setInscription(false)}
                className="absolute left-[8%] top-[52%] z-10 max-w-[180px] cursor-pointer rounded-xl border border-champagne/25 bg-midnight/80 px-3 py-2 text-left font-display text-sm italic text-champagne"
              >
                “Nơi ánh sáng đi qua, hoa sẽ nở.”
              </motion.p>
            )}
          </AnimatePresence>

          {/* waypoints */}
          {WAYPOINTS.map((wp, i) => {
            const isActive = i === active && !finished;
            const isDone = i < done;
            return (
              <button
                key={i}
                type="button"
                onClick={() => tapWaypoint(i)}
                disabled={!isActive}
                aria-label={`Điểm sáng ${i + 1}${isDone ? ' (đã qua)' : ''}`}
                className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
              >
                <motion.span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: isDone
                      ? 'radial-gradient(circle, #FFF4E6, #F3D79B)'
                      : isActive
                        ? 'radial-gradient(circle, #FFF8EA 30%, rgba(243,215,155,0.5) 70%)'
                        : 'radial-gradient(circle, rgba(243,215,155,0.25), rgba(243,215,155,0.05))',
                    border: '1.5px solid rgba(243,215,155,0.6)',
                    boxShadow: isActive ? '0 0 24px rgba(243,215,155,0.7)' : 'none',
                  }}
                  animate={isActive && !reducedMotion ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  aria-hidden="true"
                >
                  <span className="text-sm text-champagne">{isDone ? '✓' : '✦'}</span>
                </motion.span>
              </button>
            );
          })}

          {/* travelling wisp */}
          {wisp && !reducedMotion && (
            <motion.span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${wisp.x}%`,
                top: `${wisp.y}%`,
                background: 'radial-gradient(circle, #FFF4E6, rgba(243,215,155,0.4))',
                boxShadow: '0 0 16px rgba(243,215,155,0.9)',
              }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.4, 1], opacity: [0, 1, 0.9] }}
              transition={{ duration: 0.7 }}
              aria-hidden="true"
            />
          )}

          {/* hidden butterfly */}
          {butterfly && !butterflyCaught && (
            <motion.button
              type="button"
              onClick={catchButterfly}
              aria-label="Bắt con bướm đêm"
              className="absolute z-10 flex h-12 w-12 items-center justify-center"
              style={{ top: '20%' }}
              initial={{ left: '-10%' }}
              animate={{ left: '105%' }}
              transition={{ duration: 9, ease: 'linear' }}
            >
              <motion.span
                className="font-display text-2xl text-rose"
                style={{ textShadow: '0 0 12px rgba(244,160,188,0.9)' }}
                animate={reducedMotion ? {} : { y: [0, -10, 0, 8, 0], rotate: [0, 12, -8, 0] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                aria-hidden="true"
              >
                ❧
              </motion.span>
            </motion.button>
          )}
          {butterflyCaught && (
            <p className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-rose/40 bg-midnight/80 px-4 py-1.5 text-sm text-rose">
              Đã ghi vào nhật ký: Bướm đêm ✦
            </p>
          )}
        </div>

        <p className="text-sm tracking-widest text-champagne/80" aria-hidden="true">
          {done}/{WAYPOINTS.length} điểm sáng
        </p>

        <AnimatePresence>
          {finished && !pathChoice && (
            <ChoicePoint def={PATH_DEF} onChoose={choosePath} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {finished && pathChoice && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <ChoicePoint def={PATH_DEF} chosenId={pathChoice} onChoose={() => {}} />
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  sfx.sparkle();
                  onNext();
                }}
                className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
              >
                Vào khu vườn →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
