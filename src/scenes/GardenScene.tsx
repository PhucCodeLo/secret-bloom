import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Flower, { type FlowerPalette } from '../components/Flower';
import ProgressIndicator from '../components/ProgressIndicator';
import LightBurst from '../components/atmosphere/LightBurst';
import RoseSilhouette from '../components/atmosphere/RoseSilhouette';
import type { Sfx } from '../types';
import { CHOICES, type ChoiceOption, type VirtueId } from '../gift/types';
import { useGiftOptional } from '../gift/GiftContext';
import ChoicePoint from '../gift/ChoicePoint';
import type { GardenApi } from '../garden/useGarden';
import { SEED_GLYPH, SEED_LABEL, seedStage } from '../garden/types';
import { pickSceneBlessing } from '../data/sceneBlessings';

const VIRTUE_DEF = CHOICES.find((c) => c.id === 'virtue')!;

interface GardenSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  garden: GardenApi;
  onSceneBlessing?: (key: string, text: string) => void;
  onNext: () => void;
}

interface VirtueFlower {
  id: string;
  virtue: string;
  name: string;
  palette: FlowerPalette;
  blessingKey: string;
}

const FLOWERS: VirtueFlower[] = [
  {
    id: 'love',
    blessingKey: 'virtue-love',
    virtue: 'YÊU THƯƠNG',
    name: 'Hoa Yêu thương',
    palette: { petal: '#F4A0BC', petalDark: '#C96A8E', center: '#F3D79B', glow: '#F4A0BC' },
  },
  {
    id: 'gratitude',
    blessingKey: 'virtue-gratitude',
    virtue: 'TRÂN TRỌNG',
    name: 'Hoa Trân trọng',
    palette: { petal: '#F3D79B', petalDark: '#DCA47A', center: '#FFF4E6', glow: '#F3D79B' },
  },
  {
    id: 'joy',
    blessingKey: 'virtue-joy',
    virtue: 'HẠNH PHÚC',
    name: 'Hoa Hạnh phúc',
    palette: { petal: '#B9A8E8', petalDark: '#8F7CC9', center: '#F4A0BC', glow: '#B9A8E8' },
  },
];

function ChargeFlower({
  flower,
  bloomed,
  reducedMotion,
  onChargeComplete,
  onShowMessage,
}: {
  flower: VirtueFlower;
  bloomed: boolean;
  reducedMotion: boolean;
  onChargeComplete: () => void;
  onShowMessage: () => void;
}) {
  const [charge, setCharge] = useState(0);
  const raf = useRef(0);
  const start = useRef(0);
  const charging = useRef(false);

  const cancel = () => {
    charging.current = false;
    cancelAnimationFrame(raf.current);
    setCharge(0);
  };

  const tick = () => {
    if (!charging.current) return;
    const p = Math.min(1, (performance.now() - start.current) / 1100);
    setCharge(p);
    if (p >= 1) {
      charging.current = false;
      setCharge(0);
      onChargeComplete();
    } else {
      raf.current = requestAnimationFrame(tick);
    }
  };

  const begin = () => {
    if (bloomed) {
      onShowMessage();
      return;
    }
    if (charging.current) return;
    charging.current = true;
    start.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const R = 56;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role="button"
        tabIndex={0}
        aria-label={bloomed ? `${flower.name} (đã nở) — chạm để xem lại` : `${flower.name} — nhấn giữ để đánh thức`}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            begin();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') cancel();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="relative touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-champagne/70 rounded-full"
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {/* charge ring */}
        <svg viewBox="0 0 128 128" className="absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] -rotate-90" aria-hidden="true">
          <circle cx="64" cy="64" r={R} fill="none" stroke={charge > 0 ? 'rgba(243,215,155,0.25)' : 'transparent'} strokeWidth="3" />
          <circle
            cx="64"
            cy="64"
            r={R}
            fill="none"
            stroke={flower.palette.glow}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - charge)}
            style={{ filter: `drop-shadow(0 0 6px ${flower.palette.glow})` }}
          />
        </svg>
        <div className={charge > 0 && !reducedMotion ? 'scale-110 transition-transform duration-200' : 'transition-transform duration-200'}>
          <Flower name={flower.name} palette={flower.palette} open={bloomed} onSelect={() => {}} disabled />
        </div>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.25em]" style={{ color: flower.palette.glow }}>
        {flower.virtue}
      </p>
    </div>
  );
}

