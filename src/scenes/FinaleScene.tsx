import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import LightBurst from '../components/atmosphere/LightBurst';
import type { CollectibleDef } from '../data/registry';
import type { Sfx } from '../types';
import { ENDINGS, type EndingId, type VirtueId } from '../gift/types';
import { useGiftOptional } from '../gift/GiftContext';
import type { GardenApi } from '../garden/useGarden';
import { SEED_LABEL } from '../garden/types';
import FinaleFlower from '../components/FinaleFlower';
import { pickFinaleFlower } from '../data/finaleFlowers';

interface FinaleSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  objects: CollectibleDef[];
  endingId?: EndingId | null;
  garden: GardenApi;
  onNext: () => void;
}

type Stage = 'gather' | 'converge' | 'bloom' | 'radiant';

// fixed meadow positions for the wave of awakening (percent coords)
const MEADOW: Array<{ x: number; y: number }> = [
  { x: 8, y: 78 }, { x: 20, y: 88 }, { x: 34, y: 80 }, { x: 48, y: 88 },
  { x: 62, y: 80 }, { x: 76, y: 88 }, { x: 90, y: 78 }, { x: 14, y: 64 },
  { x: 30, y: 68 }, { x: 70, y: 68 }, { x: 86, y: 64 }, { x: 6, y: 52 },
  { x: 94, y: 52 }, { x: 22, y: 40 }, { x: 78, y: 40 }, { x: 40, y: 30 },
  { x: 60, y: 30 }, { x: 50, y: 18 },
];

const dist = (x: number, y: number) => Math.hypot(x - 50, y - 55);

/**
 * The thousand-bloom finale: every collected object flies home to the
 * garden's heart, converges into a giant bloom — a different flower species
 * every playthrough — and a wave of light
 * awakens the whole garden. Then the visitor creates their card.
 */
