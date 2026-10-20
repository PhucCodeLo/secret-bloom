import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GiftBox from '../components/GiftBox';
import LightBurst from '../components/atmosphere/LightBurst';
import type { Sfx } from '../types';

interface GiftSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onNext: () => void;
}

const HOLD_MS = 1500;

/**
 * The Forbidden Gift. No bow to drag — the only way in is patience:
 * press and hold the wax seal until it breaks, then the lid lifts.
 */
export default function GiftScene({ sfx, reducedMotion, collect, onNext }: GiftSceneProps) {
  const [sealBroken, setSealBroken] = useState(false);
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    cancelAnimationFrame(raf.current);
    setCharge(1);
    setHolding(false);
    setSealBroken(true);
    collect('broken-seal');
    collect('golden-ribbon');
    sfx.success();
    window.setTimeout(() => sfx.chime(), 450);
  };

  const tick = () => {
    const p = Math.min(1, (performance.now() - start.current) / HOLD_MS);
    setCharge(p);
    if (p >= 1) {
      finish();
    } else {
      raf.current = requestAnimationFrame(tick);
    }
  };

  const begin = () => {
    if (done.current || sealBroken) return;
    if (reducedMotion) {
      finish();
      return;
    }
    done.current = false;
    setHolding(true);
    start.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (done.current) return;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setCharge(0);
  };

  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-6"
      >
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Hồi VII — Món quà cấm
          </p>
          <h2 className="font-display max-w-sm text-3xl font-bold leading-snug text-ivory sm:text-4xl">
            Món quà bị niêm phong.
          </h2>
        </div>

        <div className="relative">
          <GiftBox
            opened={sealBroken}
            tilt={!sealBroken}
            size="lg"
            reducedMotion={reducedMotion}
          />
          {sealBroken && <LightBurst burstKey="seal" size={320} />}

          {/* wax seal — press and hold to break */}
          <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              disabled={sealBroken}
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
              aria-label="Nhấn giữ ấn sáp để mở món quà"
              className="relative flex h-16 w-16 touch-none select-none items-center justify-center rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #E893A8, #B34A68 55%, #7E2C46)',
                boxShadow: holding
                  ? `0 0 0 4px rgba(243,215,155,${0.35 + charge * 0.5}), 0 0 ${Math.round(20 + charge * 22)}px rgba(243,215,155,${0.3 + charge * 0.5})`
                  : '0 4px 14px rgba(0,0,0,0.5)',
                transform: holding ? `scale(${(1 + charge * 0.12).toFixed(3)})` : undefined,
                opacity: sealBroken ? 0.25 : 1,
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
            >
              {/* charge ring */}
              {!sealBroken && (
                <svg
                  viewBox="0 0 80 80"
                  className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r={R}
                    fill="none"
                    stroke="rgba(243,215,155,0.22)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={R}
                    fill="none"
                    stroke="#F3D79B"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - charge)}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(243,215,155,0.8))' }}
                  />
                </svg>
              )}
              <span className="font-display text-xl text-ivory" aria-hidden="true">
                ❀
              </span>
            </button>
          </div>

          {!sealBroken && (
            <p className="pointer-events-none absolute left-1/2 top-[60%] -translate-x-1/2 animate-pulse whitespace-nowrap text-xs tracking-widest text-champagne/80">
              nhấn giữ ấn sáp để mở
            </p>
          )}
        </div>

        <div className="flex min-h-[3.5rem] items-center justify-center px-4">
          <p
            role="status"
            aria-live="polite"
            className="max-w-xs font-display text-lg italic leading-8 text-rose/90"
          >
            {sealBroken
              ? '“Ấn sáp đã vỡ — ánh sáng tràn ra từ bên trong…”'
              : '“Món quà bị niêm phong bằng ấn sáp. Chỉ có sự kiên nhẫn mới mở được nó…”'}
          </p>
        </div>

        <AnimatePresence>
          {sealBroken && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              onClick={() => {
                sfx.pop();
                onNext();
              }}
              className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
            >
              Tới Thử thách Ký ức →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
