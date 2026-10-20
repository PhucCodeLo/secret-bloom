import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface EnvelopeProps {
  reducedMotion: boolean;
  onOpened: () => void;
}

type Stage = 'sealed' | 'charging' | 'dissolving' | 'open';

/**
 * The visitor presses and holds the wax seal. It warms, glows, then
 * dissolves into luminous particles; the flap opens and the letter rises.
 * A gentle auto-open after a long idle keeps no one stuck.
 */
export default function Envelope({ reducedMotion, onOpened }: EnvelopeProps) {
  const [stage, setStage] = useState<Stage>('sealed');
  const [energy, setEnergy] = useState(0);
  const hold = useRef<{ raf: number } | null>(null);
  const doneRef = useRef(false);
  const stageRef = useRef<Stage>('sealed');
  stageRef.current = stage;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    window.setTimeout(onOpened, reducedMotion ? 300 : 1500);
  };

  const dissolve = () => {
    if (stageRef.current !== 'sealed' && stageRef.current !== 'charging') return;
    setStage('dissolving');
    window.setTimeout(() => {
      setStage('open');
      finish();
    }, reducedMotion ? 300 : 1100);
  };

  const beginHold = () => {
    if (doneRef.current || stageRef.current === 'dissolving' || stageRef.current === 'open') return;
    setStage('charging');
    const start = performance.now();
    const DUR = 1500;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / DUR);
      setEnergy(t);
      if (t >= 1) {
        hold.current = null;
        dissolve();
        return;
      }
      hold.current = { raf: requestAnimationFrame(tick) };
    };
    hold.current = { raf: requestAnimationFrame(tick) };
  };

  const endHold = () => {
    if (hold.current) {
      cancelAnimationFrame(hold.current.raf);
      hold.current = null;
    }
    if (stageRef.current === 'charging') {
      setStage('sealed');
      setEnergy(0);
    }
  };

  // forgiving: a long idle gently opens the letter on its own
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!doneRef.current) dissolve();
    }, 14000);
    return () => {
      window.clearTimeout(id);
      if (hold.current) cancelAnimationFrame(hold.current.raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = stage === 'open' || stage === 'dissolving';

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className={reducedMotion ? '' : 'animate-float-y'}
      >
        <div className="relative h-56 w-80 max-w-[86vw]" style={{ perspective: 900 }}>
          {/* letter card rising out */}
          <motion.div
            className="absolute inset-x-6 top-2 bottom-6 rounded-md border border-rosegold/40 bg-ivory shadow-xl"
            initial={{ y: 60, opacity: 0 }}
            animate={open ? { y: -46, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
              <div className="font-display text-2xl text-deepblue">❀</div>
              <div className="h-1.5 w-3/4 rounded bg-deepblue/15" />
              <div className="h-1.5 w-2/3 rounded bg-deepblue/15" />
              <div className="h-1.5 w-1/2 rounded bg-deepblue/15" />
            </div>
          </motion.div>

          {/* envelope body */}
          <div
            className="absolute inset-0 rounded-lg border border-rosegold/50 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            style={{
              background: 'linear-gradient(165deg, #FFFDF8 0%, #F6EFDD 60%, #EADCC3 100%)',
            }}
          >
            <svg viewBox="0 0 320 224" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path d="M0 8 L150 150 L320 8" fill="none" stroke="#DCA47A" strokeWidth="2" opacity="0.55" />
              <path d="M0 216 L120 100 M320 216 L200 100" fill="none" stroke="#DCA47A" strokeWidth="2" opacity="0.35" />
            </svg>
          </div>

          {/* flap */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 origin-top"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              background: 'linear-gradient(180deg, #FBF5E8 0%, #EFE2C9 100%)',
              borderTop: '1px solid rgba(220,164,122,0.6)',
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              zIndex: open ? 0 : 2,
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: open ? -172 : 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* wax seal: hold to dissolve */}
          <div className="absolute left-1/2 top-[44%] z-[3] -translate-x-1/2 -translate-y-1/2">
            {stage === 'dissolving' || stage === 'open' ? (
              !reducedMotion && (
                <>
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                        style={{ background: '#E893A8' }}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: Math.cos(a) * 60, y: Math.sin(a) * 50, opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        aria-hidden="true"
                      />
                    );
                  })}
                </>
              )
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Ấn sáp — nhấn giữ để mở thư"
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
                onKeyUp={endHold}
                onContextMenu={(e) => e.preventDefault()}
                className="relative flex h-16 w-16 cursor-pointer touch-none select-none items-center justify-center rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #E893A8, #B34A68 55%, #7E2C46)',
                  boxShadow: `0 4px 14px rgba(0,0,0,0.4), 0 0 ${energy * 30}px rgba(232,147,168,0.8)`,
                  touchAction: 'none',
                }}
              >
                <motion.span
                  className="font-display text-2xl text-ivory"
                  animate={{ scale: 1 + energy * 0.2, rotate: energy * 12 }}
                  aria-hidden="true"
                >
                  ❀
                </motion.span>
                {energy > 0 && (
                  <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="#FFF4E6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - energy)}
                    />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* warm glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(243,215,155,0.55), transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : energy * 0.5 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </motion.div>

      {stage === 'sealed' && (
        <p className="text-sm text-ivory/65">Nhấn giữ ấn sáp để mở thư</p>
      )}
      {stage === 'charging' && (
        <p className="font-display text-lg italic text-champagne/90" role="status">
          Ấn sáp đang ấm dần…
        </p>
      )}
      {(stage === 'dissolving' || stage === 'open') && (
        <p className="font-display text-lg italic text-champagne/90" role="status">
          Bức thư đang mở ra…
        </p>
      )}
    </div>
  );
}