export default function FinaleScene({ sfx, reducedMotion, objects, endingId, garden, onNext }: FinaleSceneProps) {
  const [stage, setStage] = useState<Stage>('gather');
  const [showCta, setShowCta] = useState(false);
  const timers = useRef<number[]>([]);
  const stageRef = useRef<Stage>('gather');
  stageRef.current = stage;
  const ending = endingId ? ENDINGS[endingId] : null;
  const whisper = useGiftOptional()?.journey?.wishText?.trim() || null;
  // THE GARDEN KNOWS: the planted seed reaches full bloom here, in its virtue's color.
  const seedVirtue = garden.state.seed?.virtue as VirtueId | undefined;
  const SEED_COLOR: Record<VirtueId, string> = {
    love: '#F4A0BC',
    gratitude: '#F3D79B',
    joy: '#8FD8C9',
  };
  const seedColor = seedVirtue ? SEED_COLOR[seedVirtue] : null;
  // A different flower species blooms for every visitor, every playthrough.
  const flower = useMemo(() => pickFinaleFlower(), []);

  useEffect(() => {
    const t = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, reducedMotion ? Math.min(ms, 600) : ms));
    };
    // gather → converge → bloom → radiant, then reveal the CTA
    t(4200, () => {
      if (stageRef.current === 'gather') {
        setStage('converge');
        sfx.reveal();
      }
    });
    t(6800, () => {
      if (stageRef.current === 'converge') {
        setStage('bloom');
        sfx.swell();
      }
    });
    t(11200, () => {
      if (stageRef.current === 'bloom') {
        setStage('radiant');
        sfx.success();
      }
    });
    t(13600, () => setShowCta(true));
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = objects.length;
  const gathering = stage === 'gather';
  const converged = stage !== 'gather';

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-8 z-10 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
          Hồi XIV — Vườn hoa bừng nở
        </p>
        <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
          Ngàn đóa hoa <span className="text-champagne">vì bạn</span>
        </h2>
      </div>

      {/* the garden that remembers */}
      <div className="relative h-[62vh] min-h-[420px] w-full max-w-md">
        {/* ground glow */}
        <motion.div
          className="absolute inset-x-4 bottom-0 top-[55%] rounded-[50%]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(20,32,58,0.9), rgba(6,9,18,0.4) 70%, transparent)',
          }}
          animate={{ opacity: stage === 'radiant' ? [0.7, 1, 0.85] : 0.7 }}
          transition={stage === 'radiant' ? { duration: 3, repeat: Infinity } : {}}
          aria-hidden="true"
        />

        {/* meadow flowers awakening in waves from the center */}
        {MEADOW.map((m, i) => {
          const lit = stage === 'bloom' || stage === 'radiant';
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              initial={{ opacity: 0.15, scale: 0.6 }}
              animate={
                lit
                  ? { opacity: [0.15, 1], scale: [0.6, 1.15, 1] }
                  : { opacity: 0.15, scale: 0.6 }
              }
              transition={{ delay: reducedMotion ? 0 : dist(m.x, m.y) / 90, duration: 1.2 }}
              aria-hidden="true"
            >
              <span
                className="font-display text-xl"
                style={{
                  color: lit ? '#F4A0BC' : 'rgba(244,160,188,0.35)',
                  textShadow: lit ? '0 0 12px rgba(244,160,188,0.9)' : 'none',
                }}
              >
                ❀
              </span>
            </motion.div>
          );
        })}

        {/* THE GARDEN KNOWS: the planted seed blooms at the garden's heart */}
        {seedColor && (
          <motion.div
            className="absolute z-10"
            style={{ left: '50%', top: '52%', x: '-50%', y: '-50%' }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              stage === 'bloom' || stage === 'radiant'
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.4 }
            }
            transition={{ duration: 1.6, ease: 'easeOut' }}
            role="img"
            aria-label={SEED_LABEL[3]}
          >
            <motion.span
              className="font-display text-7xl"
              style={{ color: seedColor, textShadow: `0 0 34px ${seedColor}` }}
              animate={reducedMotion ? {} : { scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              ❀
            </motion.span>
          </motion.div>
        )}

        {/* constellation overhead (if earned) */}
        {objects.some((o) => o.id === 'constellation') && (
          <div className="absolute inset-x-0 top-0 h-[30%]" aria-hidden="true">
            {[
              { x: 50, y: 40 }, { x: 38, y: 22 }, { x: 62, y: 22 },
              { x: 30, y: 55 }, { x: 70, y: 55 }, { x: 50, y: 70 },
            ].map((s, i) => (
              <motion.span
                key={i}
                className="absolute font-display text-sm text-champagne"
                style={{ left: `${s.x}%`, top: `${s.y}%`, textShadow: '0 0 10px rgba(243,215,155,0.9)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: stage === 'radiant' ? 1 : 0.35 }}
                transition={{ delay: i * 0.2, duration: 1 }}
              >
                ✦
              </motion.span>
            ))}
          </div>
        )}

        {/* collected objects flying home */}
        {objects.map((o, i) => {
          const angle = n <= 1 ? 0 : (i / n) * Math.PI * 2 - Math.PI / 2;
          const sx = Math.cos(angle) * 44;
          const sy = Math.sin(angle) * 34 + 6;
          const mx = sx * 0.45 + (i % 2 === 0 ? 6 : -6);
          const my = sy * 0.45 - 8;
          return (
            <motion.div
              key={o.id}
              className="absolute left-1/2 top-[52%]"
              style={{ zIndex: 20 }}
              initial={{ x: `${sx}vw`, y: `${sy}vh`, opacity: 0, scale: 0.6 }}
              animate={
                gathering
                  ? {
                      x: [`${sx}vw`, `${mx}vw`, '0vw'],
                      y: [`${sy}vh`, `${my}vh`, '0vh'],
                      opacity: [0, 1, 1],
                      scale: [0.6, 1, 1],
                    }
                  : { x: '0vw', y: '0vh', opacity: 0, scale: 0.3 }
              }
              transition={
                gathering
                  ? {
                      duration: reducedMotion ? 0.6 : 3.2,
                      delay: i * 0.22,
                      times: [0, 0.55, 1],
                      ease: 'easeInOut',
                    }
                  : { duration: 0.8, ease: 'easeIn' }
              }
              aria-hidden="true"
            >
              <span
                className="font-display text-2xl"
                style={{ color: o.color, textShadow: `0 0 14px ${o.color}` }}
              >
                {o.glyph}
              </span>
            </motion.div>
          );
        })}

        {/* convergence core */}
        {converged && (
          <motion.div
            className="absolute left-1/2 top-[52%] z-20 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: stage === 'bloom' || stage === 'radiant' ? [1, 1.35, 1.1] : 1,
              opacity: 1,
            }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
            aria-hidden="true"
          >
            <div
              className="h-24 w-24 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, #FFF8EA 0%, rgba(243,215,155,0.75) 40%, rgba(243,215,155,0) 72%)',
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        )}

        {/* the giant rose */}
        {(stage === 'bloom' || stage === 'radiant') && (
          <motion.div
            className="absolute left-1/2 top-[52%] z-30 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: reducedMotion ? 0.6 : 2.6, ease: 'easeOut' }}
            aria-hidden="true"
          >
            <LightBurst burstKey="finale-rose" size={380} />
            <FinaleFlower species={flower} />
          </motion.div>
        )}

        {/* expanding light waves */}
        {(stage === 'bloom' || stage === 'radiant') &&
          [0, 1, 2].map((w) => (
            <motion.div
              key={w}
              className="absolute left-1/2 top-[52%] z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-champagne/60"
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0.8 : 2.8,
                delay: w * 0.7,
                repeat: stage === 'radiant' ? Infinity : 0,
                repeatDelay: 1.2,
                ease: 'easeOut',
              }}
              aria-hidden="true"
            />
          ))}

        {/* rising petals */}
        {stage === 'radiant' &&
          !reducedMotion &&
          Array.from({ length: 22 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute z-10 h-2.5 w-2 rounded-full"
              style={{
                left: `${6 + ((i * 37) % 88)}%`,
                top: '92%',
                background: i % 3 === 0 ? '#F4A0BC' : i % 3 === 1 ? '#F3D79B' : '#B9A8E8',
              }}
              initial={{ y: 0, opacity: 0, rotate: 0 }}
              animate={{ y: '-70vh', opacity: [0, 1, 1, 0], rotate: 300 + i * 40 }}
              transition={{
                duration: 7 + (i % 5),
                delay: (i % 8) * 0.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              aria-hidden="true"
            />
          ))}
      </div>

      {/* closing message + CTA */}
      <div className="z-30 mt-2 flex min-h-[7rem] flex-col items-center gap-4 text-center">
        {(stage === 'bloom' || stage === 'radiant') && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center gap-2"
            role="status"
          >
            {ending && (
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
                Kết thúc: {ending.name}
              </p>
            )}
            <p className="font-display max-w-sm text-xl italic leading-8 text-champagne">
              {ending
                ? ending.message
                : 'Mọi kỷ niệm đã trở về — khu vườn bừng nở, vì bạn đã đi qua.'}
            </p>
            <p className="max-w-sm text-sm italic leading-6 text-ivory/70">
              ❀ Đóa hoa dành cho bạn: <span className="font-medium not-italic text-champagne">{flower.name}</span> — {flower.meaning}.
            </p>
            {whisper && (
              <p className="max-w-sm text-sm italic leading-6 text-ivory/70">
                Điều ước bạn đã thì thầm: “{whisper}”
              </p>
            )}
            {seedColor && (
              <p className="max-w-sm text-sm italic leading-6 text-ivory/70">
                {SEED_LABEL[3]} — từ hạt giống bạn đã gieo ở khu vườn sống.
              </p>
            )}
          </motion.div>
        )}
        {showCta && (
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
            Khám phá tiếp →
          </motion.button>
        )}
      </div>
    </div>
  );
}
