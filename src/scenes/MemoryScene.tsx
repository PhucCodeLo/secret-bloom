import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MemoryGame from '../components/MemoryGame';
import type { Sfx } from '../types';
import { pickSceneBlessing } from '../data/sceneBlessings';

interface MemorySceneProps {
  sfx: Sfx;
  collect: (id: string) => void;
  onSceneBlessing?: (key: string, text: string) => void;
  onComplete: () => void;
}

const LEVELS = [
  { orbs: 3, len: 3, name: 'Khởi đầu', hint: 'Ba viên pha lê, ba nhịp sáng.' },
  { orbs: 4, len: 4, name: 'Thử thách', hint: 'Bốn viên pha lê, bốn nhịp sáng.' },
  { orbs: 4, len: 5, name: 'Cao thủ', hint: 'Bốn viên pha lê, năm nhịp sáng — phần thưởng bí mật chờ bạn.' },
];

const SECRET_REWARD_KEY = 'memory';

export default function MemoryScene({ sfx, collect, onSceneBlessing, onComplete }: MemorySceneProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [levelDone, setLevelDone] = useState(false);
  const [allDone, setAllDone] = useState(false);
  // One random blessing variant per playthrough.
  const secretReward = useMemo(() => pickSceneBlessing(SECRET_REWARD_KEY), []);
  useEffect(() => {
    if (allDone) onSceneBlessing?.(SECRET_REWARD_KEY, secretReward);
  }, [allDone, secretReward, onSceneBlessing]);
  const [hintKey, setHintKey] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const level = LEVELS[levelIdx];
  const isLast = levelIdx === LEVELS.length - 1;

  const playTone = useCallback(
    (kind: 'tap' | 'good' | 'bad' | 'win') => {
      if (kind === 'tap') sfx.pop();
      else if (kind === 'good') sfx.chime();
      else if (kind === 'bad') sfx.error();
      else sfx.success();
    },
    [sfx],
  );

  const handleWin = useCallback(() => {
    setLevelDone(true);
    if (isLast) {
      window.setTimeout(() => {
        setAllDone(true);
        collect('memory-trial');
        collect('secret-reward');
      }, 1400);
    }
  }, [isLast, collect]);

  const nextLevel = () => {
    sfx.sparkle();
    setLevelIdx((i) => i + 1);
    setLevelDone(false);
    setMistakes(0);
    setGameKey((k) => k + 1);
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Hồi VIII — Thử thách ký ức
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Thử thách <span className="text-champagne">ký ức</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            {level.hint}{' '}Ấn sáp sẽ vỡ ra khi bạn vượt qua cả ba cấp độ.
          </p>
        </div>

        {/* level + attempts indicator */}
        <div className="flex items-center gap-4" aria-hidden="true">
          {LEVELS.map((l, i) => (
            <div key={l.name} className="flex flex-col items-center gap-1">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold"
                style={{
                  borderColor: i < levelIdx || (i === levelIdx && levelDone) ? '#F3D79B' : 'rgba(243,215,155,0.3)',
                  color: i <= levelIdx ? '#F3D79B' : 'rgba(255,244,230,0.4)',
                  background: i < levelIdx || (i === levelIdx && levelDone) ? 'rgba(243,215,155,0.12)' : 'transparent',
                }}
              >
                {i < levelIdx || (i === levelIdx && levelDone) ? '✓' : i + 1}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-ivory/50">{l.name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-ivory/50" role="status">
          Cấp độ {levelIdx + 1}/3 · Số lần nhầm: {mistakes}
        </p>

        <AnimatePresence mode="wait">
          {!levelDone ? (
            <motion.div
              key={`game-${levelIdx}-${gameKey}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <MemoryGame
                orbCount={level.orbs}
                seqLen={level.len}
                hintKey={hintKey}
                onWin={handleWin}
                onMistake={() => setMistakes((m) => m + 1)}
                playTone={playTone}
              />
              <button
                type="button"
                onClick={() => setHintKey((k) => k + 1)}
                className="btn-ghost rounded-full px-6 py-2 text-sm"
              >
                Gợi ý: xem lại thứ tự
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={allDone ? 'reward' : `done-${levelIdx}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex w-full flex-col items-center gap-4"
            >
              {allDone ? (
                <>
                  <p className="font-display text-2xl text-champagne">Ấn sáp đã vỡ!</p>
                  <figure className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-5 py-4 text-center">
                    <blockquote className="font-display text-base italic leading-7 text-ivory/90">
                      “{secretReward}”
                    </blockquote>
                  </figure>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.reveal();
                      onComplete();
                    }}
                    className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
                  >
                    Mở món quà →
                  </button>
                </>
              ) : isLast ? (
                <>
                  <p className="font-display text-2xl text-champagne">
                    Cấp độ “{level.name}” hoàn thành!
                  </p>
                  <p className="text-ivory/60" role="status">Ấn sáp đang vỡ ra…</p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={nextLevel}
                  className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
                >
                  Sang cấp độ {levelIdx + 2} →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
