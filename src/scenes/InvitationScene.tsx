import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Sfx } from '../types';
import { useGiftOptional } from '../gift/GiftContext';
import { resolveInvitation } from '../gift/types';
import { THEME_VISUALS } from '../gift/themes';

interface InvitationSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  onEnter: () => void;
}

type Stage = 'sealed' | 'opening' | 'letter';

/** Types text while active; tap to reveal instantly. */
function useTypewriter(text: string, active: boolean, speed = 36) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) return;
    setShown(0);
    if (speed <= 0) {
      setShown(text.length);
      return;
    }
    const t = window.setInterval(() => {
      setShown((s) => {
        if (s >= text.length) {
          window.clearInterval(t);
          return s;
        }
        return s + 1;
      });
    }, speed);
    return () => window.clearInterval(t);
  }, [text, active, speed]);
  return {
    shown: text.slice(0, shown),
    done: shown >= text.length,
    complete: () => setShown(text.length),
  };
}

const HOLD_MS = 1400;

/**
 * Poetic invitation lines, used when the sender didn't write a custom one.
 * One is picked at random each visit, so the invitation never reads the same.
 */
const INVITATION_VARIANTS: Array<(sal: string) => string> = [
  (sal) => `Có một khu vườn đã chờ ${sal} từ rất lâu. Tối nay, cánh cửa ấy chỉ mở cho ${sal} thôi.`,
  (sal) => `Trăng đã lên, hoa đã nở, và mọi con đường trong vườn đêm nay đều dẫn về phía ${sal}.`,
  (sal) => `Người ta nói mỗi khu vườn đều giữ một bí mật. Bí mật của khu vườn này — chính là ${sal}.`,
  (sal) => `Đêm nay, đom đóm bay thấp hơn mọi khi, như thể chúng cũng nôn nao chờ ${sal} bước vào.`,
  (sal) => `Có những lời mời viết bằng mực, và có những lời mời viết bằng ánh trăng. Lá thư này thuộc về loại thứ hai — và người nhận là ${sal}.`,
  (sal) => `Gió đã thì thầm tên ${sal} suốt cả buổi chiều. Khu vườn nghe thấy, và mở cửa.`,
];

