import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Sfx } from '../types';

interface InteractiveGiftProps {
  sfx: Sfx;
  reducedMotion: boolean;
  onComplete: () => void;
}

type Stage =
  | 'approach' // camera moves in, light sweep
  | 'ribbon' // drag the ribbon along its path
  | 'ribbonDone' // knot loosens, ribbon slides away
  | 'seal' // press-and-hold the seal
  | 'sealBroken' // seal fractures into particles
  | 'beam' // light escapes through the gap
  | 'lid' // lid swings open on its hinge
  | 'reveal' // light spills, petals pushed away
  | 'crystal' // crystal rises toward the camera
  | 'ascend'; // light field bridge to the next scene

const RIBBON_PATH = 'M150,18 C148,90 118,150 148,218 C168,262 150,296 152,330';
const SAMPLES = 90;

const HINTS: Record<Stage, string> = {
  approach: 'Một món quà đang hiện ra…',
  ribbon: 'Kéo chiếc nơ dọc theo đường cong vàng để tháo dây.',
  ribbonDone: 'Chiếc nơ đang nới lỏng…',
  seal: 'Nhấn giữ ấn sáp để tích tụ năng lượng.',
  sealBroken: 'Ấn sáp đã vỡ!',
  beam: 'Ánh sáng đang len qua khe nắp…',
  lid: 'Nắp hộp đang mở ra…',
  reveal: 'Điều kỳ diệu đang bung nở…',
  crystal: '',
  ascend: '',
};

/**
 * Fully interactive gift opening with an explicit state machine:
 * approach → ribbon → ribbonDone → seal → sealBroken → beam →
 * lid → reveal → crystal → ascend.
 * Every stage is driven by the visitor's input; no stage can be
 * skipped or re-triggered, and progress is never reset unexpectedly.
 */
