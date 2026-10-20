import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LightBurst from '../components/atmosphere/LightBurst';
import type { Sfx } from '../types';
import { pickSceneBlessing } from '../data/sceneBlessings';

interface ClockSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  collect: (id: string) => void;
  onSceneBlessing?: (key: string, text: string) => void;
  onNext: () => void;
}

const GLYPHS = ['✦', '❀', '☾', '✧', '❖', '✺', '☽', '❁'];
const RING_RADII = [140, 100, 62];
// fixed targets, outer → inner: moon, flower, star (matches the on-screen instruction)
const TARGET_IDX = [GLYPHS.indexOf('☾'), GLYPHS.indexOf('❀'), GLYPHS.indexOf('✦')];
const STEP = 45;
const TAP_SLOP_PX = 12;

const atTopIndex = (rot: number) => (((-Math.round(rot / STEP)) % 8) + 8) % 8;

/** Random starting rotation that is never already solved. */
function randomStarts(): number[] {
  return TARGET_IDX.map((t) => {
    let r = Math.floor(Math.random() * 8) * STEP;
    if (atTopIndex(r) === t) r = (r + STEP * 3) % 360;
    return r;
  });
}

export default function ClockScene({ sfx, reducedMotion, collect, onSceneBlessing, onNext }: ClockSceneProps) {
  const [rotation, setRotation] = useState<number[]>(randomStarts);
  const [locked, setLocked] = useState<boolean[]>([false, false, false]);
  const [opened, setOpened] = useState(false);
  // One random blessing variant per playthrough.
  const blessing = useMemo(() => pickSceneBlessing('clock'), []);
  useEffect(() => {
    if (opened) onSceneBlessing?.('clock', blessing);
  }, [opened, blessing, onSceneBlessing]);
  const [activeRing, setActiveRing] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lockedRef = useRef<boolean[]>([false, false, false]);
  const dragState = useRef<{
    ring: number;
    startAngle: number;
    startRot: number;
    startX: number;
    startY: number;
    moved: boolean;
    lastRot: number;
  } | null>(null);

  const pointerAngle = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  /** Shared settle logic: snap to the nearest step, lock if the target glyph is on top. */
  const settleRing = (ring: number, rawRot: number) => {
    const snapped = Math.round(rawRot / STEP) * STEP;
    setRotation((prev) => {
      const next = [...prev];
      next[ring] = snapped;
      return next;
    });
    if (lockedRef.current[ring]) return;
    if (atTopIndex(snapped) === TARGET_IDX[ring]) {
      const nl = [...lockedRef.current];
      nl[ring] = true;
      lockedRef.current = nl;
      setLocked(nl);
      sfx.chime();
      if (nl.every(Boolean)) {
        window.setTimeout(() => {
          setOpened(true);
          sfx.success();
          sfx.swell();
          collect('clock-seed');
        }, reducedMotion ? 200 : 800);
      }
    } else {
      sfx.pop();
    }
  };

  const beginRotate = (ring: number, e: React.PointerEvent) => {
    if (lockedRef.current[ring]) return;
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* pointer capture unavailable */
    }
    dragState.current = {
      ring,
      startAngle: pointerAngle(e.clientX, e.clientY),
      startRot: rotation[ring],
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      lastRot: rotation[ring],
    };
    setActiveRing(ring);
  };

  const moveRotate = (e: React.PointerEvent) => {
    const d = dragState.current;
    if (!d) return;
    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
    if (dist < TAP_SLOP_PX) return; // treat as a potential tap for now
    d.moved = true;
    const a = pointerAngle(e.clientX, e.clientY);
    let delta = a - d.startAngle;
    delta = ((delta + 540) % 360) - 180; // normalize to [-180, 180]
    d.lastRot = d.startRot + delta;
    const rot = d.lastRot;
    setRotation((prev) => {
      const next = [...prev];
      next[d.ring] = rot;
      return next;
    });
  };

  const endRotate = () => {
    const d = dragState.current;
    dragState.current = null;
    setActiveRing(null);
    if (!d || lockedRef.current[d.ring]) return;
    if (d.moved) {
      settleRing(d.ring, d.lastRot);
    } else {
      // tap / click fallback: advance exactly one step clockwise
      settleRing(d.ring, d.startRot + STEP);
    }
  };

  const ringColor = (i: number) =>
    i === 0 ? '#B9A8E8' : i === 1 ? '#F4A0BC' : '#F3D79B';

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
            Hồi VIII — Đồng hồ hoa
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Đồng hồ <span className="text-champagne">hoa</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Đưa <strong className="text-ivory">☾ ❀ ✦</strong> (ngoài → trong) lên đúng{' '}
            <strong className="text-champagne">đỉnh kim</strong>. Kéo vòng tròn để xoay,
            hoặc chạm nhẹ để xoay từng nấc.
          </p>
        </div>

        <div className="relative">
          {/* top marker */}
          <div
            className="absolute left-1/2 top-[-10px] z-20 -translate-x-1/2"
            aria-hidden="true"
          >
            <div
              className="h-0 w-0 border-x-[9px] border-t-[14px] border-x-transparent border-t-champagne"
              style={{ filter: 'drop-shadow(0 0 6px rgba(243,215,155,0.8))' }}
            />
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 320 320"
            className="h-[320px] w-[320px] max-w-[86vw] touch-none select-none"
            style={{ touchAction: 'none' }}
            role="group"
            aria-label="Ba vòng xoay của đồng hồ hoa"
          >
            {RING_RADII.map((radius, i) => {
              const isLocked = locked[i];
              const color = ringColor(i);
              return (
                // the whole ring (band + symbols) is a grab target; symbols ignore
                // pointer events so a drag starting on a glyph still rotates
                <g
                  key={i}
                  onPointerDown={(e) => beginRotate(i, e)}
                  onPointerMove={moveRotate}
                  onPointerUp={endRotate}
                  onPointerCancel={endRotate}
                  style={{ cursor: isLocked ? 'default' : 'grab', touchAction: 'none' }}
                >
                  <circle
                    cx="160"
                    cy="160"
                    r={radius}
                    fill="none"
                    stroke={isLocked ? color : 'rgba(243,215,155,0.3)'}
                    strokeWidth={isLocked ? 3 : 2}
                    style={isLocked ? { filter: `drop-shadow(0 0 8px ${color})` } : undefined}
                  />
                  {/* generous invisible grab band */}
                  <circle
                    cx="160"
                    cy="160"
                    r={radius}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="48"
                    style={{ pointerEvents: isLocked ? 'none' : 'stroke' }}
                  />
                  <g
                    transform={`rotate(${rotation[i]} 160 160)`}
                    style={{
                      transition: activeRing === i ? 'none' : 'transform 0.25s ease-out',
                      pointerEvents: 'none',
                    }}
                  >
                    {GLYPHS.map((g, k) => {
                      const a = (k * STEP * Math.PI) / 180;
                      const x = 160 + radius * Math.sin(a);
                      const y = 160 - radius * Math.cos(a);
                      const isTarget = k === TARGET_IDX[i];
                      return (
                        <text
                          key={k}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="20"
                          fill={isTarget && isLocked ? '#FFF4E6' : isTarget ? color : 'rgba(255,244,230,0.45)'}
                          style={
                            isTarget
                              ? { filter: `drop-shadow(0 0 6px ${color})`, fontWeight: 700 }
                              : undefined
                          }
                        >
                          {g}
                        </text>
                      );
                    })}
                  </g>
                </g>
              );
            })}

            {/* center chamber */}
            <circle cx="160" cy="160" r="34" fill="rgba(10,14,31,0.85)" stroke="rgba(243,215,155,0.4)" strokeWidth="2" />
            {opened && (
              <g>
                <circle cx="160" cy="160" r="16" fill="#FFF4E6" style={{ filter: 'drop-shadow(0 0 18px #F3D79B)' }} />
                <text x="160" y="160" textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#8a6a2f">
                  ❀
                </text>
              </g>
            )}
          </svg>
          {opened && <LightBurst burstKey="clock" size={300} />}
        </div>

        <p className="text-sm tracking-widest text-champagne/80" role="status" aria-live="polite">
          {locked.filter(Boolean).length}/3 vòng đã khóa
          {activeRing !== null && !locked[activeRing] ? ' — đang xoay…' : ''}
        </p>

        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="font-display max-w-xs text-lg italic leading-8 text-champagne">
                “{blessing}”
              </p>
              <button
                type="button"
                onClick={() => {
                  sfx.sparkle();
                  onNext();
                }}
                className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
              >
                Tiếp tục →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