export default function InvitationScene({ sfx, reducedMotion, onEnter }: InvitationSceneProps) {
  const giftSession = useGiftOptional();
  const gift = giftSession?.gift ?? null;
  const { name, text: configuredText, salutation } = resolveInvitation(gift);
  const theme = gift?.theme ?? 'midnight';
  const visual = THEME_VISUALS[theme];

  // Random invitation line each visit — unless the sender wrote their own.
  const [variantText] = useState(() =>
    INVITATION_VARIANTS[Math.floor(Math.random() * INVITATION_VARIANTS.length)](salutation),
  );
  const text = gift?.invitationText?.trim() ? configuredText : variantText;

  // Ambient drifting lights (deterministic layout, organic motion).
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: (i * 61 + 7) % 100,
        top: (i * 37 + 11) % 100,
        size: 2 + ((i * 7) % 4),
        dur: 5 + ((i * 13) % 7),
        delay: (i * 0.7) % 4,
        gold: i % 3 === 0,
      })),
    [],
  );

  const [stage, setStage] = useState<Stage>('sealed');
  const [sealGlow, setSealGlow] = useState(false);
  const [tapHint, setTapHint] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const downAt = useRef(0);
  const doneRef = useRef(false);

  const nameLine = `Gửi ${name}`;
  const nameTyping = useTypewriter(nameLine, stage === 'sealed', 90);
  const letterTyping = useTypewriter(text, stage === 'letter', 28);

  const clearHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setSealGlow(false);
  };

  const openLetter = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearHold();
    sfx.swell();
    setStage('opening');
    window.setTimeout(() => setStage('letter'), reducedMotion ? 200 : 1300);
  };

  const beginHold = () => {
    if (doneRef.current || stage !== 'sealed') return;
    downAt.current = performance.now();
    setSealGlow(true);
    setTapHint(false);
    holdTimer.current = window.setTimeout(openLetter, HOLD_MS);
  };

  const endHold = () => {
    if (doneRef.current || stage !== 'sealed') return;
    const quick = performance.now() - downAt.current < 350;
    clearHold();
    // A quick tap: the seal flares, inviting a longer hold.
    if (quick) {
      sfx.pop();
      setTapHint(true);
    }
  };

  useEffect(() => () => clearHold(), []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      {/* ambient drifting lights */}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                background: p.gold ? '#F3D79B' : '#FFF4E6',
                boxShadow: p.gold ? '0 0 8px rgba(243,215,155,0.9)' : '0 0 6px rgba(255,244,230,0.7)',
              }}
              animate={{ y: [0, -26, 0], opacity: [0.25, 0.9, 0.25] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 text-center"
      >
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Lời mời
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory">
            Dành riêng cho <span className="text-champagne">bạn</span>
          </h2>
        </div>

        {/* The sealed envelope */}
        <div className="relative" style={{ perspective: 800 }}>
          {/* halo behind the envelope — breathes, flares when opened */}
          <motion.div
            className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `radial-gradient(circle, ${visual.glow}, transparent 65%)` }}
            animate={
              reducedMotion
                ? { opacity: 0.5 }
                : stage === 'sealed'
                  ? { opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }
                  : { opacity: 0.9, scale: 1.25 }
            }
            transition={
              reducedMotion || stage !== 'sealed'
                ? { duration: 0.8 }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: 44, scale: 0.94, opacity: 0 }}
            animate={{ y: stage === 'opening' || stage === 'letter' ? -14 : 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative h-52 w-80 max-w-[85vw] overflow-hidden rounded-xl border border-champagne/40 shadow-2xl"
            style={{ background: visual.cardBg }}
            aria-label={`Phong thư gửi ${name}`}
          >
            {/* flap */}
            <motion.div
              className="absolute inset-x-0 top-0 h-24 origin-top"
              style={{
                background: `linear-gradient(180deg, ${visual.accent}22, transparent)`,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                borderBottom: '1px solid rgba(243,215,155,0.25)',
              }}
              animate={
                stage === 'sealed' ? { rotateX: 0 } : { rotateX: reducedMotion ? 0 : 168 }
              }
              transition={{ duration: reducedMotion ? 0 : 0.9, ease: 'easeInOut' }}
            />
            {/* recipient name, typed */}
            <button
              type="button"
              onClick={() => nameTyping.complete()}
              className="absolute inset-x-0 bottom-8 px-6"
              aria-label={nameLine}
            >
              <span className="font-display text-2xl font-bold text-ivory">
                {nameTyping.shown}
                {!nameTyping.done && <span className="animate-pulse">▍</span>}
              </span>
            </button>
            {/* rising letter */}
            {(stage === 'opening' || stage === 'letter') && (
              <motion.div
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: reducedMotion ? -30 : -46, opacity: 1 }}
                transition={{ duration: reducedMotion ? 0.2 : 1, ease: 'easeOut' }}
                className="absolute inset-x-6 top-10 rounded-lg bg-ivory px-4 py-3 shadow-xl"
              >
                <p className="font-display text-sm italic leading-6 text-midnight">
                  {stage === 'letter' ? '✦' : '…'}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* wax seal — tap to glow, hold to open */}
          {stage === 'sealed' && (
            <button
              type="button"
              aria-label="Con dấu sáp — nhấn giữ để mở thư"
              onPointerDown={beginHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                  e.preventDefault();
                  beginHold();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') endHold();
              }}
              onContextMenu={(e) => e.preventDefault()}
              className="absolute left-1/2 top-16 touch-none select-none"
              style={{ transform: 'translate(-50%, -50%)', WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full font-display text-xl text-midnight transition-all"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${visual.accent}, ${visual.accent2})`,
                  boxShadow: sealGlow
                    ? `0 0 34px 10px ${visual.glow}, 0 0 10px 3px ${visual.accent}`
                    : `0 2px 10px rgba(0,0,0,0.5), 0 0 0 3px rgba(243,215,155,0.25)`,
                  transform: sealGlow ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                ❀
              </span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {stage === 'sealed' && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-ivory/60"
            >
              {tapHint ? 'Nhấn giữ con dấu một lúc để mở thư nhé.' : 'Chạm con dấu — nhấn giữ để mở thư.'}
            </motion.p>
          )}
          {stage === 'letter' && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex w-full flex-col items-center gap-5"
            >
              <div className="flex items-center gap-4" aria-hidden="true">
                <span className="h-px w-14 bg-champagne/50" />
                <span className="text-champagne">✦</span>
                <span className="font-display text-lg text-champagne">❀</span>
                <span className="text-champagne">✦</span>
                <span className="h-px w-14 bg-champagne/50" />
              </div>
              <button
                type="button"
                onClick={() => letterTyping.complete()}
                className="w-full rounded-2xl border border-champagne/30 bg-deepblue/70 px-6 py-5 text-left"
                aria-label="Lời dẫn"
              >
                <p className="font-display text-lg italic leading-8 text-ivory/90">
                  “{letterTyping.shown}
                  {!letterTyping.done && <span className="animate-pulse">▍</span>}”
                </p>
              </button>
              {letterTyping.done && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    sfx.sparkle();
                    onEnter();
                  }}
                  className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
                >
                  Bước vào khu vườn →
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