export default function InteractiveGift({ sfx, reducedMotion, onComplete }: InteractiveGiftProps) {
  const [stage, setStage] = useState<Stage>('approach');
  const [ribbonProgress, setRibbonProgress] = useState(0);
  const [sealEnergy, setSealEnergy] = useState(0);
  const [veil, setVeil] = useState(0); // final light-field bridge 0..1
  const pathRef = useRef<SVGPathElement>(null);
  const samplesRef = useRef<Array<{ x: number; y: number }>>([]);
  const totalLen = useRef(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ribbonDrag = useRef(false);
  const sealHold = useRef<{ raf: number; start: number } | null>(null);
  const energyRef = useRef(0);
  const stageRef = useRef<Stage>('approach');
  stageRef.current = stage;

  const go = (s: Stage) => setStage(s);

  // sample the ribbon path once
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    totalLen.current = p.getTotalLength();
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const pt = p.getPointAtLength((totalLen.current * i) / SAMPLES);
      pts.push({ x: pt.x, y: pt.y });
    }
    samplesRef.current = pts;
  }, []);

  // approach → ribbon
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (stageRef.current === 'approach') go('ribbon');
    }, reducedMotion ? 400 : 2100);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  // warm swell when the crystal rises
  const swelled = useRef(false);
  useEffect(() => {
    if (stage === 'crystal' && !swelled.current) {
      swelled.current = true;
      sfx.swell();
    }
  }, [stage, sfx]);

  const svgPoint = (clientX: number, clientY: number) => {
    const svg = wrapRef.current?.querySelector('svg');
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 300,
      y: ((clientY - r.top) / r.height) * 340,
    };
  };

  const nearestOnPath = (x: number, y: number) => {
    let best = 0;
    let bestD = Infinity;
    samplesRef.current.forEach((pt, i) => {
      const d = (pt.x - x) ** 2 + (pt.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best / SAMPLES;
  };

  // ——— ribbon drag ———
  const ribbonDown = (e: React.PointerEvent) => {
    if (stageRef.current !== 'ribbon') return;
    ribbonDrag.current = true;
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* pointer capture unavailable */
    }
    sfx.pop();
  };
  const ribbonMove = (e: React.PointerEvent) => {
    if (!ribbonDrag.current || stageRef.current !== 'ribbon') return;
    const { x, y } = svgPoint(e.clientX, e.clientY);
    const p = nearestOnPath(x, y);
    // progress only moves forward along the path (forgiving, never resets)
    setRibbonProgress((prev) => {
      const next = Math.max(prev, Math.min(1, p));
      if (next >= 0.97 && prev < 0.97) {
        window.setTimeout(() => {
          if (stageRef.current === 'ribbon') {
            go('ribbonDone');
            sfx.chime();
            window.setTimeout(() => {
              if (stageRef.current === 'ribbonDone') go('seal');
            }, reducedMotion ? 300 : 1400);
          }
        }, 0);
      }
      return next;
    });
  };
  const ribbonUp = () => {
    ribbonDrag.current = false;
  };

  // ——— seal press-and-hold ———
  const sealDown = (e: React.PointerEvent) => {
    if (stageRef.current !== 'seal') return;
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* pointer capture unavailable */
    }
    const start = performance.now();
    const DUR = 1600;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / DUR);
      energyRef.current = t;
      setSealEnergy(t);
      if (t >= 1) {
        sealHold.current = null;
        energyRef.current = 1;
        if (stageRef.current === 'seal') {
          go('sealBroken');
          sfx.reveal();
          // beam → lid → reveal → crystal: every stage advances on its own beat
          const tBeam = reducedMotion ? 400 : 1100;
          const tLid = reducedMotion ? 900 : 2100;
          const tReveal = reducedMotion ? 1400 : 3600;
          const tCrystal = reducedMotion ? 2100 : 5600;
          window.setTimeout(() => {
            if (stageRef.current === 'sealBroken') go('beam');
          }, tBeam);
          window.setTimeout(() => {
            if (stageRef.current === 'beam') go('lid');
          }, tLid);
          window.setTimeout(() => {
            if (stageRef.current === 'lid') go('reveal');
          }, tReveal);
          window.setTimeout(() => {
            if (stageRef.current === 'reveal') go('crystal');
          }, tCrystal);
        }
        return;
      }
      sealHold.current = { raf: requestAnimationFrame(tick), start };
    };
    sealHold.current = { raf: requestAnimationFrame(tick), start };
  };
  const sealUp = () => {
    if (sealHold.current) {
      cancelAnimationFrame(sealHold.current.raf);
      sealHold.current = null;
    }
    // energy gently decays instead of resetting — forgiving
    if (stageRef.current !== 'seal' || energyRef.current <= 0) return;
    const decay = () => {
      energyRef.current = Math.max(0, energyRef.current - 0.05);
      setSealEnergy(energyRef.current);
      if (energyRef.current > 0 && stageRef.current === 'seal' && !sealHold.current) {
        requestAnimationFrame(decay);
      }
    };
    requestAnimationFrame(decay);
  };

  useEffect(
    () => () => {
      if (sealHold.current) cancelAnimationFrame(sealHold.current.raf);
    },
    [],
  );

  // knot position along the ribbon
  const knotIdx = Math.round(ribbonProgress * SAMPLES);
  const knot = samplesRef.current[knotIdx] ?? { x: 150, y: 18 };
  const ribbonGone = stage !== 'ribbon' && stage !== 'approach';

  return (
    <div className="relative flex flex-col items-center gap-5">
      <p className="min-h-[2rem] font-display text-xl italic text-champagne" role="status" aria-live="polite">
        {HINTS[stage]}
      </p>

      <div ref={wrapRef} className="relative" style={{ perspective: 900 }}>
        <motion.div
          className="relative h-[340px] w-[300px] max-w-[86vw]"
          initial={{ scale: 0.82, opacity: 0.6 }}
          animate={{
            scale: stage === 'reveal' || stage === 'crystal' ? 1.12 : 1,
            opacity: 1,
          }}
          transition={{ duration: reducedMotion ? 0.4 : 1.8, ease: 'easeOut' }}
        >
          {/* ambient glow behind the box */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(243,215,155,0.20), transparent 65%)',
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />

          {/* pedestal shadow */}
          <div className="absolute bottom-[2%] left-1/2 h-[8%] w-[80%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-md" aria-hidden="true" />

          {/* box body */}
          <div
            className="absolute bottom-[8%] left-1/2 h-[42%] w-[68%] -translate-x-1/2 rounded-[6px] border border-rosegold/50"
            style={{
              background: 'linear-gradient(160deg, #232c4e 0%, #141a30 30%, #0a0e1f 70%, #060912 100%)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.6)',
            }}
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 rounded-[6px]"
              style={{
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 28%, transparent 72%, rgba(243,215,155,0.08) 100%)',
              }}
            />
          </div>

          {/* light beam escaping before the lid opens */}
          {(stage === 'beam' || stage === 'lid') && (
            <motion.div
              className="absolute left-1/2 top-[46%] h-[3%] w-[66%] -translate-x-1/2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,240,210,0.95), transparent)',
                filter: 'blur(3px)',
              }}
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: [0, 1, 0.85], scaleX: 1 }}
              transition={{ duration: 0.9 }}
              aria-hidden="true"
            />
          )}

          {/* lid with a real hinge (top/back edge) */}
          <motion.div
            className="absolute left-1/2 top-[38%] h-[14%] w-[74%] -translate-x-1/2 rounded-[6px] border border-rosegold/60"
            style={{
              background: 'linear-gradient(160deg, #2b3558 0%, #161c34 55%, #0a0e1f 100%)',
              transformOrigin: '50% 0%',
              transformStyle: 'preserve-3d',
              boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
            }}
            initial={false}
            animate={
              stage === 'lid' || stage === 'reveal' || stage === 'crystal' || stage === 'ascend'
                ? { rotateX: [0, 0, -106], y: [0, 5, -30], opacity: [1, 1, 0.92] }
                : { rotateX: 0, y: 0, opacity: 1 }
            }
            transition={
              stage === 'lid' || stage === 'reveal' || stage === 'crystal' || stage === 'ascend'
                ? { duration: reducedMotion ? 0.4 : 1.25, times: [0, 0.12, 1], ease: 'easeInOut' }
                : { duration: 0.3 }
            }
            aria-hidden="true"
          />

          {/* warm light spilling out */}
          {(stage === 'reveal' || stage === 'crystal' || stage === 'ascend') && (
            <motion.div
              className="absolute bottom-[8%] left-1/2 h-[42%] w-[68%] -translate-x-1/2 rounded-[6px]"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 15%, rgba(255,244,230,0.95), rgba(243,215,155,0.4) 60%, transparent 80%)',
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1.35 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}

          {/* petals pushed gently away on reveal */}
          {stage === 'reveal' && !reducedMotion && (
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-[55%] h-3 w-2 rounded-full"
                    style={{ background: '#F4A0BC' }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                    animate={{
                      x: Math.cos(a) * 130,
                      y: Math.sin(a) * 90 - 30,
                      opacity: [0, 1, 0.9],
                      scale: 1,
                      rotate: a * 57,
                    }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                  />
                );
              })}
            </div>
          )}

          {/* ribbon path + knot */}
          {!ribbonGone && (
            <svg
              viewBox="0 0 300 340"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {/* guide shimmer */}
              <path
                d={RIBBON_PATH}
                fill="none"
                stroke="rgba(243,215,155,0.35)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="3 9"
              />
              <path
                ref={pathRef}
                d={RIBBON_PATH}
                fill="none"
                stroke="#C96A8E"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(totalLen.current * ribbonProgress).toFixed(1)} ${totalLen.current.toFixed(1)}`}
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
              />
            </svg>
          )}
          {stage === 'ribbonDone' && !reducedMotion && (
            <motion.svg
              viewBox="0 0 300 340"
              className="absolute inset-0 h-full w-full"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -70, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeIn' }}
              aria-hidden="true"
            >
              <path d={RIBBON_PATH} fill="none" stroke="#C96A8E" strokeWidth="9" strokeLinecap="round" />
            </motion.svg>
          )}
          {stage === 'ribbon' && (
            <div
              role="button"
              tabIndex={0}
              aria-label="Chiếc nơ — kéo dọc theo đường cong vàng"
              onPointerDown={ribbonDown}
              onPointerMove={ribbonMove}
              onPointerUp={ribbonUp}
              onPointerCancel={ribbonUp}
              onKeyDown={(e) => {
                // keyboard alternative: hold Enter to unwind
                if (e.key === 'Enter' && !e.repeat) {
                  const id = window.setInterval(() => {
                    setRibbonProgress((p) => {
                      const n = Math.min(1, p + 0.06);
                      if (n >= 0.97) {
                        window.clearInterval(id);
                        window.setTimeout(() => {
                          if (stageRef.current === 'ribbon') {
                            go('ribbonDone');
                            sfx.chime();
                            window.setTimeout(() => {
                              if (stageRef.current === 'ribbonDone') go('seal');
                            }, 1200);
                          }
                        }, 0);
                      }
                      return n;
                    });
                  }, 60);
                  const stop = () => window.clearInterval(id);
                  window.addEventListener('keyup', stop, { once: true });
                }
              }}
              className="absolute z-20 flex h-16 w-16 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              style={{
                left: knot.x - 32,
                top: knot.y - 32,
                touchAction: 'none',
              }}
            >
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #E893A8, #B34A68 60%, #7E2C46)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.55), 0 0 18px rgba(244,160,188,0.5)',
                }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                aria-hidden="true"
              >
                <span className="font-display text-xl text-ivory">❀</span>
              </motion.div>
            </div>
          )}

          {/* wax seal */}
          {(stage === 'seal' || stage === 'sealBroken') && (
            <div className="absolute left-1/2 top-[52%] z-10 -translate-x-1/2 -translate-y-1/2">
              {stage === 'seal' && (
                <>
                  {/* energy field building with pressure */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-champagne"
                    style={{ width: 84, height: 84 }}
                    animate={{
                      scale: 1 + sealEnergy * 0.7,
                      opacity: 0.25 + sealEnergy * 0.75,
                      boxShadow: `0 0 ${10 + sealEnergy * 40}px rgba(243,215,155,${0.3 + sealEnergy * 0.6})`,
                    }}
                    transition={{ duration: 0.15 }}
                    aria-hidden="true"
                  />
                  {!reducedMotion &&
                    Array.from({ length: 10 }, (_, i) => (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-champagne"
                        style={{ opacity: sealEnergy * 0.9 }}
                        animate={{
                          x: Math.cos((i / 10) * Math.PI * 2) * (30 + sealEnergy * 22),
                          y: Math.sin((i / 10) * Math.PI * 2) * (30 + sealEnergy * 22),
                        }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                      />
                    ))}
                </>
              )}
              {stage === 'sealBroken' && !reducedMotion && (
                <>
                  {Array.from({ length: 7 }, (_, i) => {
                    const a = (i / 7) * Math.PI * 2 + 0.4;
                    return (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 h-3 w-3"
                        style={{ background: '#C96A8E', clipPath: 'polygon(50% 0, 100% 60%, 50% 100%, 0 60%)' }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                        animate={{
                          x: Math.cos(a) * 90,
                          y: Math.sin(a) * 70,
                          opacity: 0,
                          scale: 0.4,
                          rotate: 200,
                        }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        aria-hidden="true"
                      />
                    );
                  })}
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(255,246,232,0.9), rgba(243,215,155,0.4) 45%, transparent 70%)',
                    }}
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1.6, opacity: [0, 1, 0] }}
                    transition={{ duration: 1 }}
                    aria-hidden="true"
                  />
                </>
              )}
              {stage === 'seal' && (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Ấn sáp — nhấn giữ để tích tụ năng lượng"
                  onPointerDown={sealDown}
                  onPointerUp={sealUp}
                  onPointerCancel={sealUp}
                  onPointerLeave={sealUp}
                  onKeyDown={(e) => {
                    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                      e.preventDefault();
                      sealDown(e as unknown as React.PointerEvent);
                    }
                  }}
                  onKeyUp={sealUp}
                  onContextMenu={(e) => e.preventDefault()}
                  className="relative flex h-16 w-16 cursor-pointer touch-none select-none items-center justify-center rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, #E893A8, #B34A68 55%, #7E2C46)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                    touchAction: 'none',
                  }}
                >
                  <motion.span
                    className="font-display text-2xl text-ivory"
                    animate={{ scale: 1 + sealEnergy * 0.25 }}
                    aria-hidden="true"
                  >
                    ❀
                  </motion.span>
                </div>
              )}
            </div>
          )}

          {/* rising crystal */}
          {(stage === 'crystal' || stage === 'ascend') && (
            <motion.div
              className="absolute left-1/2 top-[30%] z-20 -translate-x-1/2"
              initial={{ y: 70, scale: 0.5, opacity: 0 }}
              animate={
                stage === 'ascend'
                  ? { y: -30, scale: 2.6, opacity: 1 }
                  : { y: -24, scale: 1, opacity: 1 }
              }
              transition={{ duration: stage === 'ascend' ? 1.1 : 1.4, ease: 'easeInOut' }}
              onAnimationComplete={() => {
                if (stageRef.current === 'crystal') {
                  go('ascend');
                  sfx.sparkle();
                }
              }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 100 100" className="h-24 w-24">
                <polygon
                  points="50,4 84,38 66,96 34,96 16,38"
                  fill="rgba(243,215,155,0.35)"
                  stroke="#F3D79B"
                  strokeWidth="2.5"
                  style={{ filter: 'drop-shadow(0 0 16px rgba(243,215,155,0.9))' }}
                />
                <polygon points="50,4 84,38 50,46" fill="rgba(255,255,255,0.5)" />
                <polygon points="50,4 16,38 50,46" fill="rgba(243,215,155,0.5)" />
              </svg>
            </motion.div>
          )}

          {/* light-field bridge to the next scene */}
          <motion.div
            className="pointer-events-none absolute inset-[-60px] z-30"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255,248,234,0.98), rgba(243,215,155,0.85) 55%, rgba(243,215,155,0) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: veil }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              if (veil >= 1) onComplete();
            }}
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* veil driver */}
      {stage === 'ascend' && (
        <VeilDriver
          onDone={() => setVeil(1)}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}

function VeilDriver({ onDone, reducedMotion }: { onDone: () => void; reducedMotion: boolean }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, reducedMotion ? 300 : 900);
    return () => window.clearTimeout(id);
  }, [onDone, reducedMotion]);
  return null;
}
