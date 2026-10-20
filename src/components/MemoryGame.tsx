import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ALL_SYMBOLS = [
  { id: 0, glyph: '✦', name: 'Ngôi sao', accent: '#F3D79B', deep: '#8a6a2f' },
  { id: 1, glyph: '❀', name: 'Bông hoa', accent: '#F4A0BC', deep: '#8e3a5c' },
  { id: 2, glyph: '☾', name: 'Mặt trăng', accent: '#B9A8E8', deep: '#5a4a8e' },
  { id: 3, glyph: '✧', name: 'Tia sáng', accent: '#8FD8C9', deep: '#2f6b5f' },
] as const;

const LIT_MS = 620;
const STEP_MS = 980;
const LEAD_MS = 750;

type Phase = 'idle' | 'showing' | 'input' | 'won';

interface MemoryGameProps {
  orbCount: number;
  seqLen: number;
  hintKey: number;
  onWin: () => void;
  onMistake?: () => void;
  playTone: (kind: 'tap' | 'good' | 'bad' | 'win') => void;
}

/**
 * Sequence-memory mini-game. Gameplay logic is self-contained and separate
 * from visuals: input is locked while the sequence plays, wrong taps reset
 * the attempt and replay (unlimited retries), and progress uses a ref synced
 * immediately so rapid taps can never double-count or go stale.
 */
