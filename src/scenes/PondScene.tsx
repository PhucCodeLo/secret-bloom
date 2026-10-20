import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Sfx } from '../types';
import { useGiftOptional } from '../gift/GiftContext';
import { pickSceneBlessing } from '../data/sceneBlessings';

interface PondSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onSceneBlessing?: (key: string, text: string) => void;
  onNext: () => void;
}

const SYMBOLS = [
  { id: 0, glyph: '✦', name: 'Ngôi sao', accent: '#F3D79B' },
  { id: 1, glyph: '❀', name: 'Bông hoa', accent: '#F4A0BC' },
  { id: 2, glyph: '☾', name: 'Mặt trăng', accent: '#B9A8E8' },
  { id: 3, glyph: '✧', name: 'Tia sáng', accent: '#8FD8C9' },
];

const ROUNDS = [3, 4];
const LIT_MS = 650;
const STEP_MS = 1000;
const LEAD_MS = 800;

const REWARD_KEY = 'pond';

type Phase = 'demo' | 'input' | 'roundDone' | 'won';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PondScene({ sfx, reducedMotion, collect, onSceneBlessing, onNext }: PondSceneProps) {
  const [round, setRound] = useState(0);
  const [poolOrder, setPoolOrder] = useState<number[]>(() => shuffle([0, 1, 2, 3]));
  const [phase, setPhase] = useState<Phase>('demo');
  const [sequence, setSequence] = useState<number[]>([]);
  const [litStar, setLitStar] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintId, setHintId] = useState<number | null>(null);
  const [message, setMessage] = useState('Hãy nhìn những vì sao phản chiếu trên mặt hồ…');
  const [revealed, setRevealed] = useState(false);
  // One random blessing variant per playthrough.
  const reward = useMemo(() => pickSceneBlessing(REWARD_KEY), []);
  useEffect(() => {
    if (revealed) onSceneBlessing?.(REWARD_KEY, reward);
  }, [revealed, reward, onSceneBlessing]);
  // Memory lantern — the recipient's own words released onto the pond.
  const giftSession = useGiftOptional();
  const [lantern, setLantern] = useState(giftSession?.journey?.lanternText ?? '');
  const [lanternReleased, setLanternReleased] = useState(!!giftSession?.journey?.lanternText);
  const LANTERN_MAX = 120;
  const timers = useRef<number[]>([]);
  const progressRef = useRef(0);
  const mistakesRef = useRef(0);
  const sequenceRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>('demo');
  phaseRef.current = phase;
  // setPhaseSync also flips the ref synchronously: setPhase alone only lands
  // on the next render, and a rapid extra tap in between would be judged
  // against a stale phase (e.g. a tap right after the winning tap sabotaging
  // the round because progress is already complete).
  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers();
      progressRef.current = 0;
      setProgress(0);
      setHintId(null);
      setLitStar(null);
      setPhase('demo');
      setMessage('Hãy ghi nhớ thứ tự những vì sao…');
      seq.forEach((sym, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setLitStar(sym);
            sfx.pop();
          }, LEAD_MS + i * STEP_MS),
        );
        timers.current.push(
          window.setTimeout(() => setLitStar(null), LEAD_MS + i * STEP_MS + LIT_MS),
        );
      });
      timers.current.push(
        window.setTimeout(() => {
          setLitStar(null);
          setPhase('input');
          // stuck-player recovery: after 2 mistakes the next needed reflection
          // stays highlighted through the whole input phase
          if (mistakesRef.current >= 2 && seq.length > 0) {
            setHintId(seq[0]);
            setMessage('Hãy chạm vào hình phản chiếu đang phát sáng nhé.');
          } else {
            setMessage('Chạm vào hình phản chiếu của chúng trên mặt hồ, đúng thứ tự nhé.');
          }
        }, LEAD_MS + seq.length * STEP_MS),
      );
    },
    [clearTimers, sfx],
  );

  const startRound = useCallback(
    (r: number) => {
      const len = ROUNDS[r];
      const seq = Array.from({ length: len }, () => Math.floor(Math.random() * SYMBOLS.length));
      sequenceRef.current = seq;
      setSequence(seq);
      setPoolOrder(shuffle([0, 1, 2, 3]));
      playSequence(seq);
    },
    [playSequence],
  );

  useEffect(() => {
    startRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tapPool = (id: number) => {
    if (phaseRef.current !== 'input') return;
    const seq = sequenceRef.current;
    const p = progressRef.current;
    if (id === seq[p]) {
      const next = p + 1;
      progressRef.current = next;
      setProgress(next);
      // keep the stuck-player hint on the next needed reflection
      if (mistakesRef.current >= 2) setHintId(next < seq.length ? seq[next] : null);
      sfx.chime();
      if (next === seq.length) {
        setPhaseSync('roundDone');
        setMessage('Chính xác! Mặt hồ đang gợn sóng ánh sáng…');
        sfx.success();
        timers.current.push(
          window.setTimeout(() => {
            if (round + 1 < ROUNDS.length) {
              setRound((r) => r + 1);
              startRound(round + 1);
            } else {
              setPhaseSync('won');
              setRevealed(true);
              collect('pond-memory');
            }
          }, reducedMotion ? 400 : 1400),
        );
      }
    } else {
      // gentle ripple, useful feedback, replay — never a harsh fail
      sfx.error();
      mistakesRef.current += 1;
      setMistakes(mistakesRef.current);
      setHintId(null);
      setMessage('Gợn sóng lan ra… hãy nhìn lại thứ tự một lần nữa nhé.');
      setPhaseSync('demo');
      timers.current.push(window.setTimeout(() => playSequence(seq), 1300));
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
            Hồi VI — Hồ ký ức
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Hồ <span className="text-champagne">ký ức</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Những vì sao soi bóng xuống mặt hồ. Hãy chạm vào{' '}
            <strong className="text-ivory">hình phản chiếu</strong> theo đúng thứ tự.
          </p>
        </div>

        {/* stars */}
        <div className="flex items-center justify-center gap-3 sm:gap-5" role="group" aria-label="Bốn vì sao">
          {SYMBOLS.map((s) => {
            const lit = litStar === s.id;
            return (
              <div
                key={s.id}
                className="flex h-16 w-16 items-center justify-center rounded-full border sm:h-[4.5rem] sm:w-[4.5rem]"
                style={{
                  borderColor: lit ? s.accent : 'rgba(243,215,155,0.25)',
                  background: lit ? `radial-gradient(circle, #fff8ea, ${s.accent} 60%)` : 'rgba(10,14,31,0.6)',
                  boxShadow: lit ? `0 0 28px ${s.accent}` : 'none',
                }}
                aria-hidden="true"
              >
                <span className="font-display text-2xl" style={{ color: lit ? '#1a1206' : s.accent }}>
                  {s.glyph}
                </span>
              </div>
            );
          })}
        </div>

        {/* pool */}
        <div className="relative w-full">
          <div
            className="relative mx-auto h-48 w-full max-w-[340px] overflow-hidden rounded-[50%] border border-champagne/25"
            style={{
              background:
                'radial-gradient(ellipse at 50% 30%, #16223f 0%, #0a1024 60%, #05080f 100%)',
              boxShadow: 'inset 0 12px 40px rgba(0,0,0,0.6), 0 0 40px rgba(143,180,232,0.12)',
            }}
          >
            {/* moon shimmer */}
            <div
              className="pointer-events-none absolute inset-x-8 top-3 h-10 rounded-[50%]"
              style={{ background: 'radial-gradient(ellipse, rgba(243,215,155,0.25), transparent 70%)' }}
              aria-hidden="true"
            />
            {/* reflections are vertically mirrored via the wrapper so the
                bobbing animation on the buttons doesn't clobber the flip */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-3 sm:gap-4"
              style={{ transform: 'scaleY(-1)' }}
            >
              {poolOrder.map((id) => {
                const s = SYMBOLS[id];
                const isHint = hintId === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => tapPool(id)}
                    disabled={phase !== 'input'}
                    aria-label={`Hình phản chiếu: ${s.name}`}
                    className="flex h-14 w-14 items-center justify-center rounded-full border sm:h-16 sm:w-16"
                    style={{
                      borderColor: isHint ? '#FFF4E6' : `${s.accent}66`,
                      background: 'rgba(10,16,36,0.55)',
                      boxShadow: isHint ? `0 0 26px ${s.accent}` : 'none',
                    }}
                    animate={!reducedMotion ? { y: [0, -4, 0, 3, 0] } : {}}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: id * 0.4 }}
                  >
                    <span
                      className="font-display text-2xl opacity-80 blur-[0.6px]"
                      style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}` }}
                      aria-hidden="true"
                    >
                      {s.glyph}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-ivory/40">mặt hồ</p>
        </div>

        <p role="status" aria-live="polite" className="min-h-[1.75rem] text-[15px] text-ivory/80">
          {message}
        </p>
        {phase !== 'won' && sequence.length > 0 && (
          <p className="text-sm tracking-widest text-champagne/80" aria-hidden="true">
            Vòng {round + 1}/{ROUNDS.length} · {'●'.repeat(progress)}{'○'.repeat(sequence.length - progress)}
            {mistakes > 0 && <span className="text-ivory/50"> · nhầm {mistakes}</span>}
          </p>
        )}

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex w-full flex-col items-center gap-4"
            >
              <figure className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-5 py-4 text-center">
                <blockquote className="font-display text-base italic leading-7 text-ivory/90">
                  “{reward}”
                </blockquote>
              </figure>
              {/* Release a memory lantern — optional, in the recipient's own words */}
              {!lanternReleased ? (
                <div className="w-full rounded-2xl border border-champagne/25 bg-deepblue/60 px-5 py-4 text-left">
                  <label htmlFor="memory-lantern" className="mb-1.5 block text-sm font-medium text-champagne">
                    Thả một chiếc đèn kỷ niệm xuống hồ <span className="font-normal text-ivory/50">(không bắt buộc)</span>
                  </label>
                  <textarea
                    id="memory-lantern"
                    value={lantern}
                    maxLength={LANTERN_MAX}
                    rows={2}
                    onChange={(e) => setLantern(e.target.value)}
                    placeholder="Một kỷ niệm bạn muốn giữ lại…"
                    className="w-full resize-none rounded-xl border border-champagne/30 bg-midnight/60 px-4 py-3 text-base text-ivory placeholder:text-ivory/35 focus:border-champagne"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-ivory/40">{lantern.length}/{LANTERN_MAX}</p>
                    <button
                      type="button"
                      disabled={!lantern.trim()}
                      onClick={() => {
                        const t = lantern.trim();
                        if (!t) return;
                        giftSession?.setLanternText(t);
                        collect('memory-lantern');
                        setLanternReleased(true);
                        sfx.swell();
                      }}
                      className="min-h-[44px] rounded-full bg-champagne/90 px-6 text-sm font-semibold text-midnight transition disabled:opacity-40"
                    >
                      Thả đèn ✦
                    </button>
                  </div>
                </div>
              ) : (
                giftSession?.journey?.lanternText && (
                  <motion.figure
                    initial={{ opacity: 0, y: 24 }}
                    animate={
                      reducedMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 1, y: [0, -10, 0] }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0.8 }
                        : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
                    }
                    className="flex w-full flex-col items-center gap-1 text-center"
                    aria-label="Đèn kỷ niệm của bạn đang trôi trên mặt hồ"
                  >
                    <span className="text-3xl" aria-hidden="true" style={{ filter: 'drop-shadow(0 0 12px #F3D79B)' }}>
                      🏮
                    </span>
                    <blockquote className="max-w-xs font-display text-sm italic leading-6 text-champagne/90">
                      “{giftSession.journey.lanternText}”
                    </blockquote>
                  </motion.figure>
                )
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
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
