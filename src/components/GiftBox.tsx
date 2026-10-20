import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface GiftBoxProps {
  opened: boolean;
  tilt?: boolean;
  size?: 'md' | 'lg';
  distant?: boolean;
  ribbonLoose?: boolean;
  lidGlow?: boolean;
  reducedMotion?: boolean;
  /** Live bow pull (px) while the visitor drags the bow — 0 when released. */
  bowPull?: number;
}

function Filigree({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" preserveAspectRatio="none">
      <g fill="none" stroke="#F3D79B" strokeWidth="1.6" opacity="0.55">
        <path d="M6 94 Q6 70 26 66 Q40 63 38 48 Q36 36 24 38" />
        <path d="M94 94 Q94 70 74 66 Q60 63 62 48 Q64 36 76 38" />
        <circle cx="14" cy="86" r="2.4" fill="#F3D79B" stroke="none" opacity="0.8" />
        <circle cx="86" cy="86" r="2.4" fill="#F3D79B" stroke="none" opacity="0.8" />
        <path d="M50 94 L50 78 M44 84 L56 84" opacity="0.7" />
      </g>
    </svg>
  );
}

/**
 * Ornate hero gift box: dark lacquer body, champagne filigree, rose-gold
 * ribbon, reflective pedestal. Supports a multi-stage opening narrative
 * via distant / ribbonLoose / lidGlow / opened props.
 */
export default function GiftBox({
  opened,
  tilt = true,
  size = 'md',
  distant = false,
  ribbonLoose = false,
  lidGlow = false,
  reducedMotion = false,
  bowPull = 0,
}: GiftBoxProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rawRX = useMotionValue(0);
  const rawRY = useMotionValue(0);
  const rotateX = useSpring(rawRX, { stiffness: 140, damping: 18 });
  const rotateY = useSpring(rawRY, { stiffness: 140, damping: 18 });

  const dim = size === 'lg' ? 'h-64 w-64' : 'h-52 w-52';

  const handleMove = (e: React.PointerEvent) => {
    if (!tilt || opened) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rawRY.set(Math.max(-1, Math.min(1, px)) * 14);
    rawRX.set(Math.max(-1, Math.min(1, -py)) * 14);
  };

  const handleLeave = () => {
    rawRX.set(0);
    rawRY.set(0);
  };

  const floatAnim = reducedMotion ? { y: 0 } : { y: [0, -12, 0] };

  return (
    <div
      ref={wrapRef}
      className={`relative ${dim}`}
      style={{ perspective: 900 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      aria-hidden="true"
    >
      <span className="stage-glow absolute -inset-10" />

      {/* pedestal: shadow + reflective surface */}
      <div className="absolute bottom-[-8%] left-1/2 h-[10%] w-[86%] -translate-x-1/2">
        <div className="absolute inset-0 rounded-[50%] bg-black/70 blur-md" />
        <div
          className="absolute inset-x-4 top-1/2 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(243,215,155,0.5), transparent)' }}
        />
      </div>

      <motion.div
        className="absolute inset-0"
        style={tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        initial={false}
        animate={{
          ...floatAnim,
          scale: distant ? 0.62 : 1,
          opacity: distant ? 0.75 : 1,
          y: opened ? -24 : distant ? 26 : floatAnim.y,
        }}
        transition={
          opened || distant
            ? { duration: 1.1, ease: 'easeInOut' }
            : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Expanding light burst on open */}
        <motion.div
          className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,244,230,0.95) 0%, rgba(243,215,155,0.75) 35%, rgba(243,215,155,0) 70%)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={opened ? { scale: [0, 2.8], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />

        {/* Box body: dark lacquer */}
        <div
          className="absolute bottom-2 left-1/2 h-[46%] w-[68%] -translate-x-1/2 rounded-[6px] border border-rosegold/50 shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
          style={{
            background:
              'linear-gradient(160deg, #232c4e 0%, #141a30 30%, #0a0e1f 70%, #060912 100%)',
          }}
        >
          {/* lacquer sheen */}
          <div
            className="absolute inset-0 rounded-[6px]"
            style={{
              background:
                'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 28%, transparent 72%, rgba(243,215,155,0.08) 100%)',
            }}
          />
          <Filigree className="absolute inset-0 h-full w-full" />
          {/* moving highlight */}
          {!reducedMotion && (
            <motion.div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-champagne/15 to-transparent"
              animate={opened || distant ? { opacity: 0 } : { x: ['-40%', '260%'] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          {/* vertical ribbon */}
          <motion.div
            className="absolute inset-y-0 left-1/2 w-[14%] -translate-x-1/2 bg-gradient-to-b from-rose via-rosedeep to-rose/80"
            animate={ribbonLoose ? { opacity: 0.35 } : { opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* light seeping through the lid */}
        <motion.div
          className="absolute left-1/2 top-[44%] h-[3%] w-[70%] -translate-x-1/2 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,240,210,0.95), transparent)',
            filter: 'blur(3px)',
          }}
          initial={{ opacity: 0 }}
          animate={lidGlow && !opened ? { opacity: [0.25, 0.9, 0.25] } : { opacity: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Lid */}
        <motion.div
          className="absolute left-1/2 top-[30%] h-[16%] w-[76%] -translate-x-1/2 rounded-[6px] border border-rosegold/60 shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
          style={{
            background:
              'linear-gradient(160deg, #2b3558 0%, #161c34 55%, #0a0e1f 100%)',
          }}
          initial={false}
          animate={
            opened
              ? { y: -150, rotate: -24, opacity: 0 }
              : { y: 0, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 1, ease: 'easeIn' }}
        >
          <div className="absolute inset-y-0 left-1/2 w-[13%] -translate-x-1/2 bg-gradient-to-b from-rose via-rosedeep to-rose/80" />
          <div
            className="absolute inset-x-3 top-1 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
          />
        </motion.div>

        {/* Bow */}
        <motion.div
          className="absolute left-1/2 top-[22%]"
          initial={false}
          animate={
            opened
              ? { y: -170, opacity: 0, rotate: 30 }
              : ribbonLoose
                ? { y: 34, opacity: 0.85, rotate: 14 }
                : { y: bowPull, opacity: 1, rotate: bowPull * 0.12 }
          }
          transition={
            bowPull > 0 && !opened && !ribbonLoose
              ? { duration: 0.08, ease: 'easeOut' }
              : { duration: 1, ease: 'easeInOut' }
          }
        >
          <div className="relative h-10 w-24 -translate-x-1/2">
            <div className="absolute left-1 top-1 h-8 w-10 -rotate-[24deg] rounded-[50%] border-2 border-rosedeep bg-rose/90" />
            <div className="absolute right-1 top-1 h-8 w-10 rotate-[24deg] rounded-[50%] border-2 border-rosedeep bg-rose/90" />
            <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-champagne to-rosegold shadow" />
            <div className="absolute left-1/2 top-6 h-7 w-2 -translate-x-[90%] rotate-[14deg] bg-rosedeep/90" />
            <div className="absolute left-1/2 top-6 h-7 w-2 -translate-x-[10%] -rotate-[14deg] bg-rosedeep/90" />
          </div>
        </motion.div>

        {/* Warm glow from inside once opened */}
        <motion.div
          className="absolute bottom-2 left-1/2 h-[46%] w-[68%] -translate-x-1/2 rounded-[6px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(255,244,230,0.9), rgba(243,215,155,0.35) 60%, transparent 80%)',
          }}
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        />
      </motion.div>
    </div>
  );
}