export default function MemoryGame({ orbCount, seqLen, hintKey, onWin, onMistake, playTone }: MemoryGameProps) {
  const symbols = ALL_SYMBOLS.slice(0, orbCount);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Nhấn “Bắt đầu” để ánh sáng dẫn đường cho bạn.');
  const [isError, setIsError] = useState(false);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);
  const [hintId, setHintId] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  // synchronous phase sync: setPhase alone lands on the next render, and a
  // rapid extra tap in between would be judged against a stale phase
  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const mistakesRef = useRef(0);
  const sequenceRef = useRef<number[]>(sequence);
  sequenceRef.current = sequence;

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers();
      setIsError(false);
      progressRef.current = 0;
      setProgress(0);
      setLit(null);
      setHintId(null);
      setTrail([]);
      setPhase('showing');
      setMessage('Hãy ghi nhớ thứ tự những viên pha lê phát sáng…');
      seq.forEach((sym, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setLit(sym);
            playTone('tap');
          }, LEAD_MS + i * STEP_MS),
        );
        timers.current.push(
          window.setTimeout(() => setLit(null), LEAD_MS + i * STEP_MS + LIT_MS),
        );
      });
      timers.current.push(
        window.setTimeout(() => {
          setLit(null);
          setPhase('input');
          // stuck-player recovery: after 2 mistakes the next needed orb stays
          // highlighted through the whole input phase
          if (mistakesRef.current >= 2 && seq.length > 0) {
            setHintId(seq[0]);
            setMessage('Hãy chạm vào viên pha lê đang phát sáng nhé.');
          } else {
            setMessage('Đến lượt bạn — hãy chạm vào các viên pha lê theo đúng thứ tự.');
          }
        }, LEAD_MS + seq.length * STEP_MS),
      );
    },
    [clearTimers, playTone],
  );

  const start = useCallback(() => {
    const seq = Array.from({ length: seqLen }, () =>
      Math.floor(Math.random() * orbCount),
    );
    setSequence(seq);
    playSequence(seq);
  }, [playSequence, seqLen, orbCount]);

  // external hint: replay the current sequence on demand
  useEffect(() => {
    if (hintKey > 0 && sequenceRef.current.length > 0 && phaseRef.current !== 'won') {
      playSequence(sequenceRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintKey]);

  const computeTrail = useCallback((seq: number[]) => {
    const container = containerRef.current;
    if (!container) return;
    const crect = container.getBoundingClientRect();
    const pts = seq.map((id) => {
      const el = orbRefs.current[id];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - crect.left, y: r.top + r.height / 2 - crect.top };
    });
    if (pts.every(Boolean)) setTrail(pts as Array<{ x: number; y: number }>);
  }, []);

  const handleTap = useCallback(
    (id: number) => {
      if (phaseRef.current !== 'input') return;
      const seq = sequenceRef.current;
      const p = progressRef.current;
      if (id === seq[p]) {
        const next = p + 1;
        progressRef.current = next;
        setProgress(next);
        // keep the stuck-player hint on the next needed orb
        if (mistakesRef.current >= 2) setHintId(next < seq.length ? seq[next] : null);
        if (next === seq.length) {
          setPhaseSync('won');
          setLit(null);
          setHintId(null);
          setIsError(false);
          setMessage('Tuyệt vời! Bạn đã đánh thức ánh sáng.');
          playTone('win');
          computeTrail(seq);
          onWin();
        } else {
          playTone('good');
        }
      } else {
        playTone('bad');
        onMistake?.();
        mistakesRef.current += 1;
        setIsError(true);
        setHintId(null);
        setMessage('Chưa đúng rồi — hãy xem lại thứ tự một lần nữa nhé.');
        setPhaseSync('showing');
        timers.current.push(window.setTimeout(() => playSequence(seq), 1200));
      }
    },
    [onWin, playSequence, playTone, computeTrail],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx >= 0 && idx < orbCount) {
        e.preventDefault();
        handleTap(idx);
      }
    },
    [handleTap, orbCount],
  );

  const trailPath = trail.length > 1 ? `M ${trail.map((p) => `${p.x},${p.y}`).join(' L ')}` : '';

  return (
    <div className="flex w-full flex-col items-center gap-6" onKeyDown={handleKey}>
      <div
        ref={containerRef}
        className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        role="group"
        aria-label="Các viên pha lê phát sáng"
      >
        {trailPath && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <motion.path
              d={trailPath}
              fill="none"
              stroke="#F3D79B"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(243,215,155,0.9))' }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </svg>
        )}

        {symbols.map((s, i) => {
          const active = lit === s.id;
          const isHint = hintId === s.id && !active;
          return (
            <button
              key={s.id}
              ref={(el) => {
                orbRefs.current[s.id] = el;
              }}
              type="button"
              onClick={() => handleTap(s.id)}
              disabled={phase !== 'input'}
              aria-label={`${s.name} (phím ${i + 1})`}
              className={`relative flex h-20 w-20 touch-manipulation items-center justify-center rounded-full transition-transform duration-300 sm:h-24 sm:w-24 ${
                active ? 'scale-110' : 'scale-100'
              } ${phase !== 'input' ? 'cursor-default' : 'cursor-pointer'}`}
              style={{
                background: active
                  ? `radial-gradient(circle at 38% 32%, #fff8ea 0%, ${s.accent} 34%, ${s.deep} 72%, #0a0e1f 100%)`
                  : `radial-gradient(circle at 38% 32%, ${s.accent}55 0%, #1a2342 42%, #0a0e1f 78%)`,
                border: `1.5px solid ${isHint ? '#FFF4E6' : active ? s.accent : s.accent + '55'}`,
                boxShadow: active
                  ? `0 0 34px ${s.accent}cc, 0 0 80px ${s.accent}55, inset 0 0 18px rgba(255,255,255,0.35)`
                  : isHint
                    ? `0 0 26px ${s.accent}, inset 0 0 14px rgba(0,0,0,0.55)`
                    : `0 6px 22px rgba(0,0,0,0.5), inset 0 0 14px rgba(0,0,0,0.55)`,
              }}
            >
              {active && (
                <motion.span
                  key={`ring-${s.id}-${lit}`}
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${s.accent}` }}
                  initial={{ scale: 1, opacity: 0.95 }}
                  animate={{ scale: 1.75, opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              )}
              <span
                className="pointer-events-none absolute left-[22%] top-[14%] h-[26%] w-[26%] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.75), transparent 70%)' }}
                aria-hidden="true"
              />
              <motion.span
                aria-hidden="true"
                className="relative text-3xl sm:text-4xl"
                style={{ color: active ? '#1a1206' : s.accent, textShadow: active ? 'none' : `0 0 12px ${s.accent}` }}
                animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {s.glyph}
              </motion.span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-[3.5rem] flex-col items-center gap-2 px-4 text-center">
        <p role="status" aria-live="polite" className={`text-base sm:text-lg ${isError ? 'font-medium text-rose' : 'text-ivory/85'}`}>
          {isError && <span aria-hidden="true" className="mr-2">✕</span>}
          {phase === 'won' && <span aria-hidden="true" className="mr-2 text-champagne">✓</span>}
          {message}
        </p>
        {(phase === 'input' || phase === 'showing') && sequence.length > 0 && (
          <p className="text-sm tracking-widest text-champagne/80" aria-hidden="true">
            {phase === 'input'
              ? `${'●'.repeat(progress)}${'○'.repeat(sequence.length - progress)}`
              : '···'}
          </p>
        )}
      </div>

      {phase === 'idle' && (
        <button type="button" onClick={start} className="btn-gold rounded-full px-10 py-3.5 text-lg font-semibold">
          Bắt đầu
        </button>
      )}
      {(phase === 'showing' || phase === 'input') && (
        <button type="button" onClick={start} className="btn-ghost rounded-full px-8 py-2.5 text-base">
          Chơi lại từ đầu
        </button>
      )}
    </div>
  );
}
