import { motion } from 'framer-motion';

interface LightBurstProps {
  burstKey: number | string;
  color?: string;
  size?: number;
}

/**
 * One-shot cinematic light burst. Remount (change burstKey) to replay.
 * Parent decides when to render it.
 */
export default function LightBurst({ burstKey, color = '243,215,155', size = 220 }: LightBurstProps) {
  return (
    <motion.div
      key={burstKey}
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        x: '-50%',
        y: '-50%',
        background: `radial-gradient(circle, rgba(255,246,232,0.95) 0%, rgba(${color},0.55) 38%, rgba(${color},0) 72%)`,
      }}
      initial={{ scale: 0.15, opacity: 0 }}
      animate={{ scale: [0.15, 1.5], opacity: [0, 1, 0] }}
      transition={{ duration: 1.15, ease: 'easeOut' }}
      aria-hidden="true"
    />
  );
}