export default function GardenScene({ sfx, reducedMotion, collect, garden, onSceneBlessing, onNext }: GardenSceneProps) {
  // One random blessing variant per virtue, per playthrough.
  const blessings = useMemo(
    () => ({
      love: pickSceneBlessing('virtue-love'),
      gratitude: pickSceneBlessing('virtue-gratitude'),
      joy: pickSceneBlessing('virtue-joy'),
    }),
    [],
  );
  const showBlessing = (f: VirtueFlower) => {
    const text = blessings[f.id as keyof typeof blessings];
    setActiveMessage(text);
    onSceneBlessing?.(f.blessingKey, text);
  };
  // The three virtue flowers always bloom by the recipient's own press-and-hold,
  // every visit — the interaction is the point. The garden still remembers the
  // blooming in its long-term memory (finale recap, journal) via bloomFlower().
  const [collected, setCollected] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [burstFlower, setBurstFlower] = useState<string | null>(null);
  const [focusFlower, setFocusFlower] = useState<string | null>(null);

  const bloom = (f: VirtueFlower) => {
    if (collected.includes(f.id)) {
      showBlessing(f);
      return;
    }
    const next = [...collected, f.id];
    setCollected(next);
    showBlessing(f);
    setFocusFlower(f.id);
    setBurstFlower(f.id);
    setBurstKey((k) => k + 1);
    window.setTimeout(() => setFocusFlower(null), 1400);
    collect(`flower-${f.id}`);
    garden.bloomFlower(f.id); // the garden remembers
    if (next.length === FLOWERS.length) {
      sfx.success();
      sfx.swell();
    } else sfx.chime();
  };

  const done = collected.length === FLOWERS.length;
  const giftSession = useGiftOptional();
  const virtueChoice = giftSession?.journey?.choices.virtue;

  const chooseVirtue = (opt: ChoiceOption) => {
    giftSession?.choose('virtue', opt.id);
    giftSession?.collectRelic(opt.relicId);
    collect(`relic-${opt.relicId}`);
    sfx.sparkle();
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <div className="pointer-events-none absolute bottom-0 left-[-8%] w-44 opacity-70" aria-hidden="true">
        <RoseSilhouette className="h-40 w-full" opacity={0.9} />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-[-8%] w-44 -scale-x-100 opacity-70" aria-hidden="true">
        <RoseSilhouette className="h-40 w-full" opacity={0.9} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-5"
      >
        <div className="text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Hồi IV &amp; V — Vườn sống · Ba đức hạnh
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Khu vườn <span className="text-rose">sống</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Ba bông hoa của <strong className="text-champagne">Yêu thương</strong>,{' '}
            <strong className="text-champagne">Trân trọng</strong> và{' '}
            <strong className="text-champagne">Hạnh phúc</strong> đang ngủ. Hãy{' '}
            <strong className="text-ivory">nhấn giữ</strong> từng bông để đánh thức.
          </p>
        </div>

        <ProgressIndicator total={3} done={collected.length} label="hoa đã nở" />

        <div className="flex w-full items-start justify-center gap-1 sm:gap-3" role="group" aria-label="Ba bông hoa đức hạnh">
          {FLOWERS.map((f) => {
            const isOpen = collected.includes(f.id);
            return (
              <motion.div
                key={f.id}
                className="relative"
                animate={focusFlower === f.id ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              >
                {burstFlower === f.id && burstKey > 0 && (
                  <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
                    <LightBurst burstKey={`${f.id}-${burstKey}`} color="243,215,155" size={190} />
                  </div>
                )}
                <ChargeFlower
                  flower={f}
                  bloomed={isOpen}
                  reducedMotion={reducedMotion}
                  onChargeComplete={() => bloom(f)}
                  onShowMessage={() => showBlessing(f)}
                />
              </motion.div>
            );
          })}
        </div>

        <div className="flex min-h-[92px] w-full items-center justify-center px-2">
          <AnimatePresence mode="wait">
            {activeMessage && (
              <motion.figure
                key={activeMessage}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.45 }}
                className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-5 py-4 text-center backdrop-blur-sm"
              >
                <blockquote className="font-display text-lg italic leading-8 text-champagne">
                  “{activeMessage}”
                </blockquote>
              </motion.figure>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {done && !virtueChoice && (
            <ChoicePoint def={VIRTUE_DEF} onChoose={chooseVirtue} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {done && virtueChoice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative flex w-full flex-col items-center gap-4"
            >
              {!reducedMotion && <LightBurst burstKey="garden-done" size={320} />}
              <ChoicePoint def={VIRTUE_DEF} chosenId={virtueChoice} onChoose={() => {}} />
              <p className="text-center font-display text-xl text-ivory">
                Cả khu vườn bừng sáng — phía xa, một khu vườn tâm ý vừa hé mở…
              </p>
              {/* Plant a seed — the garden will grow it along the journey */}
              {!garden.state.seed ? (
                <button
                  type="button"
                  onClick={() => {
                    garden.plantSeed(virtueChoice as VirtueId);
                    collect('seed-planted');
                    sfx.swell();
                  }}
                  className="flex min-h-[52px] items-center gap-3 rounded-full border border-champagne/40 bg-deepblue/60 px-8 text-base font-semibold text-champagne transition hover:bg-deepblue"
                >
                  <span aria-hidden="true" className="text-xl">🌰</span>
                  Gieo một hạt giống đức hạnh
                </button>
              ) : (
                <div
                  className="flex items-center gap-3 rounded-2xl border border-champagne/25 bg-midnight/40 px-5 py-3"
                  role="status"
                >
                  <motion.span
                    aria-hidden="true"
                    className="text-2xl"
                    animate={reducedMotion ? {} : { y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {SEED_GLYPH[seedStage(garden.state.seed, giftSession?.journey ?? null)]}
                  </motion.span>
                  <p className="text-sm text-ivory/70">
                    {SEED_LABEL[seedStage(garden.state.seed, giftSession?.journey ?? null)]} — khu vườn đang ấp ủ nó.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  sfx.sparkle();
                  onNext();
                }}
                className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
              >
                Vào khu vườn tâm ý →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
