import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Sfx } from '../types';
import { RELICS, VIRTUES, type VirtueId } from '../gift/types';
import { useGiftOptional } from '../gift/GiftContext';
import type { GardenApi } from '../garden/useGarden';
import { SEED_GLYPH, SEED_LABEL, seedStage } from '../garden/types';

interface GroveSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  garden: GardenApi;
  onNext: () => void;
}

const GROVE: Record<
  VirtueId,
  { color: string; glow: string; message: string }
> = {
  love: {
    color: '#F4A0BC',
    glow: 'rgba(244,160,188,0.35)',
    message:
      'Bạn dừng lại bên đóa hoa yêu thương. Nó nở chậm rãi, từng cánh một — như cách tình cảm chân thành vẫn lớn lên: không ồn ào, không điều kiện. Hãy ôm lấy những người bạn thương khi còn có thể, và đừng quên ôm cả chính mình.',
  },
  gratitude: {
    color: '#F3D79B',
    glow: 'rgba(243,215,155,0.35)',
    message:
      'Bạn dừng lại bên đóa hoa trân trọng. Dưới ánh sáng dịu, bạn chợt nhớ ra bao điều tốt đẹp mình vẫn xem là hiển nhiên: một mái nhà, một bữa cơm, một người luôn chờ cửa. Biết ơn không làm cuộc đời bớt khó — nhưng làm lòng mình bớt nặng.',
  },
  joy: {
    color: '#8FD8C9',
    glow: 'rgba(143,216,201,0.35)',
    message:
      'Bạn dừng lại bên đóa hoa hạnh phúc. Nó rung rinh trong gió như đang cười — nhắc bạn rằng niềm vui không phải phần thưởng cuối đường, mà là quyền được tận hưởng từng bước đi. Hôm nay, hãy cho phép mình vui vì những điều nhỏ bé.',
  },
};

/**
 * Hidden scene: only reachable after deepening one virtue in the garden.
 * A quiet interstitial — one flower, one message, one relic — before the pond.
 */
export default function GroveScene({ sfx, reducedMotion, collect, garden, onNext }: GroveSceneProps) {
  const giftSession = useGiftOptional();
  const virtue = (giftSession?.journey?.choices.virtue as VirtueId | undefined) ?? 'love';
  const g = GROVE[virtue] ?? GROVE.love;
  const relicId = `virtue-seed-${virtue}` as const;
  const relic = RELICS[relicId];

  // THE GARDEN KNOWS: the hidden grove stays restored once opened.
  useEffect(() => {
    garden.restoreArea('grove');
    garden.unlockPath('grove');
    collect('grove-restored');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stage = seedStage(garden.state.seed, giftSession?.journey ?? null);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
          Nơi ẩn — Khu vườn tâm ý
        </p>

        {/* the deepened flower */}
        <motion.div
          className="relative flex h-44 w-44 items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${g.glow} 0%, transparent 70%)`,
            }}
          />
          <motion.span
            className="font-display text-8xl"
            style={{ color: g.color, textShadow: `0 0 40px ${g.glow}` }}
            animate={reducedMotion ? {} : { scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            ❀
          </motion.span>
        </motion.div>

        <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
          {VIRTUES[virtue].name} <span style={{ color: g.color }}>sâu thẳm</span>
        </h2>

        <figure className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-5 py-4">
          <blockquote className="font-display text-base italic leading-7 text-ivory/90">
            “{g.message}”
          </blockquote>
        </figure>

        <p className="text-sm text-ivory/60">
          <span aria-hidden="true">{relic.glyph}</span> Đã nhận: {relic.name} — trong nhật ký ✦
        </p>

        {/* the planted seed, growing with the journey */}
        {garden.state.seed && (
          <div
            className="flex items-center gap-3 rounded-2xl border border-champagne/25 bg-midnight/40 px-5 py-3"
            role="status"
          >
            <motion.span
              aria-hidden="true"
              className="text-2xl"
              animate={reducedMotion ? {} : { y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 8px ${g.glow})` }}
            >
              {SEED_GLYPH[stage]}
            </motion.span>
            <p className="text-left text-sm text-ivory/70">
              {SEED_LABEL[stage]} — hạt giống bạn gieo ở khu vườn sống.
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
          Tiếp tục hành trình →
        </button>
      </motion.div>
    </div>
  );
}
