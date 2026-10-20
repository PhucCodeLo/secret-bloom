import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import InteractiveGift from '../components/InteractiveGift';
import type { Sfx } from '../types';
import { CHOICES, type ChoiceOption, type EndingId } from '../gift/types';
import { useGiftOptional } from '../gift/GiftContext';
import ChoicePoint from '../gift/ChoicePoint';

interface UnveilingSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onNext: () => void;
}

const BLOOM_DEF = CHOICES.find((c) => c.id === 'bloom')!;

const WISH_TO_ENDING: Record<string, EndingId> = {
  radiance: 'radiant',
  serenity: 'serene',
  freedom: 'free',
};

export default function UnveilingScene({ sfx, reducedMotion, collect, onNext }: UnveilingSceneProps) {
  const [unveiled, setUnveiled] = useState(false);
  const giftSession = useGiftOptional();
  const bloomChoice = giftSession?.journey?.choices.bloom;
  const [wish, setWish] = useState(giftSession?.journey?.wishText ?? '');
  const WISH_MAX = 120;

  const chooseBloom = (opt: ChoiceOption) => {
    giftSession?.choose('bloom', opt.id);
    giftSession?.collectRelic(opt.relicId);
    collect(`relic-${opt.relicId}`);
    const ending = WISH_TO_ENDING[opt.id];
    if (ending) giftSession?.setEnding(ending);
    sfx.swell();
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      {/* the world grows quieter as the gift takes focus */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 2 }}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
          Hồi XII — Khai mở
        </p>
        {!unveiled && (
          <InteractiveGift
            sfx={sfx}
            reducedMotion={reducedMotion}
            onComplete={() => {
              collect('crystal-heart');
              setUnveiled(true);
            }}
          />
        )}
        <AnimatePresence>
          {unveiled && !bloomChoice && (
            <ChoicePoint def={BLOOM_DEF} onChoose={chooseBloom} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {unveiled && bloomChoice && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <ChoicePoint def={BLOOM_DEF} chosenId={bloomChoice} onChoose={() => {}} />
              {/* Whisper a wish — the recipient's own words, woven into the letter */}
              <div className="w-full rounded-2xl border border-champagne/25 bg-deepblue/60 px-5 py-4 text-left">
                <label htmlFor="wish-whisper" className="mb-1.5 block text-sm font-medium text-champagne">
                  Thì thầm thêm một điều ước <span className="font-normal text-ivory/50">(không bắt buộc)</span>
                </label>
                <textarea
                  id="wish-whisper"
                  value={wish}
                  maxLength={WISH_MAX}
                  rows={2}
                  onChange={(e) => setWish(e.target.value)}
                  placeholder="Viết bằng lời của chính bạn… điều ước này sẽ nở trong thư."
                  className="w-full resize-none rounded-xl border border-champagne/30 bg-midnight/60 px-4 py-3 text-base text-ivory placeholder:text-ivory/35 focus:border-champagne"
                />
                <p className="mt-1 text-right text-xs text-ivory/40">{wish.length}/{WISH_MAX}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const t = wish.trim();
                  if (t) giftSession?.setWishText(t);
                  sfx.sparkle();
                  onNext();
                }}
                className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
              >
                Đọc bức thư →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
